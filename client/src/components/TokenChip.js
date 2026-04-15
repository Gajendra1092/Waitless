import React from 'react';
import { Chip, useTheme } from '@mui/material';

const TokenChip = ({ token, color }) => {
  const theme = useTheme();
  const chipColor = color || theme.palette.success.main;
  
  return (
    <Chip
      label={`#${token}`}
      size="small"
      sx={{
        bgcolor: `${chipColor}20`,
        color: chipColor,
        fontWeight: 700,
        fontSize: "0.8rem",
        border: `1px solid ${chipColor}30`,
        borderRadius: "8px",
        minWidth: 48,
      }}
    />
  );
};

export default TokenChip;