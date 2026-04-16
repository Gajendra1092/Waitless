import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';

const JoinPage = lazy(() => import('./pages/JoinPage'));
const QueueStatusPage = lazy(() => import('./pages/QueueStatusPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DisplayPage = lazy(() => import('./pages/DisplayPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

const FallbackLoader = () => (
  <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#111118' }}>
    <CircularProgress sx={{ color: '#00E5FF' }} />
  </Box>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          <Route path="/join/:queueId" element={<JoinPage />} />
          <Route path="/status/:customerId" element={<QueueStatusPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
          <Route path="/display/:queueId" element={<DisplayPage />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
