import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Drawer,
  Skeleton,
} from "@mui/material";
import {
  QueuePlayNext as QueueIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import api from "../utils/api";
import { useProfileStore } from "../store/useProfileStore";

const DRAWER_WIDTH = 240;

const Sidebar = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const navItems = [
    { label: "Queue", icon: <QueueIcon />, path: "/dashboard" },
    { label: "Analytics", icon: <AnalyticsIcon />, path: "/dashboard/analytics" },
    { label: "Settings", icon: <SettingsIcon />, path: "/dashboard/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/business/logout");
    } catch (err) {
      console.error("Logout error:", err.message);
    }
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", py: 2 }}>
      <Box sx={{ px: 2.5, mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
          Waitless
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: "#8a8a8a" }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: "8px",
                py: 1,
                px: 1.5,
                backgroundColor: isActive(item.path) ? "#2a2a35" : "transparent",
                color: isActive(item.path) ? "#ffffff" : "#8a8a8a",
                "&:hover": {
                  backgroundColor: isActive(item.path) ? "#2a2a35" : "#1e1e28",
                  color: "#ffffff",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36, "& .MuiSvgIcon-root": { fontSize: 20 } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: isActive(item.path) ? 600 : 400 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: "#2a2a35", mx: 2 }} />
      <Box sx={{ px: 2, pt: 2, pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        {profile ? (
          <>
            <Avatar
              src={profile.avatar}
              sx={{ width: 36, height: 36, bgcolor: "#2a2a35", color: "#ffffff", fontSize: "0.875rem", fontWeight: 600 }}
            >
              {!profile.avatar && profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#e0e0e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8a8a8a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                {profile.email}
              </Typography>
            </Box>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small" sx={{ color: "#8a8a8a", "&:hover": { color: "#ef4444" } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="80%" height={18} />
              <Skeleton variant="text" width="60%" height={14} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;