import React, { useState, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Typography,
  IconButton,
  useMediaQuery,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";

const AnalyticsPage = lazy(() => import("./AnalyticsPage"));
const QueuePage = lazy(() => import("./QueuePage"));
const SettingsPage = lazy(() => import("./SettingsPage"));
const QueueDetailsPage = lazy(() => import("./QueueDetailsPage"));

// MAIN APP COMPONENT

const DashboardPage = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <CssBaseline /> {/* This can remain to apply baseline styles */}
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: 'background.default' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isMobile && (
            <AppBar
              position="sticky"
              elevation={0}
              sx={{ bgcolor: "#111118", borderBottom: "1px solid #2a2a35" }}
            >
              <Toolbar sx={{ minHeight: "56px !important" }}>
                <IconButton
                  edge="start"
                  onClick={() => setSidebarOpen(true)}
                  sx={{ color: "#e0e0e0", mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#ffffff" }}
                >
                  Waitless
                </Typography>
              </Toolbar>
            </AppBar>
          )}

          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <Suspense fallback={<Box sx={{ display: 'flex', p: 4, justifyContent: 'center' }}><CircularProgress /></Box>}>
              <Routes>
                <Route path="/" element={<QueuePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="queue/:queueId" element={<QueueDetailsPage />} />
              </Routes>
            </Suspense>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;
