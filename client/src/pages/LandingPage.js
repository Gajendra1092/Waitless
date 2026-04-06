import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, Tab, Tabs,
  Grid, Card, CardContent, Chip, Alert, Stack, Paper,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  BoltOutlined, QrCode2Outlined, TokenOutlined, DashboardOutlined,
  LockOutlined, BarChartOutlined, ArrowForward, PlayArrow,
  CheckCircleOutline, SkipNext,
} from '@mui/icons-material';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00E5FF', contrastText: '#000' },
    secondary: { main: '#7B61FF' },
    success: { main: '#00FF94' },
    background: { default: '#020A14', paper: '#061220' },
    text: { primary: '#F0F6FF', secondary: '#5A7A9A' },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: '15px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: '#0C1F33',
            '& fieldset': { borderColor: 'rgba(0,229,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(0,229,255,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#00E5FF' },
          },
          '& .MuiInputLabel-root': { color: '#5A7A9A' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#00E5FF' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#061220',
          border: '1px solid rgba(0,229,255,0.1)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: '14px' },
      },
    },
  },
});

// ─── Animated Background ──────────────────────────────────────────────────────
function AnimatedBg() {
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(0,229,255,0.07),transparent 70%)',
        top: -100, right: -100, filter: 'blur(60px)',
        animation: 'orb1 8s ease-in-out infinite',
        '@keyframes orb1': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-30px,40px)' },
        },
      }} />
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(123,97,255,0.07),transparent 70%)',
        bottom: 100, left: -100, filter: 'blur(60px)',
        animation: 'orb2 10s ease-in-out infinite',
        '@keyframes orb2': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(40px,-30px)' },
        },
      }} />
    </Box>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const scrollTo = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  return (
    <Box component="nav" sx={{
      position: 'relative', zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: { xs: 3, md: 5 }, py: 2,
      borderBottom: '1px solid rgba(0,229,255,0.1)',
      backdropFilter: 'blur(20px)',
      background: 'rgba(2,10,20,0.7)',
    }}>
      <Typography sx={{
        fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800,
        background: 'linear-gradient(135deg,#00E5FF,#7B61FF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        WaitLess
      </Typography>
      <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
        {['features', 'stack', 'auth'].map((id) => (
          <Typography key={id} onClick={() => scrollTo(id)} sx={{
            fontSize: 13, color: 'text.secondary', cursor: 'pointer', textTransform: 'capitalize',
            '&:hover': { color: 'text.primary' }, transition: 'color 0.2s',
          }}>
            {id === 'auth' ? 'Get Started' : id.charAt(0).toUpperCase() + id.slice(1)}
          </Typography>
        ))}
        <Button
          variant="contained"
          size="small"
          onClick={() => scrollTo('auth')}
          sx={{ px: 2.5, py: 0.8, fontSize: 13 }}
        >
          Login →
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Live Preview Card ────────────────────────────────────────────────────────
function LivePreviewCard() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2500);
    return () => clearInterval(t);
  }, []);

  const customers = [
    { initials: 'RS', name: 'Rahul Sharma', wait: 'Now serving', token: null, color: '#00FF94', bg: 'rgba(0,255,148,0.08)', serving: true },
    { initials: 'PM', name: 'Priya Mehta', wait: '~8 min wait', token: '#43', color: '#00E5FF', bg: 'rgba(0,229,255,0.08)', serving: false },
    { initials: 'AV', name: 'Amit Verma', wait: '~16 min wait', token: '#44', color: '#7B61FF', bg: 'rgba(123,97,255,0.08)', serving: false },
  ];

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* Fake window titlebar */}
      <Box sx={{
        px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1,
        borderBottom: '1px solid rgba(0,229,255,0.08)',
        background: 'rgba(0,229,255,0.04)',
      }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
          <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
          WaitLess — Live Dashboard
        </Typography>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Token number */}
        <Box sx={{ textAlign: 'center', py: 1.5 }}>
          <Typography sx={{
            fontFamily: '"Syne",sans-serif', fontSize: 58, fontWeight: 800,
            color: 'primary.main', lineHeight: 1,
            opacity: pulse ? 0.35 : 1, transition: 'opacity 0.5s ease',
          }}>
            42
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Currently Serving</Typography>
        </Box>

        {/* Queue rows */}
        <Stack spacing={1} mt={1}>
          {customers.map((c) => (
            <Box key={c.initials} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, p: 1,
              borderRadius: 2, background: '#0C1F33',
              border: c.serving ? '1px solid rgba(0,255,148,0.2)' : '1px solid transparent',
            }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: '50%', background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.color }}>{c.initials}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{c.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{c.wait}</Typography>
              </Box>
              <Chip
                label={c.serving ? 'Serving' : c.token}
                size="small"
                sx={{
                  fontSize: 10, height: 20,
                  background: c.serving ? 'rgba(0,255,148,0.1)' : 'rgba(0,229,255,0.1)',
                  color: c.serving ? '#00FF94' : '#00E5FF',
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>

      {/* Actions */}
      <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
        <Button fullWidth variant="contained" size="small"
          startIcon={<CheckCircleOutline sx={{ fontSize: '14px !important' }} />}
          sx={{ fontSize: 12, py: 0.8 }}>
          Complete
        </Button>
        <Button fullWidth variant="outlined" size="small"
          startIcon={<SkipNext sx={{ fontSize: '14px !important' }} />}
          sx={{ fontSize: 12, py: 0.8, borderColor: 'rgba(0,229,255,0.2)', color: 'text.secondary' }}>
          Skip
        </Button>
      </Box>
    </Card>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ onDemoClick }) {
  const scrollTo = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });

  return (
    <Box sx={{
      position: 'relative', zIndex: 1, minHeight: '90vh',
      display: 'flex', alignItems: 'center',
      px: { xs: 3, md: 5 }, py: { xs: 6, md: 4 },
      gap: { xs: 4, md: 8 },
      flexDirection: { xs: 'column', md: 'row' },
    }}>
      {/* Left */}
      <Box sx={{ flex: 1, maxWidth: 620 }}>
        {/* Eyebrow badge */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          background: 'rgba(0,229,255,0.07)',
          border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: '100px', px: 2, py: 0.7,
          mb: 3,
          animation: 'fadeUp 0.6s ease both',
          '@keyframes fadeUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%', background: '#00E5FF',
            animation: 'pulse 2s ease infinite',
            '@keyframes pulse': {
              '0%,100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.4, transform: 'scale(0.8)' },
            },
          }} />
          <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.05em' }}>
            Real-time Queue Management
          </Typography>
        </Box>

        <Typography variant="h1" sx={{
          fontSize: { xs: 42, md: 64 }, lineHeight: 1.05, letterSpacing: '-0.02em', mb: 3,
          animation: 'fadeUp 0.6s 0.1s ease both',
        }}>
          Stop the Wait.{' '}
          <Box component="span" sx={{
            display: 'block',
            background: 'linear-gradient(135deg,#00E5FF,#7B61FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Start the Flow.
          </Box>
        </Typography>

        <Typography sx={{
          fontSize: 17, color: 'text.secondary', lineHeight: 1.7, maxWidth: 480, mb: 4,
          animation: 'fadeUp 0.6s 0.2s ease both',
        }}>
          WaitLess gives businesses a smarter way to manage customer queues in real time —
          with live updates, token assignment, and zero confusion.
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ animation: 'fadeUp 0.6s 0.3s ease both' }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => scrollTo('auth')}
            sx={{ px: 3.5, py: 1.4 }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayArrow />}
            onClick={onDemoClick}
            sx={{ px: 3.5, py: 1.4, borderColor: 'rgba(0,229,255,0.2)', color: 'text.primary' }}
          >
            Watch Demo
          </Button>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={4} mt={5} pt={4} sx={{
          borderTop: '1px solid rgba(0,229,255,0.1)',
          animation: 'fadeUp 0.6s 0.4s ease both',
        }}>
          {[['10x', 'Faster flow'], ['0', 'Physical tokens'], ['Live', 'Socket updates']].map(([val, label]) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"Syne",sans-serif', fontSize: 26, fontWeight: 700, color: 'primary.main' }}>
                {val}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right — preview card */}
      <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 360 } }}>
        <LivePreviewCard />
      </Box>
    </Box>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
const featureList = [
  { icon: BoltOutlined, title: 'Real-time Updates', desc: 'Socket.io powered live queue changes. Customers see their position update instantly — no refresh.', colorKey: 'primary' },
  { icon: QrCode2Outlined, title: 'QR Code Join', desc: 'Customers scan a QR code to join from their phone. No app download, zero friction.', colorKey: 'secondary' },
  { icon: TokenOutlined, title: 'Smart Token System', desc: 'Auto-assigned tokens with estimated wait times based on your average service duration.', colorKey: 'success' },
  { icon: DashboardOutlined, title: 'Live Dashboard', desc: 'See your full queue at a glance. Call, skip, or complete customers with a single click.', colorKey: 'primary' },
  { icon: LockOutlined, title: 'Business Auth', desc: 'JWT-based authentication. Each business manages their own queues independently and securely.', colorKey: 'secondary' },
  { icon: BarChartOutlined, title: 'Analytics', desc: 'Track completed customers, average wait times, and peak hours to optimize your flow.', colorKey: 'success' },
];

const colorMap = {
  primary: { bg: 'rgba(0,229,255,0.08)', color: '#00E5FF' },
  secondary: { bg: 'rgba(123,97,255,0.08)', color: '#7B61FF' },
  success: { bg: 'rgba(0,255,148,0.08)', color: '#00FF94' },
};

function FeaturesSection() {
  return (
    <Box id="features" sx={{
      position: 'relative', zIndex: 1,
      px: { xs: 3, md: 5 }, py: 10,
      background: 'rgba(6,18,32,0.6)',
      borderTop: '1px solid rgba(0,229,255,0.06)',
    }}>
      <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
        Why WaitLess
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 }, mb: 2 }}>
        Everything your queue needs
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 16, maxWidth: 500, lineHeight: 1.7, mb: 6 }}>
        Built for clinics, salons, banks, and any business that handles walk-in customers.
      </Typography>

      <Grid container spacing={2.5}>
        {featureList.map((f) => {
          const IconComp = f.icon;
          const c = colorMap[f.colorKey];
          return (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card sx={{
                p: 3, height: '100%', cursor: 'default',
                transition: 'all 0.3s',
                '&:hover': {
                  border: '1px solid rgba(0,229,255,0.3)',
                  transform: 'translateY(-4px)',
                  background: '#0C1F33',
                },
              }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: 2,
                  background: c.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', mb: 2,
                }}>
                  <IconComp sx={{ color: c.color, fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontSize: 15, mb: 1 }}>{f.title}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

// ─── Tech Stack Section ───────────────────────────────────────────────────────
const techStack = [
  { name: 'React.js', role: 'Frontend UI', emoji: '⚛' },
  { name: 'Material UI', role: 'Components', emoji: '🎨' },
  { name: 'Node.js', role: 'Backend Runtime', emoji: '🟢' },
  { name: 'Express.js', role: 'REST API', emoji: '🚂' },
  { name: 'MongoDB', role: 'Database', emoji: '🍃' },
  { name: 'Socket.io', role: 'Real-time', emoji: '🔌' },
  { name: 'JWT', role: 'Auth tokens', emoji: '🔑' },
  { name: 'bcryptjs', role: 'Security', emoji: '🔒' },
];

function TechSection() {
  return (
    <Box id="stack" sx={{
      position: 'relative', zIndex: 1,
      px: { xs: 3, md: 5 }, py: 10,
      borderTop: '1px solid rgba(0,229,255,0.06)',
    }}>
      <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
        Built With
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 }, mb: 2 }}>
        Modern Tech Stack
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 16, mb: 5, lineHeight: 1.7 }}>
        100% JavaScript — from database to UI. No TypeScript, no unnecessary complexity.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {techStack.map((t) => (
          <Paper key={t.name} elevation={0} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2.5, py: 1.5,
            background: '#061220',
            border: '1px solid rgba(0,229,255,0.1)',
            borderRadius: 2,
            cursor: 'default',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
          }}>
            <Typography sx={{ fontSize: 20 }}>{t.emoji}</Typography>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{t.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.role}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

// ─── Auth Section ─────────────────────────────────────────────────────────────
function AuthSection({ demoFill }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
  });

  // triggered by Demo button from parent
  useEffect(() => {
    if (demoFill) {
      setTab(0);
      setLoginData({ email: 'demo@waitless.app', password: 'demo1234' });
    }
  }, [demoFill]);

  const handleLogin = async () => {
    setError('');
    if (!loginData.email || !loginData.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/business/login', loginData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    setError('');
    if (!signupData.name || !signupData.email || !signupData.password) { setError('Please fill in required fields.'); return; }
    if (signupData.password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    if (signupData.password !== signupData.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/business/signup', {
        name: signupData.name, email: signupData.email,
        password: signupData.password, phone: signupData.phone, address: signupData.address,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const infoItems = [
    { emoji: '⚡', title: 'Up in 60 seconds', desc: 'Create your account and your first queue is live immediately.' },
    { emoji: '📲', title: 'Share your QR code', desc: 'Customers scan and join — no app, no friction.' },
    { emoji: '🎯', title: 'Manage from anywhere', desc: 'Your dashboard works on any device, desktop or mobile.' },
    { emoji: '🔐', title: 'Secure by default', desc: 'JWT auth and bcrypt hashed passwords out of the box.' },
  ];

  return (
    <Box id="auth" sx={{
      position: 'relative', zIndex: 1,
      px: { xs: 3, md: 5 }, py: 10,
      background: 'rgba(6,18,32,0.6)',
      borderTop: '1px solid rgba(0,229,255,0.06)',
    }}>
      <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
        Get Started
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 }, mb: 6 }}>
        Your queue, your rules
      </Typography>

      <Grid container spacing={6} alignItems="flex-start">
        {/* Left — info */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {infoItems.map((item) => (
              <Box key={item.title} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{
                  width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                  background: 'rgba(0,229,255,0.07)',
                  border: '1px solid rgba(0,229,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {item.emoji}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>{item.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* Right — form */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
              <Tabs
                value={tab}
                onChange={(_, v) => { setTab(v); setError(''); }}
                TabIndicatorProps={{ style: { background: '#00E5FF' } }}
                sx={{ px: 2, pt: 1 }}
              >
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2.5, fontSize: 13 }}>{error}</Alert>
              )}

              {/* LOGIN PANEL */}
              {tab === 0 && (
                <Stack spacing={2.5}>
                  <TextField
                    label="Business Email"
                    type="email"
                    fullWidth
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="clinic@example.com"
                    size="small"
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    size="small"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <LoadingButton
                    fullWidth variant="contained" size="large"
                    loading={loading} onClick={handleLogin}
                    sx={{ py: 1.3, mt: 0.5 }}
                  >
                    Login to Dashboard →
                  </LoadingButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                  </Box>

                  <Button
                    fullWidth variant="outlined" size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => setLoginData({ email: 'demo@waitless.app', password: 'demo1234' })}
                    sx={{ py: 1.2, borderColor: 'rgba(123,97,255,0.3)', color: '#7B61FF',
                      '&:hover': { borderColor: '#7B61FF', background: 'rgba(123,97,255,0.06)' } }}
                  >
                    Try Demo Account
                  </Button>

                  <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    No account?{' '}
                    <Box component="span" onClick={() => setTab(1)}
                      sx={{ color: 'primary.main', cursor: 'pointer' }}>
                      Sign up free
                    </Box>
                  </Typography>
                </Stack>
              )}

              {/* SIGNUP PANEL */}
              {tab === 1 && (
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Business Name" fullWidth size="small"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        placeholder="City Clinic"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone" fullWidth size="small"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        placeholder="9876543210"
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="Business Email" type="email" fullWidth size="small"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="you@business.com"
                  />
                  <TextField
                    label="Address" fullWidth size="small"
                    value={signupData.address}
                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                    placeholder="123 MG Road, Jaipur"
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Password" type="password" fullWidth size="small"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm Password" type="password" fullWidth size="small"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </Grid>
                  </Grid>

                  <LoadingButton
                    fullWidth variant="contained" size="large"
                    loading={loading} onClick={handleSignup}
                    sx={{ py: 1.3, mt: 0.5 }}
                  >
                    Create Business Account →
                  </LoadingButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                  </Box>

                  <Button
                    fullWidth variant="outlined" size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => { setTab(0); setLoginData({ email: 'demo@waitless.app', password: 'demo1234' }); }}
                    sx={{ py: 1.2, borderColor: 'rgba(123,97,255,0.3)', color: '#7B61FF',
                      '&:hover': { borderColor: '#7B61FF', background: 'rgba(123,97,255,0.06)' } }}
                  >
                    Try Demo Account
                  </Button>

                  <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Already registered?{' '}
                    <Box component="span" onClick={() => setTab(0)}
                      sx={{ color: 'primary.main', cursor: 'pointer' }}>
                      Login here
                    </Box>
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <Box component="footer" sx={{
      position: 'relative', zIndex: 1,
      px: { xs: 3, md: 5 }, py: 3,
      borderTop: '1px solid rgba(0,229,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 1,
    }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        © 2025 WaitLess — Built with the MERN stack
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        React · Node · MongoDB · Socket.io
      </Typography>
    </Box>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [demoFill, setDemoFill] = useState(false);

  const triggerDemo = () => {
    document.getElementById('auth').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setDemoFill(v => !v), 600); // toggle to re-trigger useEffect
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <Box sx={{ background: 'background.default', minHeight: '100vh', overflowX: 'hidden' }}>
        <AnimatedBg />
        <Navbar />
        <HeroSection onDemoClick={triggerDemo} />
        <FeaturesSection />
        <TechSection />
        <AuthSection demoFill={demoFill} />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}