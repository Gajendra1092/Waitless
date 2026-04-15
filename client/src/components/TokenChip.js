import React from 'react';
import { Chip } from '@mui/material';

const COLORS = {
  green: "#22c55e",
  amber: "#f59e0b",
  purple: "#8b5cf6",
};

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

export default TokenChip;