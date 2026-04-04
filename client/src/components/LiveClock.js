import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <Typography variant="h6" component="div">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Typography>
  );
};

export default LiveClock;
