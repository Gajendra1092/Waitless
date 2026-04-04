import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import QueueStatusPage from './pages/QueueStatusPage';
import DashboardPage from './pages/DashboardPage';
import DisplayPage from './pages/DisplayPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/join/:queueId" element={<JoinPage />} />
        <Route path="/status/:customerId" element={<QueueStatusPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/display/:queueId" element={<DisplayPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;


