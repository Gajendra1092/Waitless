import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "../utils/socket";
import api from "../utils/api";

const ROWS_PER_PAGE = 5;

export const useQueueDetails = (queueId) => {
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

  // ---- FETCH LOGIC ----
  const fetchQueueDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/queue/${queueId}/details`);
      setQueueInfo(data.queue || data.queueInfo);
      setStats(data.stats);
      setCurrentCustomer(data.currentCustomer || data.stats?.currentlyServing || null);
    } catch (err) {
      console.error("Failed to fetch queue details:", err.message);
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  const fetchWaitingList = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/queue/${queueId}/waiting`, { params: { page: waitingPage, limit: ROWS_PER_PAGE } });
      setWaitingList(data.customers || data);
      setWaitingTotalPages(data.totalPages || Math.ceil((data.total || data.length) / ROWS_PER_PAGE));
    } catch (err) { console.error("Failed to fetch waiting list:", err.message); }
  }, [queueId, waitingPage]);

  const fetchSkippedList = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/queue/${queueId}/skipped`, { params: { page: skippedPage, limit: ROWS_PER_PAGE } });
      setSkippedList(data.customers || data);
      setSkippedTotalPages(data.totalPages || Math.ceil((data.total || data.length) / ROWS_PER_PAGE));
    } catch (err) { console.error("Failed to fetch skipped list:", err.message); }
  }, [queueId, skippedPage]);

  const fetchCompletedList = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/queue/${queueId}/completed`, { params: { page: completedPage, limit: ROWS_PER_PAGE } });
      setCompletedList(data.customers || data);
      setCompletedTotalPages(data.totalPages || Math.ceil((data.total || data.length) / ROWS_PER_PAGE));
    } catch (err) { console.error("Failed to fetch completed list:", err.message); }
  }, [queueId, completedPage]);

  useEffect(() => { fetchQueueDetails(); }, [fetchQueueDetails]);
  useEffect(() => { fetchWaitingList(); }, [fetchWaitingList]);
  useEffect(() => { if (activeTab === 1) fetchSkippedList(); }, [activeTab, fetchSkippedList]);
  useEffect(() => { if (activeTab === 2) fetchCompletedList(); }, [activeTab, fetchCompletedList]);

  // ---- WEBSOCKET LOGIC ----
  useEffect(() => {
    if (!queueId) return;
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
  }, [queueId, activeTab, fetchWaitingList, fetchSkippedList, fetchCompletedList, fetchQueueDetails]);

  // ---- ACTION HANDLERS ----
  const handleCallNext = useCallback(async () => {
    if (waitingList.length === 0) return;
    const nextCustomer = waitingList[0];
    setActionLoading(true);
    try {
      await api.patch(`/api/customer/${nextCustomer._id}/call`);
      setSnackbar({ open: true, message: `Token #${nextCustomer.tokenNumber || nextCustomer.token} (${nextCustomer.name}) called to counter`, severity: "success" });
      await fetchQueueDetails();
      await fetchWaitingList();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to call next. Try again.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }, [waitingList, fetchQueueDetails, fetchWaitingList]);

  // ---- AUTO-CALL EFFECT ----
  useEffect(() => {
    let intervalId;
    const checkAndCall = async () => {
      if (isAutoCallEnabled && queueInfo?.status !== "paused" && !currentCustomer && waitingList.length > 0 && !autoCallInProgress.current) {
        autoCallInProgress.current = true;
        await handleCallNext();
        setTimeout(() => { autoCallInProgress.current = false; }, 1500);
      }
    };
    checkAndCall();
    if (isAutoCallEnabled && queueInfo?.status !== "paused" && !currentCustomer && waitingList.length > 0) {
      intervalId = setInterval(checkAndCall, 3000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isAutoCallEnabled, queueInfo, currentCustomer, waitingList, handleCallNext]);

  // ---- MORE ACTION HANDLERS ----
  const handleComplete = async () => {
    if (!currentCustomer) return;
    setActionLoading(true);
    try {
      await api.post(`/api/queue/${queueId}/complete`, { customerId: currentCustomer._id || currentCustomer.tokenNumber || currentCustomer.token });
      setSnackbar({ open: true, message: `Token #${currentCustomer.tokenNumber || currentCustomer.token} marked as complete`, severity: "success" });
      fetchQueueDetails(); fetchWaitingList();
      if (activeTab === 2) fetchCompletedList();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to complete. Try again.", severity: "error" });
    }
    setActionLoading(false);
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
      setSnackbar({ open: true, message: "Failed to skip. Try again.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleUndoSkip = async (customer) => {
    setActionLoading(true);
    try {
      await api.post(`/api/queue/${queueId}/undo-skip`, { customerId: customer._id || customer.tokenNumber || customer.token });
      setSnackbar({ open: true, message: `Token #${customer.tokenNumber || customer.token} (${customer.name}) added back to queue`, severity: "success" });
      fetchSkippedList(); fetchWaitingList(); fetchQueueDetails();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to undo skip. Try again.", severity: "error" });
    }
    setActionLoading(false);
  };

  return {
    queueInfo, stats, currentCustomer, waitingList, skippedList, completedList,
    loading, actionLoading, activeTab, snackbar, skipDialog,
    pagination: {
      waiting: { page: waitingPage, setPage: setWaitingPage, totalPages: waitingTotalPages },
      skipped: { page: skippedPage, setPage: setSkippedPage, totalPages: skippedTotalPages },
      completed: { page: completedPage, setPage: setCompletedPage, totalPages: completedTotalPages },
    },
    autoCall: { isEnabled: isAutoCallEnabled, setIsEnabled: setIsAutoCallEnabled },
    setActiveTab, setSnackbar, setSkipDialog,
    handleComplete, handleSkipConfirm, handleUndoSkip, handleCallNext,
  };
};