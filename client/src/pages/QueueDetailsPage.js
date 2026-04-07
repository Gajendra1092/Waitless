import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getStatusChip = (status) => {
  const config = {
    waiting: { color: "#f59e0b", bg: "#f59e0b20", label: "Waiting" },
    serving: { color: "#22c55e", bg: "#22c55e20", label: "Serving" },
    served: { color: "#8a8a8a", bg: "#8a8a8a20", label: "Served" },
    skipped: { color: "#ef4444", bg: "#ef444420", label: "Skipped" },
  };

  const c = config[status] || {
    color: "#8a8a8a",
    bg: "#8a8a8a20",
    label: status || "Unknown",
  };

  return (
    <Chip
      label={c.label}
      size="small"
      sx={{
        color: c.color,
        backgroundColor: c.bg,
        border: `1px solid ${c.color}30`,
        fontWeight: 500,
      }}
    />
  );
};

const QueueDetailsPage = () => {
  const navigate = useNavigate();
  const { queueId } = useParams();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/queue/${queueId}/customers`);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch queue customers:", err.message);
      setError(
        err.response?.data?.message || "Failed to load queue customers."
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queueId) {
      fetchCustomers();
    }
  }, [queueId]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{
            color: "#8a8a8a",
            mb: 2,
            "&:hover": { bgcolor: "#2a2a35", color: "#ffffff" },
          }}
        >
          Back to Dashboard
        </Button>

        <Typography
          variant="caption"
          sx={{ color: "#8a8a8a", display: "block", mb: 0.5 }}
        >
          {"🏠 "}Dashboard {" > "} Queue Details
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Queue Customers
        </Typography>

        <Typography variant="body2" sx={{ color: "#8a8a8a", mt: 0.5 }}>
          Queue ID: {queueId}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: "#16161e",
          border: "1px solid #2a2a35",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a24" }}>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Token Number</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="30%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: "#8a8a8a" }}>
                    No customers found for this queue
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#e0e0e0", fontWeight: 500 }}>
                      {customer.name || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#8a8a8a" }}>
                      {customer.phone || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
                      {customer.position ?? "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
                      {customer.tokenNumber ?? "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(customer.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QueueDetailsPage;
