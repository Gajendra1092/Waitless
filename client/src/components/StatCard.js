import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {icon}
        </Box>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
