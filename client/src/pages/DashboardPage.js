import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { socket } from '../socket';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  CssBaseline,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import MenuIcon from '@mui/icons-material/Menu';
import QueueIcon from '@mui/icons-material/Queue';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InboxIcon from '@mui/icons-material/Inbox';
import PhoneIcon from '@mui/icons-material/Phone';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StatCard from '../components/StatCard';

const drawerWidth = 240;

function DashboardPage(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);

  const queueId = process.env.REACT_APP_QUEUE_ID;

  const fetchData = useCallback(async () => {
    if (!queueId) {
      setError("Queue ID is not configured.");
      setLoading(false);
      return;
    }
    try {
      setLoading(customers.length === 0);
      const [customersRes, queueRes] = await Promise.all([
        axios.get(`/api/queue/${queueId}/customers`),
        axios.get(`/api/queue/${queueId}`),
      ]);
      setCustomers(customersRes.data);
      setQueue(queueRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [queueId, customers.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (queueId) {
      socket.connect();
      socket.emit('join-queue-room', queueId);
      const handleQueueUpdate = () => {
        fetchData();
      };
      socket.on('queue-updated', handleQueueUpdate);
      return () => {
        socket.off('queue-updated', handleQueueUpdate);
        socket.disconnect();
      };
    }
  }, [queueId, fetchData]);

  const { waitingCustomers, servingCustomer, stats } = useMemo(() => {
    const waiting = customers.filter(c => c.status === 'waiting').sort((a,b) => a.position - b.position);
    const serving = customers.find(c => c.status === 'serving') || null;
    const completedToday = customers.filter(c => c.status === 'completed' && new Date(c.servedAt).toDateString() === new Date().toDateString()).length;
    return {
      waitingCustomers: waiting,
      servingCustomer: serving,
      stats: {
        waitingCount: waiting.length,
        servingCustomerName: serving ? `${serving.name} (#${serving.tokenNumber})` : 'None',
        completedTodayCount: completedToday,
        avgWaitTime: queue?.avgServiceTime || 0,
      }
    };
  }, [customers, queue]);

  const handleDrawerToggle = () => { setMobileOpen(!mobileOpen); };
  
  const handleApiCall = async (apiCall) => {
    setButtonLoading(true);
    try {
      await apiCall();
    } catch (err) {
      console.error("API call failed", err);
      setError("An action failed. Please check the console.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleCallNext = () => handleApiCall(() => axios.patch(`/api/customer/${waitingCustomers[0]._id}/call`));
  const handleComplete = () => handleApiCall(() => axios.patch(`/api/customer/${servingCustomer._id}/complete`));
  const handleSkip = () => handleApiCall(() => axios.patch(`/api/customer/${servingCustomer._id}/skip`));
  const handleCallCustomer = (customerId) => handleApiCall(() => axios.patch(`/api/customer/${customerId}/call`));
  const handleSkipCustomer = (customerId) => handleApiCall(() => axios.patch(`/api/customer/${customerId}/skip`));

  const drawer = (
    <div>
      <Toolbar><Typography variant="h6" noWrap>{queue?.name || 'WaitLess'}</Typography></Toolbar>
      <List>
        <ListItem disablePadding><ListItemButton selected><ListItemIcon><QueueIcon /></ListItemIcon><ListItemText primary="Queue" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton><ListItemIcon><BarChartIcon /></ListItemIcon><ListItemText primary="Analytics" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton><ListItemIcon><SettingsIcon /></ListItemIcon><ListItemText primary="Settings" /></ListItemButton></ListItem>
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  const renderContent = () => {
    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{m:2}}>{error}</Alert>;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Waiting" value={stats.waitingCount} icon={<PeopleIcon color="action" />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Currently Serving" value={stats.servingCustomerName} icon={<PersonIcon color="success" />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Avg. Wait Time (mins)" value={stats.avgWaitTime} icon={<AccessTimeIcon color="action" />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Completed Today" value={stats.completedTodayCount} icon={<CheckCircleIcon color="action" />} /></Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderLeft: "4px solid", borderColor: "success.main", height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent><Typography variant="h6">Currently Serving</Typography>
              {servingCustomer ? (
                <Box sx={{textAlign: 'center', mt: 2}}><Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>{servingCustomer.tokenNumber}</Typography><Typography variant="h5">{servingCustomer.name}</Typography></Box>
              ) : (
                <Typography sx={{ mt: 2, textAlign: 'center' }}>No one is being served.</Typography>
              )}
            </CardContent>
            <CardActions sx={{p:2, mt: 'auto'}}>
              {!servingCustomer ? (
                <LoadingButton variant="contained" color="primary" onClick={handleCallNext} loading={buttonLoading} disabled={waitingCustomers.length === 0} fullWidth>Call Next</LoadingButton>
              ) : (
                <Box sx={{display: 'flex', gap: 1, width: '100%'}}>
                  <LoadingButton variant="contained" color="success" onClick={handleComplete} loading={buttonLoading} fullWidth>Complete</LoadingButton>
                  <LoadingButton variant="outlined" color="warning" onClick={handleSkip} loading={buttonLoading} fullWidth>Skip</LoadingButton>
                </Box>
              )}
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Paper sx={{p: 2, height: '100%'}}>
            <Typography variant="h6" gutterBottom>Waiting List</Typography>
            {waitingCustomers.length > 0 ? (
              <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead><TableRow><TableCell>Pos</TableCell><TableCell>Token</TableCell><TableCell>Name</TableCell><TableCell>Est. Wait</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                  <TableBody>
                    {waitingCustomers.map((c) => (
                      <TableRow key={c._id} hover>
                        <TableCell>{c.position}</TableCell><TableCell>#{c.tokenNumber}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.position * stats.avgWaitTime} min</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Call this customer"><IconButton size="small" onClick={() => handleCallCustomer(c._id)} disabled={!!servingCustomer}><PhoneIcon /></IconButton></Tooltip>
                          <Tooltip title="Skip this customer"><IconButton size="small" onClick={() => handleSkipCustomer(c._id)}><SkipNextIcon /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <InboxIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>No customers waiting</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}><MenuIcon /></IconButton>
          <Typography variant="h6" noWrap component="div">Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}><Drawer container={container} variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>{drawer}</Drawer><Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>{drawer}</Drawer></Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}><Toolbar />{renderContent()}</Box>
    </Box>
  );
}

export default DashboardPage;