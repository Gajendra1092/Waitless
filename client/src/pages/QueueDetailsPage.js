// QueueDetailsPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
  Tooltip,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  Fade,
  Grow,
  Slide,
  Switch,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  SkipNext as SkipNextIcon,
  Phone as PhoneIcon,
  FastForward as FastForwardIcon,
  Undo as UndoIcon,
  PersonOff as PersonOffIcon,
  People as PeopleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  DoneAll as DoneAllIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { socket } from "../socket";

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
// MOCK DATA
// ========================
const MOCK_QUEUE_INFO = {
  _id: "q1",
  name: "General Queue",
  status: "running",
  category: "General",
  avgServiceTime: 8,
};

const MOCK_STATS = {
  totalWaiting: 5,
  currentlyServing: { _id: "cur1", token: 42, name: "Rahul Sharma", phone: "+91-9876543210" },
  avgWait: 8,
  completedToday: 17,
};

const MOCK_WAITING = [
  { _id: "c1", position: 1, token: 43, name: "Priya Mehta", phone: "+91-9876543211", estWait: 8, status: "waiting" },
  { _id: "c2", position: 2, token: 44, name: "Anil Verma", phone: "+91-9876543212", estWait: 16, status: "waiting" },
  { _id: "c3", position: 3, token: 45, name: "Sunita Rao", phone: "+91-9876543213", estWait: 24, status: "waiting" },
  { _id: "c4", position: 4, token: 46, name: "Deepak Joshi", phone: "+91-9876543214", estWait: 32, status: "waiting" },
  { _id: "c5", position: 5, token: 47, name: "Kavya Singh", phone: "+91-9876543215", estWait: 40, status: "waiting" },
  { _id: "c6", position: 6, token: 48, name: "Amit Patel", phone: "+91-9876543216", estWait: 48, status: "waiting" },
  { _id: "c7", position: 7, token: 49, name: "Neha Gupta", phone: "+91-9876543217", estWait: 56, status: "waiting" },
  { _id: "c8", position: 8, token: 50, name: "Ravi Kumar", phone: "+91-9876543218", estWait: 64, status: "waiting" },
];

const MOCK_SKIPPED = [
  { _id: "s1", token: 38, name: "Meera Das", phone: "+91-9876543219", position: 0 },
  { _id: "s2", token: 40, name: "Vikas Nair", phone: "+91-9876543220", position: 0 },
];

const MOCK_COMPLETED = [
  { _id: "d1", token: 35, name: "Sanjay Reddy", phone: "+91-9876543221", completedAt: "10:30 AM" },
  { _id: "d2", token: 36, name: "Pooja Iyer", phone: "+91-9876543222", completedAt: "10:38 AM" },
  { _id: "d3", token: 37, name: "Kiran Bhat", phone: "+91-9876543223", completedAt: "10:45 AM" },
  { _id: "d4", token: 39, name: "Lakshmi Pillai", phone: "+91-9876543224", completedAt: "10:53 AM" },
  { _id: "d5", token: 41, name: "Arjun Menon", phone: "+91-9876543225", completedAt: "11:01 AM" },
];

const ROWS_PER_PAGE = 5;

// ========================
// COLORS (matching dashboard)
// ========================
const COLORS = {
  bg: "#111118",
  paper: "#16161e",
  paperLight: "#1a1a24",
  border: "#2a2a35",
  borderLight: "#3a3a45",
  text: "#e0e0e0",
  textMuted: "#8a8a8a",
  textDim: "#555555",
  white: "#ffffff",
  green: "#22c55e",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  red: "#ef4444",
};

// ========================
// STAT CARD
// ========================
const StatCard = ({ icon, label, value, color, delay }) => (
  <Grow in timeout={600 + delay}>
    <Paper
      elevation={0}
      sx={{
        bgcolor: COLORS.paper,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        p: 2.5,
        flex: 1,
        minWidth: 0,
        transition: "transform 0.2s, border-color 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: COLORS.borderLight,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 18, color } })}
        </Box>
        <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h5"
        sx={{
          color,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Paper>
  </Grow>
);

// ========================
// CURRENTLY SERVING
// ========================
const CurrentlyServing = ({ customer, onComplete, onSkip, onCallNext, hasWaiting, loading, isAutoCallEnabled, onToggleAutoCall, queuePaused }) => {
  const autoCallToggle = (
    <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 1, zIndex: 10 }}>
      <Typography variant="caption" sx={{ color: isAutoCallEnabled ? COLORS.green : COLORS.textMuted, fontWeight: 600 }}>
        Auto-Call
      </Typography>
      <Switch
        size="small"
        checked={isAutoCallEnabled}
        onChange={(e) => onToggleAutoCall(e.target.checked)}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: COLORS.green },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: COLORS.green },
        }}
      />
    </Box>
  );

  if (!customer) {
    return (
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: COLORS.paper,
            border: `1px solid ${COLORS.border}`,
            borderLeft: `4px solid ${COLORS.border}`,
            borderRadius: "12px",
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: 300,
            position: "relative",
          }}
        >
          {autoCallToggle}
          <PersonOffIcon sx={{ fontSize: 56, color: COLORS.border, mb: 2 }} />
          <Typography variant="h6" sx={{ color: COLORS.textMuted, fontWeight: 600, mb: 0.5 }}>
            No one being served
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textDim }}>
            {queuePaused 
              ? "Queue is paused. Resume from dashboard to call next."
              : hasWaiting 
                ? (isAutoCallEnabled ? "Calling next customer..." : "Waiting for you to call the next customer") 
                : "Waiting for the next customer"}
          </Typography>
          {hasWaiting && (
            <Button
              variant="contained"
              onClick={onCallNext}
              disabled={loading}
              sx={{ mt: 3, bgcolor: COLORS.blue, color: COLORS.white, fontWeight: 600, px: 3, "&:hover": { bgcolor: "#2563eb" } }}
            >
              Call Next Manually
            </Button>
          )}
        </Paper>
      </Fade>
    );
  }

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={0}
        sx={{
          bgcolor: COLORS.paper,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `4px solid ${COLORS.green}`,
          borderRadius: "12px",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: 300,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {autoCallToggle}
        {/* Glow */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            left: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: `${COLORS.green}08`,
            filter: "blur(40px)",
          }}
        />

        <Typography
          variant="overline"
          sx={{ color: COLORS.green, fontWeight: 700, letterSpacing: "0.15em", mb: 1, fontSize: "0.75rem" }}
        >
          Currently Serving
        </Typography>

        <Typography
          sx={{
            color: COLORS.white,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
            mb: 1,
            fontSize: { xs: "3.5rem", md: "4.5rem" },
          }}
        >
          {customer.tokenNumber || customer.token}
        </Typography>

        <Typography variant="body1" sx={{ color: COLORS.text, fontWeight: 500, mb: 0.5 }}>
          {customer.name}
        </Typography>

        {customer.phone && (
          <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 3 }}>
            {customer.phone}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={onComplete}
            disabled={loading}
            sx={{
              bgcolor: COLORS.green,
              color: COLORS.white,
              fontWeight: 600,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#16a34a" },
              "&:disabled": { bgcolor: COLORS.borderLight, color: COLORS.textMuted },
            }}
          >
            Complete
          </Button>
          <Button
            variant="outlined"
            startIcon={<SkipNextIcon />}
            onClick={onSkip}
            disabled={loading}
            sx={{
              color: COLORS.amber,
              borderColor: `${COLORS.amber}50`,
              fontWeight: 600,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: `${COLORS.amber}15`, borderColor: COLORS.amber },
              "&:disabled": { borderColor: COLORS.borderLight, color: COLORS.textMuted },
            }}
          >
            Skip
          </Button>
        </Box>
      </Paper>
    </Fade>
  );
};

// ========================
// TOKEN CHIP
// ========================
const TokenChip = ({ token, color = COLORS.green }) => (
  <Chip
    label={`#${token}`}
    size="small"
    sx={{
      bgcolor: `${color}20`,
      color,
      fontWeight: 700,
      fontSize: "0.8rem",
      border: `1px solid ${color}30`,
      borderRadius: "8px",
      minWidth: 48,
    }}
  />
);

// ========================
// MAIN COMPONENT
// ========================
const QueueDetailsPage = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [queueInfo, setQueueInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [skippedList, setSkippedList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [skipDialog, setSkipDialog] = useState({ open: false, customer: null, type: "" });

  const [waitingPage, setWaitingPage] = useState(1);
  const [waitingTotalPages, setWaitingTotalPages] = useState(1);
  const [skippedPage, setSkippedPage] = useState(1);
  const [skippedTotalPages, setSkippedTotalPages] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [completedTotalPages, setCompletedTotalPages] = useState(1);
  const [isAutoCallEnabled, setIsAutoCallEnabled] = useState(true);

  const autoCallInProgress = useRef(false);

  // ---- FETCH ----
  const fetchQueueDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/queue/${queueId}/details`);
      setQueueInfo(data.queue || data.queueInfo);
      setStats(data.stats);
      setCurrentCustomer(data.currentCustomer || data.stats?.currentlyServing || null);
    } catch (err) {
      console.error("Failed to fetch queue details:", err.message);
      setQueueInfo(MOCK_QUEUE_INFO);
      setStats(MOCK_STATS);
      setCurrentCustomer(MOCK_STATS.currentlyServing);
    }
    setLoading(false);
  }, [queueId]);

  const fetchWaitingList = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/queue/${queueId}/waiting`, {
        params: { page: waitingPage, limit: ROWS_PER_PAGE },
      });
      setWaitingList(data.customers || data);
      setWaitingTotalPages(data.totalPages || Math.ceil((data.total || data.length) / ROWS_PER_PAGE));
    } catch (err) {
      console.error("Failed to fetch waiting list:", err.message);
      const s = (waitingPage - 1) * ROWS_PER_PAGE;
      setWaitingList(MOCK_WAITING.slice(s, s + ROWS_PER_PAGE));
      setWaitingTotalPages(Math.ceil(MOCK_WAITING.length / ROWS_PER_PAGE));
    }
  }, [queueId, waitingPage]);

  const fetchSkippedList = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/queue/${queueId}/skipped`, {
        params: { page: skippedPage, limit: ROWS_PER_PAGE },
      });
      setSkippedList(data.customers || data);
      setSkippedTotalPages(data.totalPages || Math.ceil((data.total || data.length) / ROWS_PER_PAGE));
    } catch (err) {
      console.error("Failed to fetch skipped list:", err.message);
      const s = (skippedPage - 1) * ROWS_PER_PAGE;
      setSkippedList(MOCK_SKIPPED.slice(s, s + ROWS_PER_PAGE));
      setSkippedTotalPages(Math.ceil(MOCK_SKIPPED.length / ROWS_PER_PAGE));
    }
  }, [queueId, skippedPage]);

  const fetchCompletedList = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/queue/${queueId}/completed`, {
        params: { page: completedPage, limit: ROWS_PER_PAGE },
      });
      setCompletedList(data.customers || data);
      setCompletedTotalPages(data.totalPages || Math.ceil((data.total || data.length) / ROWS_PER_PAGE));
    } catch (err) {
      console.error("Failed to fetch completed list:", err.message);
      const s = (completedPage - 1) * ROWS_PER_PAGE;
      setCompletedList(MOCK_COMPLETED.slice(s, s + ROWS_PER_PAGE));
      setCompletedTotalPages(Math.ceil(MOCK_COMPLETED.length / ROWS_PER_PAGE));
    }
  }, [queueId, completedPage]);

  useEffect(() => { fetchQueueDetails(); }, [fetchQueueDetails]);
  useEffect(() => { fetchWaitingList(); }, [fetchWaitingList]);
  useEffect(() => { if (activeTab === 1) fetchSkippedList(); }, [activeTab, fetchSkippedList]);
  useEffect(() => { if (activeTab === 2) fetchCompletedList(); }, [activeTab, fetchCompletedList]);

  // ---- WEBSOCKET ----
  useEffect(() => {
    if (queueId) {
      socket.connect();
      socket.emit('join-queue-room', queueId);

      const handleQueueUpdate = () => {
        fetchQueueDetails();
        fetchWaitingList();
        if (activeTab === 1) fetchSkippedList();
        if (activeTab === 2) fetchCompletedList();
      };

      socket.on('queue-updated', handleQueueUpdate);

      return () => {
        socket.off('queue-updated', handleQueueUpdate);
        socket.disconnect();
      };
    };
  }, [queueId, activeTab, fetchWaitingList, fetchSkippedList, fetchCompletedList, fetchQueueDetails]);

  // ---- AUTO CALL NEXT ----
  const handleCallNext = useCallback(async () => {
    if (waitingList.length === 0) return;
    const nextCustomer = waitingList[0];
    setActionLoading(true);
    try {
      await api.patch(`/api/customer/${nextCustomer._id}/call`);
      setSnackbar({
        open: true,
        message: `Token #${nextCustomer.tokenNumber || nextCustomer.token} (${nextCustomer.name}) called to counter`,
        severity: "success",
      });
      await fetchQueueDetails();
      await fetchWaitingList();
    } catch (err) {
      console.error("Call next failed:", err.message);
      setSnackbar({ open: true, message: "Failed to call next. Try again.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }, [waitingList, fetchQueueDetails, fetchWaitingList]);

  useEffect(() => {
    let intervalId;

    const checkAndCall = async () => {
      if (
        isAutoCallEnabled &&
        queueInfo &&
        queueInfo.status !== "paused" &&
        !currentCustomer &&
        waitingList.length > 0 &&
        !autoCallInProgress.current
      ) {
        autoCallInProgress.current = true;
        await handleCallNext();
        
        // Small timeout to prevent race conditions with WebSocket updates
        setTimeout(() => {
          autoCallInProgress.current = false;
        }, 1500);
      }
    };

    // Run immediately when dependencies change
    checkAndCall();

    // Fallback interval to retry in case the process got stuck (e.g., network failure)
    if (isAutoCallEnabled && queueInfo?.status !== "paused" && !currentCustomer && waitingList.length > 0) {
      intervalId = setInterval(checkAndCall, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoCallEnabled, queueInfo, currentCustomer, waitingList, handleCallNext]);

  // ---- ACTIONS ----
  const handleComplete = async () => {
    if (!currentCustomer) return;
    setActionLoading(true);
    try {
      await api.post(`/api/queue/${queueId}/complete`, { customerId: currentCustomer._id || currentCustomer.tokenNumber || currentCustomer.token });
      setSnackbar({ open: true, message: `Token #${currentCustomer.tokenNumber || currentCustomer.token} marked as complete`, severity: "success" });
      fetchQueueDetails(); fetchWaitingList();
      if (activeTab === 2) fetchCompletedList();
    } catch (err) {
      console.error("Complete failed:", err.message);
      setSnackbar({ open: true, message: "Failed to complete. Try again.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleSkipCurrentOpen = () => {
    if (!currentCustomer) return;
    setSkipDialog({ open: true, customer: currentCustomer, type: "current" });
  };

  const handleSkipRowOpen = (customer) => {
    setSkipDialog({ open: true, customer, type: "row" });
  };

  const handleSkipConfirm = async () => {
    const { customer, type } = skipDialog;
    if (!customer) return;
    setActionLoading(true);
    setSkipDialog({ open: false, customer: null, type: "" });
    try {
      const endpoint = type === "current" ? `/api/queue/${queueId}/skip-current` : `/api/queue/${queueId}/skip`;
      await api.post(endpoint, { customerId: customer._id || customer.tokenNumber || customer.token });
      setSnackbar({ open: true, message: `Token #${customer.tokenNumber || customer.token} (${customer.name}) skipped`, severity: "info" });
      fetchQueueDetails(); fetchWaitingList();
      if (activeTab === 1) fetchSkippedList();
    } catch (err) {
      console.error("Skip failed:", err.message);
      setSnackbar({ open: true, message: "Failed to skip. Try again.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleSkipCancel = () => { setSkipDialog({ open: false, customer: null, type: "" }); };

  const handleUndoSkip = async (customer) => {
    setActionLoading(true);
    try {
      await api.post(`/api/queue/${queueId}/undo-skip`, { customerId: customer._id || customer.tokenNumber || customer.token });
      setSnackbar({ open: true, message: `Token #${customer.tokenNumber || customer.token} (${customer.name}) added back to queue`, severity: "success" });
      fetchSkippedList(); fetchWaitingList(); fetchQueueDetails();
    } catch (err) {
      console.error("Undo skip failed:", err.message);
      setSnackbar({ open: true, message: "Failed to undo skip. Try again.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleCall = (phone) => {
    if (phone) window.open(`tel:${phone}`, "_self");
    else setSnackbar({ open: true, message: "No phone number available", severity: "warning" });
  };

  // ---- PAGINATION SX ----
  const paginationSx = {
    "& .MuiPaginationItem-root": {
      color: COLORS.textMuted,
      borderColor: COLORS.border,
      "&.Mui-selected": { bgcolor: COLORS.border, color: COLORS.white },
      "&:hover": { bgcolor: COLORS.paperLight },
    },
  };

  // ========================
  // LOADING STATE
  // ========================
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: COLORS.bg, minHeight: "100vh" }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: "12px", flex: 1, minWidth: 150 }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: "12px", flex: "0 0 30%", minWidth: 280 }} />
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: "12px", flex: 1, minWidth: 300 }} />
        </Box>
      </Box>
    );
  }

  // ========================
  // RENDER
  // ========================
  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* ======== HEADER ======== */}
      <Slide direction="down" in timeout={400}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Tooltip title="Back to Dashboard">
              <IconButton
                onClick={() => navigate("/")}
                sx={{
                  color: COLORS.textMuted,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "10px",
                  "&:hover": { bgcolor: COLORS.paperLight, color: COLORS.white, borderColor: COLORS.borderLight },
                  transition: "all 0.2s",
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            {queueInfo?.category && (
              <Chip
                label={queueInfo.category}
                size="small"
                sx={{ bgcolor: COLORS.border, color: COLORS.text, fontWeight: 500 }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: COLORS.textMuted, display: "block", mb: 0.25, ml: 0.5 }}>
            🏠 &nbsp;Dashboard &gt; Queue &gt; {queueInfo?.name || "Details"}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.white, letterSpacing: "-0.02em", ml: 0.5 }}>
            {queueInfo?.name || "Queue Details"}
          </Typography>
        </Box>
      </Slide>

      {/* ======== STAT CARDS ======== */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard icon={<PeopleIcon />} label="Total Waiting" value={stats?.totalWaiting ?? "—"} color={COLORS.blue} delay={0} />
        <StatCard
          icon={<PersonIcon />}
          label="Currently Serving"
          value={currentCustomer ? `${currentCustomer.name?.split(" ")[0]} (#${currentCustomer.tokenNumber || currentCustomer.token})` : "None"}
          color={COLORS.green}
          delay={100}
        />
        <StatCard icon={<TimerIcon />} label="Avg. Wait (mins)" value={stats?.avgWait ?? "—"} color={COLORS.amber} delay={200} />
        <StatCard icon={<DoneAllIcon />} label="Completed Today" value={stats?.completedToday ?? "—"} color={COLORS.purple} delay={300} />
      </Box>

      {/* ======== MAIN CONTENT: Currently Serving + Tabs ======== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 30%) 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* LEFT: Currently Serving */}
        <CurrentlyServing
          customer={currentCustomer}
          onComplete={handleComplete}
          onSkip={handleSkipCurrentOpen}
          onCallNext={handleCallNext}
          hasWaiting={waitingList.length > 0}
          loading={actionLoading}
          isAutoCallEnabled={isAutoCallEnabled}
          onToggleAutoCall={setIsAutoCallEnabled}
          queuePaused={queueInfo?.status === "paused"}
        />

        {/* RIGHT: Tabs */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: COLORS.paper,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Tabs Header */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                bgcolor: COLORS.paperLight,
                "& .MuiTabs-indicator": { bgcolor: COLORS.white, height: 2 },
                "& .MuiTab-root": {
                  color: COLORS.textMuted,
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  minHeight: 48,
                  "&.Mui-selected": { color: COLORS.white },
                },
              }}
            >
              <Tab icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Waiting List" />
              <Tab icon={<SkipNextIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Skipped" />
              <Tab icon={<DoneAllIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Completed" />
            </Tabs>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* ---- TAB 0: WAITING ---- */}
            {activeTab === 0 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.paperLight }}>
                        <TableCell sx={{ color: COLORS.textMuted }}>Pos</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Token</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Name</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Est. Wait</TableCell>
                        <TableCell align="right" sx={{ color: COLORS.textMuted }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {waitingList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6, borderBottom: "none" }}>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>No customers waiting</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        waitingList.map((c, idx) => (
                          <Fade in timeout={300 + idx * 80} key={c._id || idx}>
                            <TableRow sx={{ "&:hover": { bgcolor: COLORS.paperLight }, transition: "background-color 0.15s" }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, fontWeight: 600 }}>
                                  {c.position || (waitingPage - 1) * ROWS_PER_PAGE + idx + 1}
                                </Typography>
                              </TableCell>
                              <TableCell><TokenChip token={c.tokenNumber || c.token} /></TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 500 }}>{c.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.amber, fontWeight: 500 }}>{c.estWait} min</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                  <Tooltip title="Call Customer">
                                    <IconButton size="small" onClick={() => handleCall(c.phone)} sx={{ color: COLORS.blue, "&:hover": { bgcolor: `${COLORS.blue}15` } }}>
                                      <PhoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Skip Customer">
                                    <IconButton size="small" onClick={() => handleSkipRowOpen(c)} disabled={actionLoading} sx={{ color: COLORS.amber, "&:hover": { bgcolor: `${COLORS.amber}15` } }}>
                                      <FastForwardIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {waitingTotalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination count={waitingTotalPages} page={waitingPage} onChange={(_, v) => setWaitingPage(v)} shape="rounded" sx={paginationSx} />
                  </Box>
                )}
              </Box>
            )}

            {/* ---- TAB 1: SKIPPED ---- */}
            {activeTab === 1 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.paperLight }}>
                        <TableCell sx={{ color: COLORS.textMuted }}>Token</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Name</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Phone</TableCell>
                        <TableCell align="right" sx={{ color: COLORS.textMuted }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {skippedList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: "none" }}>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>No skipped customers</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        skippedList.map((c, idx) => (
                          <Fade in timeout={300 + idx * 80} key={c._id || idx}>
                            <TableRow sx={{ "&:hover": { bgcolor: COLORS.paperLight }, transition: "background-color 0.15s" }}>
                              <TableCell><TokenChip token={c.tokenNumber || c.token} color={COLORS.amber} /></TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 500 }}>{c.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted }}>{c.phone || "—"}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                  <Tooltip title="Call Customer">
                                    <IconButton size="small" onClick={() => handleCall(c.phone)} sx={{ color: COLORS.blue, "&:hover": { bgcolor: `${COLORS.blue}15` } }}>
                                      <PhoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Add Back to Queue">
                                    <IconButton size="small" onClick={() => handleUndoSkip(c)} disabled={actionLoading} sx={{ color: COLORS.green, "&:hover": { bgcolor: `${COLORS.green}15` } }}>
                                      <UndoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {skippedTotalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination count={skippedTotalPages} page={skippedPage} onChange={(_, v) => setSkippedPage(v)} shape="rounded" sx={paginationSx} />
                  </Box>
                )}
              </Box>
            )}

            {/* ---- TAB 2: COMPLETED ---- */}
            {activeTab === 2 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.paperLight }}>
                        <TableCell sx={{ color: COLORS.textMuted }}>Token</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Name</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Phone</TableCell>
                        <TableCell sx={{ color: COLORS.textMuted }}>Completed At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completedList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: "none" }}>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>No completed customers yet</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        completedList.map((c, idx) => (
                          <Fade in timeout={300 + idx * 80} key={c._id || idx}>
                            <TableRow sx={{ "&:hover": { bgcolor: COLORS.paperLight }, transition: "background-color 0.15s" }}>
                              <TableCell><TokenChip token={c.tokenNumber || c.token} color={COLORS.purple} /></TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 500 }}>{c.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted }}>{c.phone || "—"}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted }}>{c.completedAt || "—"}</Typography>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {completedTotalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination count={completedTotalPages} page={completedPage} onChange={(_, v) => setCompletedPage(v)} shape="rounded" sx={paginationSx} />
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Fade>
      </Box>

      {/* ======== SKIP DIALOG ======== */}
      <Dialog
        open={skipDialog.open}
        onClose={handleSkipCancel}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" },
          },
        }}
        PaperProps={{
          sx: { bgcolor: COLORS.paperLight, border: `1px solid ${COLORS.border}`, borderRadius: "12px", minWidth: 360 },
        }}
      >
        <DialogTitle sx={{ color: COLORS.white, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
          <SkipNextIcon sx={{ color: COLORS.amber }} /> Skip Customer
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: COLORS.textMuted }}>
            Are you sure you want to skip{" "}
            <strong style={{ color: COLORS.text }}>Token #{skipDialog.customer?.tokenNumber || skipDialog.customer?.token} ({skipDialog.customer?.name})</strong>?
            {skipDialog.type === "current"
              ? " The next person in queue will be called."
              : " This customer will be moved to the skipped list."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleSkipCancel} sx={{ color: COLORS.textMuted, "&:hover": { bgcolor: COLORS.border } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSkipConfirm}
            variant="contained"
            sx={{ bgcolor: COLORS.amber, color: COLORS.bg, fontWeight: 600, "&:hover": { bgcolor: "#d97706" } }}
          >
            Skip
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======== SNACKBAR ======== */}
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

export default QueueDetailsPage;