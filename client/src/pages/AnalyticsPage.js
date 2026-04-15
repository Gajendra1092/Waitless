import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  AutoGraph as AutoGraphIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

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

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/api/queue/analytics/data");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        // Show zeroed out data if API fails
        setData({
          totalCompleted: 0,
          totalSkipped: 0,
          avgWait: 0,
          weeklyTrend: [],
          queueDistribution: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const PIE_COLORS = ["#00E5FF", "#7B61FF", "#00FF94", "#f59e0b"];

  // Generate "Smart" Insights based on the data
  const getInsights = () => {
    if (!data) return [];
    const insights = [];
    if (data.totalSkipped > data.totalCompleted * 0.15) {
      insights.push({ text: "High skip rate detected today. Customers might be abandoning the queue due to long wait times.", type: "warning" });
    } else {
      insights.push({ text: "Your completion-to-skip ratio looks very healthy today!", type: "success" });
    }
    if (data.avgWait > 20) {
      insights.push({ text: "Average wait time is above 20 minutes. Consider opening an additional counter.", type: "warning" });
    }
    if (data.weeklyTrend.length >= 2) {
      const today = data.weeklyTrend[data.weeklyTrend.length - 1]?.customers || 0;
      const yesterday = data.weeklyTrend[data.weeklyTrend.length - 2]?.customers || 0;
      if (today > yesterday) insights.push({ text: `Traffic is up! You've served ${today - yesterday} more customers than yesterday.`, type: "info" });
    }
    return insights.length ? insights : [{ text: "Gathering more data to generate insights...", type: "info" }];
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: "#00E5FF" }} />
      </Box>
    );
  }

  const insights = getInsights();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#ffffff", mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
        <AnalyticsIcon sx={{ color: "#00E5FF", fontSize: 32 }} /> Analytics Overview
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
        {[
          { label: "Served Today", value: data.totalCompleted, color: "#00FF94" },
          { label: "Skipped Today", value: data.totalSkipped, color: "#ef4444" },
          { label: "Avg Wait (Mins)", value: data.avgWait, color: "#00E5FF" }
        ].map((stat, idx) => (
          <Paper key={idx} sx={{ bgcolor: "#16161e", border: "1px solid #2a2a35", p: 3, borderRadius: "12px", borderTop: `4px solid ${stat.color}` }}>
            <Typography variant="caption" sx={{ color: "#8a8a8a", fontWeight: 600, textTransform: "uppercase" }}>{stat.label}</Typography>
            <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 800, mt: 1 }}>{stat.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Smart Insights (AI Placeholder) */}
      <Paper sx={{ bgcolor: "#1a1a24", border: "1px solid #7B61FF50", p: 3, borderRadius: "12px", mb: 4, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <LightbulbIcon sx={{ color: "#7B61FF" }} /> Smart Insights
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {insights.map((insight, idx) => (
            <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, bgcolor: "#111118", borderRadius: "8px", borderLeft: `3px solid ${insight.type === "warning" ? "#f59e0b" : insight.type === "success" ? "#00FF94" : "#00E5FF"}` }}>
              <AutoGraphIcon sx={{ color: "#8a8a8a", fontSize: 20, mt: 0.2 }} />
              <Typography variant="body2" sx={{ color: "#e0e0e0", lineHeight: 1.6 }}>{insight.text}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Charts Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
        
        {/* Line Chart */}
        <Paper sx={{ bgcolor: "#16161e", border: "1px solid #2a2a35", p: 3, borderRadius: "12px" }}>
          <Typography variant="subtitle1" sx={{ color: "#ffffff", fontWeight: 600, mb: 3 }}>Weekly Traffic Trend</Typography>
          <Box sx={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                <XAxis dataKey="date" stroke="#8a8a8a" tick={{ fill: "#8a8a8a", fontSize: 12 }} dy={10} />
                <YAxis stroke="#8a8a8a" tick={{ fill: "#8a8a8a", fontSize: 12 }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#1a1a24", borderColor: "#2a2a35", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#00E5FF" }}
                />
                <Line type="monotone" dataKey="customers" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: "#00E5FF", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Pie Chart */}
        <Paper sx={{ bgcolor: "#16161e", border: "1px solid #2a2a35", p: 3, borderRadius: "12px" }}>
          <Typography variant="subtitle1" sx={{ color: "#ffffff", fontWeight: 600, mb: 3 }}>Traffic by Queue</Typography>
          {data.queueDistribution.length > 0 ? (
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.queueDistribution} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {data.queueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#1a1a24", borderColor: "#2a2a35", borderRadius: "8px", color: "#fff" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#8a8a8a" }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" sx={{ color: "#8a8a8a" }}>Not enough data yet</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;