import React from 'react';
import { Paper, Box, Typography, Grow } from '@mui/material';

const COLORS = {
  paper: "#16161e",
  border: "#2a2a35",
  borderLight: "#3a3a45",
  textMuted: "#8a8a8a",
};

const StatCard = ({ icon, label, value, color, delay = 0 }) => (
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
          {icon && React.cloneElement(icon, { sx: { fontSize: 18, color } })}
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

export default StatCard;
