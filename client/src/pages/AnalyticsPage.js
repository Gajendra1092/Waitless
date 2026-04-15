import React, { useState, useEffect } from "react";
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
  DoneAll as DoneAllIcon,
  SkipNext as SkipNextIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from "../utils/api";
import StatCard from "../components/StatCard";

// ========================
// STYLES
// ========================
const styles = {
  loaderContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" },
  loader: { color: "#00E5FF" },
  pageContainer: { p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" },
  pageTitle: { fontWeight: 700, color: "#ffffff", mb: 4, display: "flex", alignItems: "center", gap: 1.5 },
  titleIcon: { color: "#00E5FF", fontSize: 32 },
  kpiGrid: { display: "flex", gap: 2, mb: 4, flexWrap: "wrap" },
  insightsCard: { bgcolor: "#1a1a24", border: "1px solid #7B61FF50", p: 3, borderRadius: "12px", mb: 4, position: "relative", overflow: "hidden" },
  insightsGlow: { position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)", borderRadius: "50%" },
  insightsTitle: { color: "#ffffff", fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 },
  insightsTitleIcon: { color: "#7B61FF" },
  insightsList: { display: "flex", flexDirection: "column", gap: 1.5 },
  insightItem: (type) => ({ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, bgcolor: "#111118", borderRadius: "8px", borderLeft: `3px solid ${type === "warning" ? "#f59e0b" : type === "success" ? "#00FF94" : "#00E5FF"}` }),
  insightIcon: { color: "#8a8a8a", fontSize: 20, mt: 0.2 },
  insightText: { color: "#e0e0e0", lineHeight: 1.6 },
  chartsGrid: { display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 },
  chartCard: { bgcolor: "#16161e", border: "1px solid #2a2a35", p: 3, borderRadius: "12px" },
  chartTitle: { color: "#ffffff", fontWeight: 600, mb: 3 },
  chartWrapper: { width: "100%", height: 300 },
  noDataWrapper: { height: 300, display: "flex", alignItems: "center", justifyContent: "center" },
  noDataText: { color: "#8a8a8a" },
};

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
      <Box sx={styles.loaderContainer}>
        <CircularProgress sx={styles.loader} />
      </Box>
    );
  }

  const insights = getInsights();

  return (
    <Box sx={styles.pageContainer}>
      <Typography variant="h4" sx={styles.pageTitle}>
        <AnalyticsIcon sx={styles.titleIcon} /> Analytics Overview
      </Typography>

      {/* KPI Cards */}
      <Box sx={styles.kpiGrid}>
        <StatCard icon={<DoneAllIcon />} label="Served Today" value={data.totalCompleted} color="#00FF94" delay={0} />
        <StatCard icon={<SkipNextIcon />} label="Skipped Today" value={data.totalSkipped} color="#ef4444" delay={100} />
        <StatCard icon={<TimerIcon />} label="Avg Wait (Mins)" value={data.avgWait} color="#00E5FF" delay={200} />
      </Box>

      {/* Smart Insights (AI Placeholder) */}
      <Paper sx={styles.insightsCard}>
        <Box sx={styles.insightsGlow} />
        <Typography variant="h6" sx={styles.insightsTitle}>
          <LightbulbIcon sx={styles.insightsTitleIcon} /> Smart Insights
        </Typography>
        <Box sx={styles.insightsList}>
          {insights.map((insight, idx) => (
            <Box key={idx} sx={styles.insightItem(insight.type)}>
              <AutoGraphIcon sx={styles.insightIcon} />
              <Typography variant="body2" sx={styles.insightText}>{insight.text}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Charts Grid */}
      <Box sx={styles.chartsGrid}>
        
        {/* Line Chart */}
        <Paper sx={styles.chartCard}>
          <Typography variant="subtitle1" sx={styles.chartTitle}>Weekly Traffic Trend</Typography>
          <Box sx={styles.chartWrapper}>
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
        <Paper sx={styles.chartCard}>
          <Typography variant="subtitle1" sx={styles.chartTitle}>Traffic by Queue</Typography>
          {data.queueDistribution.length > 0 ? (
            <Box sx={styles.chartWrapper}>
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
            <Box sx={styles.noDataWrapper}>
              <Typography variant="body2" sx={styles.noDataText}>Not enough data yet</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;