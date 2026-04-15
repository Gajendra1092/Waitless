// QueueDetailsPage.js
import React from "react";
import { useParams, useNavigate } from 'react-router-dom';
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
  Slide,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  SkipNext as SkipNextIcon,
  Phone as PhoneIcon,
  FastForward as FastForwardIcon,
  Undo as UndoIcon,
  People as PeopleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  DoneAll as DoneAllIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import StatCard from "../components/StatCard";
import CurrentlyServing from "../components/CurrentlyServing";
import TokenChip from "../components/TokenChip";
import { useQueueDetails } from '../hooks/useQueueDetails';
import { useTheme } from "@mui/material/styles";

// MAIN COMPONENT

const QueueDetailsPage = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const {
    queueInfo, stats, currentCustomer, waitingList, skippedList, completedList,
    loading, actionLoading, activeTab, snackbar, skipDialog,
    pagination, autoCall,
    setActiveTab, setSnackbar, setSkipDialog,
    handleComplete, handleSkipConfirm, handleUndoSkip, handleCallNext,
  } = useQueueDetails(queueId);

  const theme = useTheme();

  const handleSkipCurrentOpen = () => {
    if (!currentCustomer) return;
    setSkipDialog({ open: true, customer: currentCustomer, type: "current" });
  };
  const handleSkipRowOpen = (customer) => {
    setSkipDialog({ open: true, customer, type: "row" });
  };
  const handleSkipCancel = () => { setSkipDialog({ open: false, customer: null, type: "" }); };

  const handleCall = (phone) => {
    if (phone) window.open(`tel:${phone}`, "_self");
    else setSnackbar({ open: true, message: "No phone number available", severity: "warning" });
  };

  // ---- PAGINATION SX ----
  const paginationSx = {
    "& .MuiPaginationItem-root": {
      color: 'text.secondary',
      borderColor: 'divider',
      "&.Mui-selected": { bgcolor: 'divider', color: 'primary.main' },
      "&:hover": { bgcolor: 'background.paperLight' },
    },
  };

  // LOADING STATE

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: "100vh" }}>
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


  // RENDER

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: 'background.default',
        minHeight: "100vh",
        color: 'text.primary',
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
                onClick={() => navigate("/dashboard")}
                sx={{
                  color: 'text.secondary',
                  border: 1, borderColor: 'divider',
                  borderRadius: "10px",
                  "&:hover": { bgcolor: 'background.paperLight', color: 'primary.main', borderColor: 'custom.borderLight' },
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
                sx={{ bgcolor: 'divider', color: 'text.primary', fontWeight: 500 }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: "block", mb: 0.25, ml: 0.5 }}>
            🏠 &nbsp;Dashboard &gt; Queue &gt; {queueInfo?.name || "Details"}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: "-0.02em", ml: 0.5 }}>
            {queueInfo?.name || "Queue Details"}
          </Typography>
        </Box>
      </Slide>

      {/* ======== STAT CARDS ======== */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard icon={<PeopleIcon />} label="Total Waiting" value={stats?.totalWaiting ?? "—"} color={theme.palette.info.main} delay={0} />
        <StatCard
          icon={<PersonIcon />}
          label="Currently Serving"
          value={currentCustomer ? `${currentCustomer.name?.split(" ")[0]} (#${currentCustomer.tokenNumber || currentCustomer.token})` : "None"}
          color={theme.palette.success.main}
          delay={100}
        />
        <StatCard icon={<TimerIcon />} label="Avg. Wait (mins)" value={stats?.avgWait ?? "—"} color={theme.palette.warning.main} delay={200} />
        <StatCard icon={<DoneAllIcon />} label="Completed Today" value={stats?.completedToday ?? "—"} color={theme.palette.custom.purple} delay={300} />
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
          isAutoCallEnabled={autoCall.isEnabled}
          onToggleAutoCall={autoCall.setIsEnabled}
          queuePaused={queueInfo?.status === "paused"}
        />

        {/* RIGHT: Tabs */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Tabs Header */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                bgcolor: 'background.paperLight',
                "& .MuiTabs-indicator": { bgcolor: 'primary.main', height: 2 },
                "& .MuiTab-root": {
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  minHeight: 48,
                  "&.Mui-selected": { color: 'primary.main' },
                },
              }}
            >
              <Tab icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Waiting List" />
              <Tab icon={<SkipNextIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Skipped" />
              <Tab icon={<DoneAllIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Completed" />
            </Tabs>

            <Divider sx={{ borderColor: 'divider' }} />

            {/* ---- TAB 0: WAITING ---- */}
            {activeTab === 0 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.paperLight' }}>
                        <TableCell sx={{ color: 'text.secondary' }}>Pos</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Token</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Name</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Est. Wait</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {waitingList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6, borderBottom: "none" }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No customers waiting</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        waitingList.map((c, idx) => (
                          <Fade in timeout={300 + idx * 80} key={c._id || idx}>
                            <TableRow sx={{ "&:hover": { bgcolor: 'background.paperLight' }, transition: "background-color 0.15s" }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                  {c.position || (pagination.waiting.page - 1) * 5 + idx + 1}
                                </Typography>
                              </TableCell>
                              <TableCell><TokenChip token={c.tokenNumber || c.token} /></TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{c.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>{c.estWait} min</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                  <Tooltip title="Call Customer">
                                    <IconButton size="small" onClick={() => handleCall(c.phone)} sx={{ color: 'info.main', "&:hover": { bgcolor: (t) => `${t.palette.info.main}15` } }}>
                                      <PhoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Skip Customer">
                                    <IconButton size="small" onClick={() => handleSkipRowOpen(c)} disabled={actionLoading} sx={{ color: 'warning.main', "&:hover": { bgcolor: (t) => `${t.palette.warning.main}15` } }}>
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
                {pagination.waiting.totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination count={pagination.waiting.totalPages} page={pagination.waiting.page} onChange={(_, v) => pagination.waiting.setPage(v)} shape="rounded" sx={paginationSx} />
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
                      <TableRow sx={{ bgcolor: 'background.paperLight' }}>
                        <TableCell sx={{ color: 'text.secondary' }}>Token</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Name</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Phone</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {skippedList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: "none" }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No skipped customers</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        skippedList.map((c, idx) => (
                          <Fade in timeout={300 + idx * 80} key={c._id || idx}>
                            <TableRow sx={{ "&:hover": { bgcolor: 'background.paperLight' }, transition: "background-color 0.15s" }}>
                              <TableCell><TokenChip token={c.tokenNumber || c.token} color={theme.palette.warning.main} /></TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{c.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{c.phone || "—"}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                  <Tooltip title="Call Customer">
                                    <IconButton size="small" onClick={() => handleCall(c.phone)} sx={{ color: 'info.main', "&:hover": { bgcolor: (t) => `${t.palette.info.main}15` } }}>
                                      <PhoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Add Back to Queue">
                                    <IconButton size="small" onClick={() => handleUndoSkip(c)} disabled={actionLoading} sx={{ color: 'success.main', "&:hover": { bgcolor: (t) => `${t.palette.success.main}15` } }}>
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
                {pagination.skipped.totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination count={pagination.skipped.totalPages} page={pagination.skipped.page} onChange={(_, v) => pagination.skipped.setPage(v)} shape="rounded" sx={paginationSx} />
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
                      <TableRow sx={{ bgcolor: 'background.paperLight' }}>
                        <TableCell sx={{ color: 'text.secondary' }}>Token</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Name</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Phone</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Completed At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completedList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: "none" }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No completed customers yet</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        completedList.map((c, idx) => (
                          <Fade in timeout={300 + idx * 80} key={c._id || idx}>
                            <TableRow sx={{ "&:hover": { bgcolor: 'background.paperLight' }, transition: "background-color 0.15s" }}>
                              <TableCell><TokenChip token={c.tokenNumber || c.token} color={theme.palette.custom.purple} /></TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{c.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{c.phone || "—"}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{c.completedAt || "—"}</Typography>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {pagination.completed.totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination count={pagination.completed.totalPages} page={pagination.completed.page} onChange={(_, v) => pagination.completed.setPage(v)} shape="rounded" sx={paginationSx} />
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
          sx: { bgcolor: 'background.paperLight', border: 1, borderColor: 'divider', borderRadius: "12px", minWidth: 360 },
        }}
      >
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
          <SkipNextIcon sx={{ color: 'warning.main' }} /> Skip Customer
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to skip{" "}
            <strong style={{ color: 'text.primary' }}>Token #{skipDialog.customer?.tokenNumber || skipDialog.customer?.token} ({skipDialog.customer?.name})</strong>?
            {skipDialog.type === "current"
              ? " The next person in queue will be called."
              : " This customer will be moved to the skipped list."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleSkipCancel} sx={{ color: 'text.secondary', "&:hover": { bgcolor: 'divider' } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSkipConfirm}
            variant="contained"
            sx={{ bgcolor: 'warning.main', color: 'background.default', fontWeight: 600, "&:hover": { bgcolor: "#d97706" } }}
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