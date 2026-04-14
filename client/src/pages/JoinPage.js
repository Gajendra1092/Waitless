import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

function JoinPage() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get(`/api/queue/${queueId}`);
        setQueue(response.data);
      } catch (err) {
        setError('Queue not found.');
        console.error(err);
      }
    };
    fetchQueue();
  }, [queueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`/api/customer/${queueId}/join`, {
        name,
        phone,
      });
      const customerId = response.data._id;
      navigate(`/status/${customerId}`);
    } catch (err) {
      setError('Failed to join the queue.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Card sx={{ maxWidth: 440, width: '100%', mx: 'auto', p: 3 }}>
        {error && <Typography color="error">{error}</Typography>}
        {queue && (
          <>
            <CardHeader
              title={queue.name}
              subheader={`Join the queue to get your token. Currently ${queue.waitingCount} people waiting.`}
            />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  sx={{ mt: 3 }}
                >
                  Join Queue
                </LoadingButton>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </Box>
  );
}

export default JoinPage;
