import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
  IconButton,
  useMediaQuery,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import AnalyticsPage from "./AnalyticsPage";
import Sidebar from "../components/Sidebar";
import QueuePage from "../components/QueuePage";

// ========================
// THEME
// ========================
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#111118",
      paper: "#16161e",
    },
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#8a8a8a",
    },
    divider: "#2a2a35",
    text: {
      primary: "#e0e0e0",
      secondary: "#8a8a8a",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#111118",
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a35 #111118",
        },
        "*::-webkit-scrollbar": { width: "6px" },
        "*::-webkit-scrollbar-track": { background: "#111118" },
        "*::-webkit-scrollbar-thumb": {
          background: "#2a2a35",
          borderRadius: "3px",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#16161e",
          borderRight: "1px solid #2a2a35",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #2a2a35", padding: "12px 16px" },
        head: {
          fontWeight: 600,
          color: "#8a8a8a",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: "8px" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a2a35" },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3a3a45",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#5a5a65",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: "8px" } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: "6px", fontWeight: 500, fontSize: "0.75rem" },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#8a8a8a",
          "&.Mui-selected": { backgroundColor: "#2a2a35", color: "#ffffff" },
        },
      },
    },
  },
});

// ========================
// SETTINGS PAGE
// ========================
const SettingsPage = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <SettingsIcon sx={{ fontSize: 64, color: "#2a2a35" }} />
    <Typography variant="h5" sx={{ color: "#8a8a8a", fontWeight: 600 }}>
      Settings
    </Typography>
    <Typography variant="body2" sx={{ color: "#555" }}>
      Coming Soon
    </Typography>
  </Box>
);

// ========================
// MAIN APP COMPONENT
// ========================
const DashboardPage = () => {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

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
            <Routes>
              <Route path="/" element={<QueuePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardPage;
