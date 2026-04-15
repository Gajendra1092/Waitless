import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Fade,
  Switch,
} from "@mui/material";
import {
  PersonOff as PersonOffIcon,
  CheckCircle as CheckCircleIcon,
  SkipNext as SkipNextIcon,
} from "@mui/icons-material";

const COLORS = {
  paper: "#16161e",
  border: "#2a2a35",
  textMuted: "#8a8a8a",
  textDim: "#555555",
  white: "#ffffff",
  green: "#22c55e",
  blue: "#3b82f6",
  amber: "#f59e0b",
  borderLight: "#3a3a45",
};

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

export default CurrentlyServing;