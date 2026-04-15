import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../utils/socket.js';
import {
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const statusColors = {
  waiting: 'warning',
  serving: 'success',
  completed: 'default',
  skipped: 'error',
};

function QueueStatusPage() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const customerRes = await axios.get(`/api/customer/${customerId}`);
      setCustomer(customerRes.data);

      if (customerRes.data) {
        const queueRes = await axios.get(
          `/api/queue/${customerRes.data.queueId}`
        );
        setQueue(queueRes.data);
      }
      setError('');
    } catch (err) {
      setError('Could not fetch your status. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (customer?.queueId) {
      socket.connect();
      socket.emit('join-queue-room', customer.queueId);

      const handleQueueUpdate = () => {
        console.log('Queue updated event received!');
        fetchData();
      };

      socket.on('queue-updated', handleQueueUpdate);

      return () => {
        socket.off('queue-updated', handleQueueUpdate);
        socket.disconnect();
      };
    }
  }, [customer?.queueId, fetchData]);

  if (loading) {
    return <Typography>Loading your status...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!customer || !queue) {
    return <Alert severity="warning">Could not find customer or queue information.</Alert>;
  }
  
  if (customer.status === 'serving') {
    return (
        <Card sx={{ bgcolor: 'success.light', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <CardContent>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.dark' }} />
                <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                    It's Your Turn!
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                    Please proceed to the counter.
                </Typography>
            </CardContent>
        </Card>
    );
  }

  if (customer.status === 'completed') {
    return (
        <Card sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <CardContent>
                <ThumbUpIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Service Complete
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: 'text.secondary' }}>
                    Thank you for using WaitLess!
                </Typography>
            </CardContent>
        </Card>
    );
  }

  if (customer.status === 'skipped') {
    return (
        <Card sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <CardContent>
                <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                    You Were Skipped
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: 'text.secondary' }}>
                    Please contact the counter for assistance.
                </Typography>
            </CardContent>
        </Card>
    );
  }

  const peopleAhead = customer.position - 1;
  const progress = queue.totalCustomers > 0 ? ((queue.totalCustomers - peopleAhead) / queue.totalCustomers) * 100 : 0;
  const estimatedWait = peopleAhead * (queue.avgServiceTime || 5);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={3} >
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="overline">Your Token</Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 700 }}>
                {customer.tokenNumber}
              </Typography>
              <Chip label={customer.status} color={statusColors[customer.status]} />
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 8, borderRadius: 5 }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                Position #{customer.position} — {peopleAhead < 0 ? 0 : peopleAhead} people ahead of you
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} container direction="column" spacing={3}>
            <Grid>
                <Card sx={{p: 2}}>
                    <CardContent>
                        <Typography variant="overline">Estimated Wait</Typography>
                        <Typography variant="h3" sx={{fontWeight: 700}}>
                            ~{estimatedWait} mins
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid>
                <Card sx={{p: 2}}>
                    <CardContent>
                        <Typography variant="overline">Queue Info</Typography>
                        <Typography variant="h6">{queue.name}</Typography>
                        <Typography variant="body2" color="text.secondary">Avg. {queue.avgServiceTime} mins per person</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid>
                <Alert severity="info">You'll be notified when you're close. You can safely leave this page.</Alert>
            </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default QueueStatusPage;
