import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Divider,
  useMediaQuery,
  AppBar,
  Toolbar,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  QueuePlayNext as QueueIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

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

const DRAWER_WIDTH = 240;
const WS_URL = "ws://localhost:8080/queue-updates";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========================
// STATUS HELPERS
// ========================
const getStatusFromCount = (count, currentStatus) => {
  if (currentStatus === "paused") return "paused";
  if (currentStatus === "ended") return "ended";
  if (count > 0) return "running";
  return "no customers";
};

const getStatusChip = (status) => {
  const config = {
    running: { color: "#22c55e", bg: "#22c55e20", label: "Running" },
    "no customers": {
      color: "#f59e0b",
      bg: "#f59e0b20",
      label: "No Customers",
    },
    paused: { color: "#8a8a8a", bg: "#8a8a8a20", label: "Paused" },
    ended: { color: "#ef4444", bg: "#ef444420", label: "Ended" },
  };
  const c = config[status] || config["no customers"];
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{
        color: c.color,
        backgroundColor: c.bg,
        border: `1px solid ${c.color}30`,
        fontWeight: 500,
      }}
    />
  );
};

// ========================
// MOCK DATA
// ========================
const MOCK_QUEUES = [
  {
    id: 1,
    name: "General Queue",
    status: "running",
    customers: 12,
    category: "General",
  },
  {
    id: 2,
    name: "VIP Lounge",
    status: "running",
    customers: 5,
    category: "VIP",
  },
  {
    id: 3,
    name: "Support Desk",
    status: "no customers",
    customers: 0,
    category: "Support",
  },
  {
    id: 4,
    name: "Checkout Lane 1",
    status: "running",
    customers: 8,
    category: "General",
  },
  {
    id: 5,
    name: "Checkout Lane 2",
    status: "paused",
    customers: 3,
    category: "General",
  },
];

const MOCK_CATEGORIES = ["General", "VIP", "Support"];

const MOCK_PROFILE = {
  name: "John Doe",
  email: "john.doe@waitless.com",
  avatar: null,
};

// ========================
// SIDEBAR COMPONENT
// ========================
const Sidebar = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/api/business/profile");
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
      setProfile(MOCK_PROFILE);
    }
  };

  const navItems = [
    { label: "Queue", icon: <QueueIcon />, path: "/" },
    { label: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
    { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
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
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const drawerContent = (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", py: 2 }}
    >
      <Box
        sx={{
          px: 2.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
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
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 36,
                  "& .MuiSvgIcon-root": { fontSize: 20 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: "#2a2a35", mx: 2 }} />
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {profile ? (
          <>
            <Avatar
              src={profile.avatar}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#2a2a35",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {!profile.avatar && profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "?"}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#e0e0e0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#8a8a8a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                }}
              >
                {profile.email}
              </Typography>
            </Box>
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{ color: "#8a8a8a", "&:hover": { color: "#ef4444" } }}
              >
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
      sx={{
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

// ========================
// QUEUE PAGE COMPONENT
// ========================
const QueuePage = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, queue: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    category: "",
    detail: "",
  });
  const [createFormErrors, setCreateFormErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const ROWS_PER_PAGE = 5;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/queue/categories");
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err.message);
      setCategories(MOCK_CATEGORIES);
      setSnackbar({
        open: true,
        message: "Using fallback categories because categories API failed.",
        severity: "warning",
      });
    }
  };

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ROWS_PER_PAGE,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      };

      const { data } = await api.get("/api/queue/getqueues", { params });
      const queueRows = Array.isArray(data.queues) ? data.queues : [];
      setQueues(queueRows);
      setTotalPages(
        data.totalPages || Math.ceil((data.total || queueRows.length) / ROWS_PER_PAGE) || 1
      );
    } catch (err) {
      console.error("Failed to fetch queues:", err.message);
      let filtered = [...MOCK_QUEUES];

      if (searchQuery) {
        filtered = filtered.filter((q) =>
          q.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (statusFilter !== "all") {
        filtered = filtered.filter((q) => q.status === statusFilter);
      }
      if (categoryFilter !== "all") {
        filtered = filtered.filter((q) => q.category === categoryFilter);
      }

      const total = filtered.length;
      const start = (page - 1) * ROWS_PER_PAGE;
      const end = start + ROWS_PER_PAGE;

      setQueues(filtered.slice(start, end));
      setTotalPages(Math.max(1, Math.ceil(total / ROWS_PER_PAGE)));
      setSnackbar({
        open: true,
        message: "Queue API failed. Showing fallback data.",
        severity: "warning",
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected");
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.queueId && typeof data.customers === "number") {
              setQueues((prev) =>
                prev.map((q) => {
                  if (q.id === data.queueId) {
                    const newStatus = getStatusFromCount(data.customers, q.status);
                    return { ...q, customers: data.customers, status: newStatus };
                  }
                  return q;
                })
              );
            }
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected. Reconnecting in 5s...");
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };
      } catch (err) {
        console.error("WebSocket connection failed:", err);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowClick = (queueId) => {
    navigate(`/dashboard/queue/${queueId}`);
  };

  const handlePauseResume = async (queue) => {
    const isPaused = queue.status === "paused";

    try {
      const { data } = await api.patch(`/api/queue/pause/${queue.id}`);

      setQueues((prev) =>
        prev.map((q) =>
          q.id === queue.id
            ? { ...q, status: data?.queue?.status || (isPaused ? getStatusFromCount(q.customers, "running") : "paused") }
            : q
        )
      );

      setSnackbar({
        open: true,
        message: `Queue "${queue.name}" ${isPaused ? "resumed" : "paused"} successfully`,
        severity: "success",
      });
    } catch (err) {
      console.error("Pause/Resume failed:", err.message);
      setSnackbar({
        open: true,
        message: `Failed to ${isPaused ? "resume" : "pause"} "${queue.name}"`,
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (queue) => {
    setDeleteDialog({ open: true, queue });
  };

  const handleDeleteConfirm = async () => {
    const queue = deleteDialog.queue;
    if (!queue) return;

    try {
      await api.delete(`/api/queue/delete/${queue.id}`);
      removeQueueFromState(queue);
    } catch (err) {
      console.error("Delete failed:", err.message);
      setSnackbar({
        open: true,
        message: `Failed to delete "${queue.name}"`,
        severity: "error",
      });
    } finally {
      setDeleteDialog({ open: false, queue: null });
    }
  };

  const removeQueueFromState = (queue) => {
    setQueues((prev) => {
      const updated = prev.filter((q) => q.id !== queue.id);
      if (updated.length === 0 && page > 1) {
        setPage((p) => p - 1);
      }
      return updated;
    });

    setSnackbar({
      open: true,
      message: `Queue "${queue.name}" deleted successfully`,
      severity: "success",
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, queue: null });
  };

  const handleCreateDialogOpen = () => {
    setCreateForm({ name: "", category: "", detail: "" });
    setCreateFormErrors({});
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    if (createLoading) return;
    setCreateDialogOpen(false);
    setCreateForm({ name: "", category: "", detail: "" });
    setCreateFormErrors({});
  };

  const handleCreateFormChange = (field) => (e) => {
    setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (createFormErrors[field]) {
      setCreateFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCreateQueue = async () => {
    const errors = {};

    if (!createForm.name.trim()) {
      errors.name = "Queue name is required";
    }

    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }

    setCreateLoading(true);

    try {
      const payload = {
        name: createForm.name.trim(),
        ...(createForm.category.trim() && { category: createForm.category.trim() }),
        ...(createForm.detail.trim() && { detail: createForm.detail.trim() }),
      };

      await api.post("/api/queue/create", payload);

      setSnackbar({
        open: true,
        message: `Queue "${createForm.name.trim()}" created successfully`,
        severity: "success",
      });

      setCreateDialogOpen(false);
      setCreateForm({ name: "", category: "", detail: "" });
      setCreateFormErrors({});

      fetchQueues();
      fetchCategories();
    } catch (err) {
      console.error("Create queue failed:", err.message);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create queue. Please try again.";

      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "#8a8a8a", display: "block", mb: 0.5 }}
          >
            {"🏠 "}Dashboard {" > "} Queue
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Queue
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
          sx={{
            bgcolor: "#ffffff",
            color: "#111118",
            fontWeight: 600,
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#e0e0e0" },
          }}
        >
          Create Queue
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <Box sx={{ flex: "1 1 300px", minWidth: 200 }}>
          <Typography
            variant="caption"
            sx={{ color: "#8a8a8a", mb: 0.5, display: "block" }}
          >
            Search for queue
          </Typography>
          <TextField
            placeholder="Search"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#8a8a8a", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "#1e1e28",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>

        <Box sx={{ minWidth: 160 }}>
          <Typography
            variant="caption"
            sx={{ color: "#8a8a8a", mb: 0.5, display: "block" }}
          >
            Status
          </Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={statusFilter}
              onChange={handleStatusFilter}
              sx={{ bgcolor: "#1e1e28", fontSize: "0.875rem" }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="no customers">No Customers</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="ended">Ended</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 160 }}>
          <Typography
            variant="caption"
            sx={{ color: "#8a8a8a", mb: 0.5, display: "block" }}
          >
            Category
          </Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              sx={{ bgcolor: "#1e1e28", fontSize: "0.875rem" }}
            >
              <MenuItem value="all">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: "#16161e",
          border: "1px solid #2a2a35",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a24" }}>
              <TableCell>Queue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Customers</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(ROWS_PER_PAGE)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={80} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={30} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : queues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: "#8a8a8a" }}>
                    No queues found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              queues.map((queue) => (
                <TableRow
                  key={queue.id}
                  onClick={() => handleRowClick(queue.id)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#1a1a24" },
                    transition: "background-color 0.15s",
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#e0e0e0" }}
                    >
                      {queue.name}
                    </Typography>
                    {queue.category && (
                      <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                        {queue.category}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(queue.status)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: queue.customers > 0 ? "#22c55e" : "#8a8a8a",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {queue.customers}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      <Tooltip title={queue.status === "paused" ? "Resume" : "Pause"}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePauseResume(queue);
                          }}
                          disabled={queue.status === "ended"}
                          sx={{
                            color: queue.status === "paused" ? "#22c55e" : "#f59e0b",
                            "&:hover": {
                              bgcolor: queue.status === "paused" ? "#22c55e15" : "#f59e0b15",
                            },
                          }}
                        >
                          {queue.status === "paused" ? (
                            <PlayArrowIcon fontSize="small" />
                          ) : (
                            <PauseIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(queue);
                          }}
                          sx={{ color: "#ef4444", "&:hover": { bgcolor: "#ef444415" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#8a8a8a",
                borderColor: "#2a2a35",
                "&.Mui-selected": { bgcolor: "#2a2a35", color: "#ffffff" },
                "&:hover": { bgcolor: "#1e1e28" },
              },
            }}
          />
        </Box>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: "#16161e",
            border: "1px solid #2a2a35",
            borderRadius: "16px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#2a2a35",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QueueIcon sx={{ color: "#ffffff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#ffffff", fontWeight: 600, lineHeight: 1.2 }}
              >
                Create Queue
              </Typography>
              <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                Add a new queue to your dashboard
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCreateDialogClose}
            disabled={createLoading}
            size="small"
            sx={{ color: "#8a8a8a", "&:hover": { color: "#ffffff", bgcolor: "#2a2a35" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: "#2a2a35" }} />

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "#e0e0e0", mb: 0.75, fontWeight: 500 }}
              >
                Queue Name <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                placeholder="e.g. General Queue, VIP Lounge"
                size="small"
                fullWidth
                value={createForm.name}
                onChange={handleCreateFormChange("name")}
                error={!!createFormErrors.name}
                helperText={createFormErrors.name}
                disabled={createLoading}
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: "#1e1e28",
                    fontSize: "0.875rem",
                  },
                  "& .MuiFormHelperText-root": { color: "#ef4444", ml: 0.5 },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ color: "#e0e0e0", mb: 0.75, fontWeight: 500 }}
              >
                Category
              </Typography>
              <TextField
                placeholder="e.g. General, VIP, Support"
                size="small"
                fullWidth
                value={createForm.category}
                onChange={handleCreateFormChange("category")}
                disabled={createLoading}
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: "#1e1e28",
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ color: "#e0e0e0", mb: 0.75, fontWeight: 500 }}
              >
                Details
              </Typography>
              <TextField
                placeholder="Describe this queue (optional)"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={createForm.detail}
                onChange={handleCreateFormChange("detail")}
                disabled={createLoading}
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: "#1e1e28",
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: "#2a2a35" }} />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleCreateDialogClose}
            disabled={createLoading}
            sx={{
              color: "#8a8a8a",
              px: 3,
              "&:hover": { bgcolor: "#2a2a35", color: "#e0e0e0" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateQueue}
            variant="contained"
            disabled={createLoading}
            sx={{
              bgcolor: "#ffffff",
              color: "#111118",
              fontWeight: 600,
              px: 3,
              "&:hover": { bgcolor: "#e0e0e0" },
              "&:disabled": { bgcolor: "#3a3a45", color: "#8a8a8a" },
            }}
          >
            {createLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} sx={{ color: "#8a8a8a" }} />
                Creating...
              </Box>
            ) : (
              "Create Queue"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: "#1e1e28",
            border: "1px solid #2a2a35",
            borderRadius: "12px",
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff", fontWeight: 600 }}>
          Delete Queue
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#8a8a8a" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#e0e0e0" }}>
              "{deleteDialog.queue?.name}"
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: "#8a8a8a", "&:hover": { bgcolor: "#2a2a35" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              bgcolor: "#ef4444",
              color: "#ffffff",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ========================
// ANALYTICS PAGE
// ========================
const AnalyticsPage = () => (
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
    <AnalyticsIcon sx={{ fontSize: 64, color: "#2a2a35" }} />
    <Typography variant="h5" sx={{ color: "#8a8a8a", fontWeight: 600 }}>
      Analytics
    </Typography>
    <Typography variant="body2" sx={{ color: "#555" }}>
      Coming Soon
    </Typography>
  </Box>
);

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
const App = () => {
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
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
