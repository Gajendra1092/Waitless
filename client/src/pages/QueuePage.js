import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Close as CloseIcon,
  QueuePlayNext as QueueIcon,
} from "@mui/icons-material";
import { socket } from "../utils/socket";
import api from "../utils/api";

const getStatusFromCount = (count, currentStatus) => {
  if (currentStatus === "paused") return "paused";
  if (currentStatus === "ended") return "ended";
  if (count > 0) return "running";
  return "no customers";
};

const getStatusChip = (status) => {
  const config = {
    running: { color: "#22c55e", bg: "#22c55e20", label: "Running" },
    "no customers": { color: "#f59e0b", bg: "#f59e0b20", label: "No Customers" },
    paused: { color: "#8a8a8a", bg: "#8a8a8a20", label: "Paused" },
    ended: { color: "#ef4444", bg: "#ef444420", label: "Ended" },
  };
  const c = config[status] || config["no customers"];
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.color}30`, fontWeight: 500 }}
    />
  );
};

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
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", category: "", detail: "" });
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
      setCategories([]);
      setSnackbar({ open: true, message: "Failed to load categories.", severity: "error" });
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
      setTotalPages(data.totalPages || Math.ceil((data.total || queueRows.length) / ROWS_PER_PAGE) || 1);
    } catch (err) {
      console.error("Failed to fetch queues:", err.message);
      setQueues([]);
      setTotalPages(1);
      setSnackbar({ open: true, message: "Failed to load queues.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const queueIds = queues.map((q) => q.id).join(',');

  useEffect(() => {
    if (!queueIds) return;

    socket.connect();
    const ids = queueIds.split(',');
    ids.forEach((id) => socket.emit('join-queue-room', id));

    const handleQueueUpdate = () => {
      fetchQueues();
    };

    socket.on('queue-updated', handleQueueUpdate);

    return () => {
      socket.off('queue-updated', handleQueueUpdate);
    };
  }, [queueIds, fetchQueues]);

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
      setSnackbar({ open: true, message: `Failed to delete "${queue.name}"`, severity: "error" });
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
    setSnackbar({ open: true, message: `Queue "${queue.name}" deleted successfully`, severity: "success" });
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
      setSnackbar({ open: true, message: `Queue "${createForm.name.trim()}" created successfully`, severity: "success" });
      setCreateDialogOpen(false);
      setCreateForm({ name: "", category: "", detail: "" });
      setCreateFormErrors({});
      fetchQueues();
      fetchCategories();
    } catch (err) {
      console.error("Create queue failed:", err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to create queue. Please try again.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: "#8a8a8a", display: "block", mb: 0.5 }}>
            {"🏠 "}Dashboard {" > "} Queue
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Queue
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
          sx={{ bgcolor: "#ffffff", color: "#111118", fontWeight: 600, px: 3, py: 1, "&:hover": { bgcolor: "#e0e0e0" } }}
        >
          Create Queue
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Box sx={{ flex: "1 1 300px", minWidth: 200 }}>
          <Typography variant="caption" sx={{ color: "#8a8a8a", mb: 0.5, display: "block" }}>
            Search for queue
          </Typography>
          <TextField
            placeholder="Search"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#8a8a8a", fontSize: 20 }} /></InputAdornment>) }}
            sx={{ "& .MuiInputBase-root": { bgcolor: "#1e1e28", fontSize: "0.875rem" } }}
          />
        </Box>

        <Box sx={{ minWidth: 160 }}>
          <Typography variant="caption" sx={{ color: "#8a8a8a", mb: 0.5, display: "block" }}>
            Status
          </Typography>
          <FormControl size="small" fullWidth>
            <Select value={statusFilter} onChange={handleStatusFilter} sx={{ bgcolor: "#1e1e28", fontSize: "0.875rem" }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="no customers">No Customers</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="ended">Ended</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 160 }}>
          <Typography variant="caption" sx={{ color: "#8a8a8a", mb: 0.5, display: "block" }}>
            Category
          </Typography>
          <FormControl size="small" fullWidth>
            <Select value={categoryFilter} onChange={handleCategoryFilter} sx={{ bgcolor: "#1e1e28", fontSize: "0.875rem" }}>
              <MenuItem value="all">All</MenuItem>
              {categories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: "#16161e", border: "1px solid #2a2a35", borderRadius: "12px", overflow: "hidden" }}>
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
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width={30} /></TableCell>
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
                  <Typography variant="body2" sx={{ color: "#8a8a8a" }}>No queues found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              queues.map((queue) => (
                <TableRow key={queue.id} onClick={() => handleRowClick(queue.id)} sx={{ cursor: "pointer", "&:hover": { bgcolor: "#1a1a24" }, transition: "background-color 0.15s" }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "#e0e0e0" }}>{queue.name}</Typography>
                    {queue.category && (<Typography variant="caption" sx={{ color: "#8a8a8a" }}>{queue.category}</Typography>)}
                  </TableCell>
                  <TableCell>{getStatusChip(queue.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: queue.customers > 0 ? "#22c55e" : "#8a8a8a", fontVariantNumeric: "tabular-nums" }}>
                      {queue.customers}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      <Tooltip title={queue.status === "paused" ? "Resume" : "Pause"}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handlePauseResume(queue); }}
                          disabled={queue.status === "ended"}
                          sx={{ color: queue.status === "paused" ? "#22c55e" : "#f59e0b", "&:hover": { bgcolor: queue.status === "paused" ? "#22c55e15" : "#f59e0b15" } }}
                        >
                          {queue.status === "paused" ? (<PlayArrowIcon fontSize="small" />) : (<PauseIcon fontSize="small" />)}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(queue); }}
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
            sx={{ "& .MuiPaginationItem-root": { color: "#8a8a8a", borderColor: "#2a2a35", "&.Mui-selected": { bgcolor: "#2a2a35", color: "#ffffff" }, "&:hover": { bgcolor: "#1e1e28" } } }}
          />
        </Box>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" } } }}
        PaperProps={{ sx: { bgcolor: "#16161e", border: "1px solid #2a2a35", borderRadius: "16px", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#2a2a35", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QueueIcon sx={{ color: "#ffffff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600, lineHeight: 1.2 }}>Create Queue</Typography>
              <Typography variant="caption" sx={{ color: "#8a8a8a" }}>Add a new queue to your dashboard</Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCreateDialogClose} disabled={createLoading} size="small" sx={{ color: "#8a8a8a", "&:hover": { color: "#ffffff", bgcolor: "#2a2a35" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ borderColor: "#2a2a35" }} />
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 0.75, fontWeight: 500 }}>Queue Name <span style={{ color: "#ef4444" }}>*</span></Typography>
              <TextField
                placeholder="e.g. General Queue, VIP Lounge"
                size="small"
                fullWidth
                value={createForm.name}
                onChange={handleCreateFormChange("name")}
                error={!!createFormErrors.name}
                helperText={createFormErrors.name}
                disabled={createLoading}
                sx={{ "& .MuiInputBase-root": { bgcolor: "#1e1e28", fontSize: "0.875rem" }, "& .MuiFormHelperText-root": { color: "#ef4444", ml: 0.5 } }}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 0.75, fontWeight: 500 }}>Category</Typography>
              <TextField
                placeholder="e.g. General, VIP, Support"
                size="small"
                fullWidth
                value={createForm.category}
                onChange={handleCreateFormChange("category")}
                disabled={createLoading}
                sx={{ "& .MuiInputBase-root": { bgcolor: "#1e1e28", fontSize: "0.875rem" } }}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 0.75, fontWeight: 500 }}>Details</Typography>
              <TextField
                placeholder="Describe this queue (optional)"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={createForm.detail}
                onChange={handleCreateFormChange("detail")}
                disabled={createLoading}
                sx={{ "& .MuiInputBase-root": { bgcolor: "#1e1e28", fontSize: "0.875rem" } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <Divider sx={{ borderColor: "#2a2a35" }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleCreateDialogClose} disabled={createLoading} sx={{ color: "#8a8a8a", px: 3, "&:hover": { bgcolor: "#2a2a35", color: "#e0e0e0" } }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateQueue}
            variant="contained"
            disabled={createLoading}
            sx={{ bgcolor: "#ffffff", color: "#111118", fontWeight: 600, px: 3, "&:hover": { bgcolor: "#e0e0e0" }, "&:disabled": { bgcolor: "#3a3a45", color: "#8a8a8a" } }}
          >
            {createLoading ? (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={16} sx={{ color: "#8a8a8a" }} />Creating...</Box>) : ("Create Queue")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" } } }}
        PaperProps={{ sx: { bgcolor: "#1e1e28", border: "1px solid #2a2a35", borderRadius: "12px", minWidth: 360 } }}
      >
        <DialogTitle sx={{ color: "#ffffff", fontWeight: 600 }}>Delete Queue</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#8a8a8a" }}>
            Are you sure you want to delete{" "}<strong style={{ color: "#e0e0e0" }}>"{deleteDialog.queue?.name}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: "#8a8a8a", "&:hover": { bgcolor: "#2a2a35" } }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ bgcolor: "#ef4444", color: "#ffffff", "&:hover": { bgcolor: "#dc2626" } }}>
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
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ borderRadius: "8px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QueuePage;