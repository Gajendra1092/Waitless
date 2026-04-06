import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import QueueStatusPage from './pages/QueueStatusPage';
import DashboardPage from './pages/DashboardPage';
import DisplayPage from './pages/DisplayPage';
import LandingPage from './pages/LandingPage';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/join/:queueId" element={<JoinPage />} />
        <Route path="/status/:customerId" element={<QueueStatusPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/display/:queueId" element={<DisplayPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;


