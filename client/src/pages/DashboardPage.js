import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Avatar, Tooltip, Pagination, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Divider,
  CircularProgress, Alert, Stack,
} from '@mui/material';
import {
  SearchOutlined, QueueOutlined, BarChartOutlined, SettingsOutlined,
  AddOutlined, PauseCircleOutlined, PlayCircleOutlined, DeleteOutlined,
  LogoutOutlined, PeopleAltOutlined, FiberManualRecord,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// ─── Theme (same as LandingPage) ─────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00E5FF', contrastText: '#000' },
    secondary: { main: '#7B61FF' },
    success: { main: '#00FF94' },
    warning: { main: '#FFB800' },
    error: { main: '#FF4D6A' },
    background: { default: '#020A14', paper: '#061220' },
    text: { primary: '#F0F6FF', secondary: '#5A7A9A' },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,229,255,0.06)',
          padding: '14px 16px',
        },
        head: {
          background: '#0C1F33',
          color: '#5A7A9A',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          background: '#0C1F33',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,229,255,0.12)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,229,255,0.3)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00E5FF' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: '#0C1F33',
            '& fieldset': { borderColor: 'rgba(0,229,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(0,229,255,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#00E5FF' },
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: '#5A7A9A',
            borderColor: 'rgba(0,229,255,0.12)',
            '&.Mui-selected': { background: '#00E5FF', color: '#000', borderColor: '#00E5FF' },
            '&:hover': { background: 'rgba(0,229,255,0.08)' },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { background: '#061220', border: '1px solid rgba(0,229,255,0.12)', backgroundImage: 'none' },
      },
    },
  },
});

// ─── Status helpers ───────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 5;

function deriveStatus(queue) {
  if (queue.isPaused) return 'paused';
  if (queue.isEnded) return 'ended';
  if ((queue.waitingCount ?? 0) > 0) return 'running';
  return 'no_customers';
}

const statusConfig = {
  running: { label: 'Running', color: '#00FF94', bg: 'rgba(0,255,148,0.1)' },
  no_customers: { label: 'No Customers', color: '#5A7A9A', bg: 'rgba(90,122,154,0.1)' },
  paused: { label: 'Paused', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  ended: { label: 'Ended', color: '#FF4D6A', bg: 'rgba(255,77,106,0.1)' },
};

function StatusChip({ status }) {
  const cfg = statusConfig[status] || statusConfig.no_customers;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.7,
      px: 1.2, py: 0.4, borderRadius: '100px',
      background: cfg.bg, border: `1px solid ${cfg.color}22`,
    }}>
      <FiberManualRecord sx={{ fontSize: 8, color: cfg.color }} />
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>{cfg.label}</Typography>
    </Box>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }) {
  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2, py: 1.4, borderRadius: 2, cursor: 'pointer',
      background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
      borderLeft: active ? '3px solid #00E5FF' : '3px solid transparent',
      transition: 'all 0.18s ease',
      '&:hover': { background: 'rgba(0,229,255,0.05)' },
    }}>
      <Box sx={{ color: active ? 'primary.main' : 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography sx={{
        fontSize: 14, fontWeight: active ? 600 : 400,
        color: active ? 'text.primary' : 'text.secondary',
      }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, business }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { id: 'queue', label: 'Queue', icon: <QueueOutlined fontSize="small" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChartOutlined fontSize="small" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsOutlined fontSize="small" /> },
  ];

  return (
    <Box sx={{
      width: 240, flexShrink: 0,
      background: '#061220',
      borderRight: '1px solid rgba(0,229,255,0.08)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <Typography sx={{
          fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800,
          background: 'linear-gradient(135deg,#00E5FF,#7B61FF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
        }}>
          WaitLess
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Business Dashboard</Typography>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, px: 1.5, py: 2 }}>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase', px: 1.5, mb: 1 }}>
          Menu
        </Typography>
        <Stack spacing={0.5}>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </Stack>
      </Box>

      {/* Profile */}
      <Box sx={{
        px: 2, py: 2,
        borderTop: '1px solid rgba(0,229,255,0.08)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36, fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg,#00E5FF,#7B61FF)',
            color: '#000',
          }}>
            {(business?.name || 'B').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {business?.name || 'Business'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {business?.email || ''}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth variant="outlined" size="small"
          startIcon={<LogoutOutlined sx={{ fontSize: 16 }} />}
          onClick={handleLogout}
          sx={{
            fontSize: 12, py: 0.8, borderRadius: 2,
            borderColor: 'rgba(255,77,106,0.3)', color: '#FF4D6A',
            '&:hover': { borderColor: '#FF4D6A', background: 'rgba(255,77,106,0.06)' },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

// ─── Queue Page ───────────────────────────────────────────────────────────────
function QueuePage() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, queue: null });
  const [actionLoading, setActionLoading] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
  const [newQueueCategory, setNewQueueCategory] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // ── Fetch queues ────────────────────────────────────────────────────────────
  const fetchQueues = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQueues(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load queues. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueues(); }, [fetchQueues]);

  // ── WebSocket — listen for customer count changes ───────────────────────────
  useEffect(() => {
    const socket = io('/', { auth: { token: localStorage.getItem('token') } });

    socket.on('queue-updated', ({ queueId, waitingCount }) => {
      setQueues(prev => prev.map(q =>
        q._id === queueId ? { ...q, waitingCount } : q
      ));
    });

    return () => socket.disconnect();
  }, []);

  // ── Derived status for each queue ───────────────────────────────────────────
  const queuesWithStatus = useMemo(() =>
    queues.map(q => ({ ...q, derivedStatus: deriveStatus(q) })),
    [queues]
  );

  // ── Categories from data ────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = [...new Set(queues.map(q => q.category).filter(Boolean))];
    return cats;
  }, [queues]);

  // ── Filtered queues ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return queuesWithStatus.filter(q => {
      const matchSearch = q.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || q.derivedStatus === statusFilter;
      const matchCategory = categoryFilter === 'all' || q.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [queuesWithStatus, search, statusFilter, categoryFilter]);

  // ── Paginated rows ──────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  // ── Pause / Resume ──────────────────────────────────────────────────────────
  const handlePauseToggle = async (queue) => {
    setActionLoading(queue._id + '_pause');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/queue/${queue._id}/${queue.isPaused ? 'resume' : 'pause'}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQueues(prev => prev.map(q =>
        q._id === queue._id ? { ...q, isPaused: !q.isPaused } : q
      ));
    } catch {
      setError('Failed to update queue status.');
    } finally { setActionLoading(''); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const queue = deleteDialog.queue;
    if (!queue) return;
    setActionLoading(queue._id + '_delete');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/queue/${queue._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQueues(prev => prev.filter(q => q._id !== queue._id));
      setDeleteDialog({ open: false, queue: null });
    } catch {
      setError('Failed to delete queue.');
    } finally { setActionLoading(''); }
  };

  // ── Create Queue ────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newQueueName.trim()) return;
    setCreateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/queue', {
        name: newQueueName.trim(),
        category: newQueueCategory.trim() || 'General',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQueues(prev => [res.data, ...prev]);
      setCreateDialog(false);
      setNewQueueName('');
      setNewQueueCategory('');
    } catch {
      setError('Failed to create queue.');
    } finally { setCreateLoading(false); }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <Box sx={{
        px: 4, py: 3,
        borderBottom: '1px solid rgba(0,229,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 26, letterSpacing: '-0.01em' }}>Queues</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Manage and monitor your active queues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setCreateDialog(true)}
          sx={{ px: 3, py: 1.2, borderRadius: 2, fontWeight: 600, fontSize: 14 }}
        >
          Create Queue
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{
        px: 4, py: 2.5,
        display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
        borderBottom: '1px solid rgba(0,229,255,0.06)',
      }}>
        <TextField
          placeholder="Search queues..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: 'text.secondary', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 280 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="running">Running</MenuItem>
            <MenuItem value="no_customers">No Customers</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="ended">Ended</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {filtered.length > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {filtered.length} queue{filtered.length !== 1 ? 's' : ''} found
          </Typography>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mx: 4, mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Box sx={{ flex: 1, px: 4, py: 3, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : paginated.length === 0 ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: 200, gap: 1,
          }}>
            <QueueOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              {filtered.length === 0 && queues.length > 0 ? 'No queues match your filters' : 'No queues yet. Create your first one!'}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{
            borderRadius: 2,
            border: '1px solid rgba(0,229,255,0.08)',
            background: '#061220',
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40%' }}>Queue</TableCell>
                  <TableCell sx={{ width: '20%' }}>Status</TableCell>
                  <TableCell sx={{ width: '25%' }}>Customers Waiting</TableCell>
                  <TableCell sx={{ width: '15%', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((queue) => (
                  <TableRow
                    key={queue._id}
                    sx={{
                      '&:hover': { background: 'rgba(0,229,255,0.03)' },
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Queue name + category */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 1.5,
                          background: 'rgba(0,229,255,0.08)',
                          border: '1px solid rgba(0,229,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <QueueOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{queue.name}</Typography>
                          {queue.category && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {queue.category}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusChip status={queue.derivedStatus} />
                    </TableCell>

                    {/* Customers waiting */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleAltOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography sx={{
                          fontSize: 15, fontWeight: 600,
                          color: (queue.waitingCount ?? 0) > 0 ? 'primary.main' : 'text.secondary',
                        }}>
                          {queue.waitingCount ?? 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>waiting</Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title={queue.isPaused ? 'Resume Queue' : 'Pause Queue'}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={actionLoading === queue._id + '_pause' || queue.derivedStatus === 'ended'}
                              onClick={() => handlePauseToggle(queue)}
                              sx={{
                                color: queue.isPaused ? 'success.main' : 'warning.main',
                                '&:hover': {
                                  background: queue.isPaused
                                    ? 'rgba(0,255,148,0.08)'
                                    : 'rgba(255,184,0,0.08)',
                                },
                              }}
                            >
                              {actionLoading === queue._id + '_pause'
                                ? <CircularProgress size={16} />
                                : queue.isPaused
                                  ? <PlayCircleOutlined fontSize="small" />
                                  : <PauseCircleOutlined fontSize="small" />
                              }
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete Queue">
                          <span>
                            <IconButton
                              size="small"
                              disabled={actionLoading === queue._id + '_delete'}
                              onClick={() => setDeleteDialog({ open: true, queue })}
                              sx={{
                                color: 'error.main',
                                '&:hover': { background: 'rgba(255,77,106,0.08)' },
                              }}
                            >
                              {actionLoading === queue._id + '_delete'
                                ? <CircularProgress size={16} />
                                : <DeleteOutlined fontSize="small" />
                              }
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!loading && filtered.length > ROWS_PER_PAGE && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              variant="outlined"
              shape="rounded"
              size="medium"
            />
          </Box>
        )}
      </Box>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, queue: null })}>
        <DialogTitle sx={{ fontFamily: '"Syne",sans-serif', fontSize: 18 }}>Delete Queue?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: 14 }}>
            Are you sure you want to delete <strong style={{ color: '#F0F6FF' }}>{deleteDialog.queue?.name}</strong>?
            This will remove all associated customer data and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteDialog({ open: false, queue: null })}
            sx={{ borderColor: 'rgba(0,229,255,0.2)', color: 'text.primary', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}
            sx={{ borderRadius: 2, background: '#FF4D6A', '&:hover': { background: '#ff2a4f' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Queue Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Syne",sans-serif', fontSize: 18 }}>Create New Queue</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Queue Name"
              fullWidth
              size="small"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              placeholder="e.g. General Consultation"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <TextField
              label="Category (optional)"
              fullWidth
              size="small"
              value={newQueueCategory}
              onChange={(e) => setNewQueueCategory(e.target.value)}
              placeholder="e.g. Clinic, Salon, Bank"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setCreateDialog(false)}
            sx={{ borderColor: 'rgba(0,229,255,0.2)', color: 'text.primary', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={createLoading || !newQueueName.trim()}
            sx={{ borderRadius: 2, minWidth: 100 }}>
            {createLoading ? <CircularProgress size={16} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Analytics Placeholder ────────────────────────────────────────────────────
function AnalyticsPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 4, py: 3, borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <Typography variant="h4" sx={{ fontSize: 26, letterSpacing: '-0.01em' }}>Analytics</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Queue performance and insights</Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
        <BarChartOutlined sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.3 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Analytics coming soon</Typography>
      </Box>
    </Box>
  );
}

// ─── Settings Placeholder ─────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 4, py: 3, borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <Typography variant="h4" sx={{ fontSize: 26, letterSpacing: '-0.01em' }}>Settings</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Manage your business preferences</Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
        <SettingsOutlined sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.3 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Settings coming soon</Typography>
      </Box>
    </Box>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [business, setBusiness] = useState(null);
  const navigate = useNavigate();

  // Load business info from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    // Decode JWT payload to get business info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setBusiness({ name: payload.name, email: payload.email });
    } catch {
      // fallback — fetch from API if token payload doesn't have it
      axios.get('/api/business/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setBusiness(res.data)).catch(() => navigate('/'));
    }
  }, [navigate]);

  const renderContent = () => {
    if (activeTab === 'queue') return <QueuePage />;
    if (activeTab === 'analytics') return <AnalyticsPage />;
    if (activeTab === 'settings') return <SettingsPage />;
  };

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <Box sx={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: '#020A14', color: 'text.primary',
      }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} business={business} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', background: '#020A14' }}>
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}