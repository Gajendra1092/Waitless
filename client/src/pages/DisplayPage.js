import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../utils/socket.js';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  AppBar,
  Box,
  Card,
  Chip,
  CssBaseline,
  Grid,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import LiveClock from '../components/LiveClock';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 900 },
    h4: { fontWeight: 700 },
  },
});

function DisplayPage() {
  const { queueId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  const fetchData = useCallback(async () => {
    try {
      const [customersRes, queueRes] = await Promise.all([
        axios.get(`/api/queue/${queueId}/customers`),
        axios.get(`/api/queue/${queueId}`),
      ]);
      setCustomers(customersRes.data);
      setQueue(queueRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch display data. Is the queue ID correct?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleQueueUpdate = () => fetchData();

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('queue-updated', handleQueueUpdate);

    socket.connect();
    socket.emit('join-queue-room', queueId);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('queue-updated', handleQueueUpdate);
      socket.disconnect();
    };
  }, [queueId, fetchData]);

  const { servingCustomer, upcomingCustomers, stats } = useMemo(() => {
    const waiting = customers.filter(c => c.status === 'waiting').sort((a,b) => a.position - b.position);
    const serving = customers.find(c => c.status === 'serving') || null;
    return {
      servingCustomer: serving,
      upcomingCustomers: waiting.slice(0, 4),
      stats: {
        waiting: waiting.length,
        avgWait: queue?.avgServiceTime || 0,
      }
    };
  }, [customers, queue]);

  const joinUrl = `${window.location.origin}/join/${queueId}`;

  if (loading) {
    return <ThemeProvider theme={darkTheme}><CssBaseline /><Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}><CircularProgress /></Box></ThemeProvider>;
  }
  
  if (error) {
    return <ThemeProvider theme={darkTheme}><CssBaseline /><Alert severity="error" sx={{m:4}}>{error}</Alert></ThemeProvider>;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {queue.name}
            </Typography>
            <LiveClock />
          </Toolbar>
        </AppBar>

        <Box sx={{ textAlign: 'center', my: { xs: 2, md: 6 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="overline" color="primary" sx={{ letterSpacing: 8 }}>
            NOW SERVING
          </Typography>
          {servingCustomer ? (
            <>
              <Typography sx={{ fontSize: { xs: '5rem', md: '10rem' }, lineHeight: 1 }}>
                {servingCustomer.tokenNumber}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {servingCustomer.name}
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: { xs: '4rem', md: '8rem' }, lineHeight: 1.2, color: 'grey.700' }}>
              -
            </Typography>
          )}
        </Box>

        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          {upcomingCustomers.map((customer) => (
            <Grid key={customer.tokenNumber} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">#{customer.tokenNumber}</Typography>
                <Typography variant="body2" color="text.secondary">{customer.name}</Typography>
                <Chip label={`#${customer.position}`} size="small" sx={{ mt: 1 }} />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'grey.800',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography>Waiting: {stats.waiting}</Typography>
            <Typography>Avg. Wait: {stats.avgWait} mins</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Scan QR to join
            </Typography>
            <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 1, display: 'flex' }}>
              <QRCodeSVG value={joinUrl} size={100} fgColor="#000000" bgColor="#ffffff" />
            </Box>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={!isConnected}
        message="Reconnecting..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}

export default DisplayPage;