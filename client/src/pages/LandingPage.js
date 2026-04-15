import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, Tab, Tabs,
  Grid, Card, CardContent, Chip, Alert, Stack, Paper,
} from '@mui/material';
import {
  BoltOutlined, QrCode2Outlined, TokenOutlined, DashboardOutlined,
  LockOutlined, BarChartOutlined, ArrowForward, PlayArrow,
  CheckCircleOutline, SkipNext,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// ─── Theme ────
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

// ─── Animated Background ──────────
// FIX 1: position absolute (not fixed) so it's contained in the relative wrapper
// FIX 2: dot grid instead of line grid — more visible on dark bg
function AnimatedBg() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,229,255,0.18) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        opacity: 0.55,
      }} />
      <Box sx={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 65%)',
        top: -150, right: -150, filter: 'blur(40px)',
        animation: 'orb1 8s ease-in-out infinite',
        '@keyframes orb1': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-40px,50px)' },
        },
      }} />
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 65%)',
        bottom: 0, left: -150, filter: 'blur(40px)',
        animation: 'orb2 10s ease-in-out infinite',
        '@keyframes orb2': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(50px,-40px)' },
        },
      }} />
    </Box>
  );
}

// ─── Navbar ────────
function Navbar() {
  const scrollTo = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  return (
    <Box component="nav" sx={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: { xs: 3, md: 6 }, py: 2,
      borderBottom: '1px solid rgba(0,229,255,0.1)',
      backdropFilter: 'blur(24px)',
      background: 'rgba(2,10,20,0.75)',
    }}>
      <Typography sx={{
        fontFamily: '"Syne",sans-serif', fontSize: 22, fontWeight: 800,
        background: 'linear-gradient(135deg,#00E5FF,#7B61FF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.01em',
      }}>
        WaitLess
      </Typography>
      <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
        {[['features', 'Features'], ['stack', 'Tech Stack'], ['auth', 'Get Started']].map(([id, label]) => (
          <Typography key={id} onClick={() => scrollTo(id)} sx={{
            fontSize: 14, color: 'text.secondary', cursor: 'pointer',
            '&:hover': { color: 'text.primary' }, transition: 'color 0.2s',
          }}>
            {label}
          </Typography>
        ))}
        <Button variant="contained" size="small" onClick={() => scrollTo('auth')}
          sx={{ px: 3, py: 0.9, fontSize: 13, borderRadius: 2 }}>
          Login →
        </Button>
      </Stack>
      <Button variant="contained" size="small" onClick={() => scrollTo('auth')}
        sx={{ display: { xs: 'flex', md: 'none' }, fontSize: 12 }}>
        Login
      </Button>
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
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography sx={{
            fontFamily: '"Syne",sans-serif', fontSize: 64, fontWeight: 800,
            color: 'primary.main', lineHeight: 1,
            opacity: pulse ? 0.3 : 1, transition: 'opacity 0.6s ease',
          }}>
            42
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Currently Serving</Typography>
        </Box>
        <Stack spacing={1} mt={1}>
          {customers.map((c) => (
            <Box key={c.initials} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, p: 1,
              borderRadius: 2, background: '#0C1F33',
              border: c.serving ? '1px solid rgba(0,255,148,0.2)' : '1px solid transparent',
            }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '50%', background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.color }}>{c.initials}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{c.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{c.wait}</Typography>
              </Box>
              <Chip label={c.serving ? 'Serving' : c.token} size="small" sx={{
                fontSize: 10, height: 20,
                background: c.serving ? 'rgba(0,255,148,0.1)' : 'rgba(0,229,255,0.1)',
                color: c.serving ? '#00FF94' : '#00E5FF',
              }} />
            </Box>
          ))}
        </Stack>
      </CardContent>

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
      position: 'relative', zIndex: 1,
      display: 'flex', alignItems: 'center',
      minHeight: { md: '92vh' },
      px: { xs: 3, md: 6 },
      py: { xs: 8, md: 0 },
      gap: { xs: 6, md: 10 },
      flexDirection: { xs: 'column', md: 'row' },
    }}>
      <Box sx={{ flex: 1, maxWidth: { md: 640 } }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          background: 'rgba(0,229,255,0.06)',
          border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: '100px', px: 2, py: 0.8, mb: 4,
          animation: 'fadeUp 0.5s ease both',
          '@keyframes fadeUp': {
            from: { opacity: 0, transform: 'translateY(16px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%', background: '#00E5FF',
            animation: 'blink 2s ease infinite',
            '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
          }} />
          <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.05em' }}>
            Real-time Queue Management
          </Typography>
        </Box>

        <Typography variant="h1" sx={{
          fontSize: { xs: 44, sm: 56, md: 70 },
          lineHeight: 1.02, letterSpacing: '-0.025em', mb: 3,
          animation: 'fadeUp 0.5s 0.1s ease both',
        }}>
          Stop the Wait.
          <Box component="span" sx={{
            display: 'block',
            background: 'linear-gradient(135deg,#00E5FF 30%,#7B61FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Start the Flow.
          </Box>
        </Typography>

        <Typography sx={{
          fontSize: { xs: 15, md: 17 }, color: 'text.secondary',
          lineHeight: 1.75, maxWidth: 500, mb: 5,
          animation: 'fadeUp 0.5s 0.2s ease both',
        }}>
          WaitLess gives businesses a smarter way to manage customer queues in real time —
          with live socket updates, token assignment, and zero confusion.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
          sx={{ animation: 'fadeUp 0.5s 0.3s ease both' }}>
          <Button variant="contained" size="large" endIcon={<ArrowForward />}
            onClick={() => scrollTo('auth')}
            sx={{ px: 4, py: 1.5, fontSize: 15, borderRadius: 2 }}>
            Get Started Free
          </Button>
          <Button variant="outlined" size="large" startIcon={<PlayArrow />}
            onClick={onDemoClick}
            sx={{ px: 4, py: 1.5, fontSize: 15, borderRadius: 2, borderColor: 'rgba(0,229,255,0.25)', color: 'text.primary' }}>
            Watch Demo
          </Button>
        </Stack>

        <Stack direction="row" spacing={5} mt={6} pt={5}
          sx={{ borderTop: '1px solid rgba(0,229,255,0.1)', animation: 'fadeUp 0.5s 0.4s ease both' }}>
          {[['10x', 'Faster flow'], ['0', 'Physical tokens'], ['Live', 'Socket updates']].map(([val, label]) => (
            <Box key={label}>
              <Typography sx={{
                fontFamily: '"Syne",sans-serif',
                fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: 'primary.main', lineHeight: 1,
              }}>
                {val}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 400 }, display: { xs: 'none', md: 'block' } }}>
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
      px: { xs: 3, md: 6 }, py: { xs: 8, md: 12 },
      background: 'rgba(6,18,32,0.7)',
      borderTop: '1px solid rgba(0,229,255,0.07)',
    }}>
      <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1.5 }}>
        Why WaitLess
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 42 }, mb: 2 }}>
        Everything your queue needs
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: { xs: 14, md: 16 }, maxWidth: 520, lineHeight: 1.75, mb: 7 }}>
        Built for clinics, salons, banks, and any business that handles walk-in customers.
      </Typography>

      {/* FIX: MUI v7 — size prop, no item prop */}
      <Grid container spacing={3}>
        {featureList.map((f) => {
          const IconComp = f.icon;
          const c = colorMap[f.colorKey];
          return (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{
                p: 3.5, height: '100%', cursor: 'default',
                transition: 'all 0.25s ease',
                '&:hover': {
                  border: '1px solid rgba(0,229,255,0.3)',
                  transform: 'translateY(-5px)',
                  background: '#0C1F33',
                },
              }}>
                <Box sx={{
                  width: 46, height: 46, borderRadius: 2.5,
                  background: c.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', mb: 2.5,
                }}>
                  <IconComp sx={{ color: c.color, fontSize: 23 }} />
                </Box>
                <Typography variant="h6" sx={{ fontSize: 15, mb: 1.2 }}>{f.title}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</Typography>
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
      px: { xs: 3, md: 6 }, py: { xs: 8, md: 12 },
      borderTop: '1px solid rgba(0,229,255,0.07)',
    }}>
      <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1.5 }}>
        Built With
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 42 }, mb: 2 }}>
        Modern Tech Stack
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: { xs: 14, md: 16 }, mb: 6, lineHeight: 1.75 }}>
        100% JavaScript — from database to UI. No TypeScript, no unnecessary complexity.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {techStack.map((t) => (
          <Paper key={t.name} elevation={0} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2.5, py: 1.5,
            background: '#061220',
            border: '1px solid rgba(0,229,255,0.1)',
            borderRadius: 2.5,
            cursor: 'default',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: '#00E5FF', transform: 'translateY(-3px)', background: '#0C1F33' },
          }}>
            <Typography sx={{ fontSize: 22 }}>{t.emoji}</Typography>
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
    if (signupData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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
      px: { xs: 3, md: 6 }, py: { xs: 8, md: 12 },
      background: 'rgba(6,18,32,0.7)',
      borderTop: '1px solid rgba(0,229,255,0.07)',
    }}>
      <Typography sx={{ fontSize: 12, color: 'primary.main', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1.5 }}>
        Get Started
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 42 }, mb: 7 }}>
        Your queue, your rules
      </Typography>

      {/* FIX: MUI v7 Grid — size prop, no item prop */}
      <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3.5}>
            {infoItems.map((item) => (
              <Box key={item.title} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                  background: 'rgba(0,229,255,0.06)',
                  border: '1px solid rgba(0,229,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {item.emoji}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.65 }}>{item.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
              <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }}
                TabIndicatorProps={{ style: { background: '#00E5FF' } }}
                sx={{ px: 2, pt: 1 }}>
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              {error && <Alert severity="error" sx={{ mb: 2.5, fontSize: 13 }}>{error}</Alert>}

              {tab === 0 && (
                <Stack spacing={2.5}>
                  <TextField label="Business Email" type="email" fullWidth size="small"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="clinic@example.com"
                  />
                  <TextField label="Password" type="password" fullWidth size="small"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <Button fullWidth variant="contained" size="large"
                    loading={loading} onClick={handleLogin}
                    sx={{ py: 1.4, mt: 0.5, borderRadius: 2 }}>
                    Login to Dashboard →
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                  </Box>
                  <Button fullWidth variant="outlined" size="large" startIcon={<PlayArrow />}
                    onClick={() => setLoginData({ email: 'demo@waitless.app', password: 'demo1234' })}
                    sx={{ py: 1.3, borderRadius: 2, borderColor: 'rgba(123,97,255,0.3)', color: '#7B61FF',
                      '&:hover': { borderColor: '#7B61FF', background: 'rgba(123,97,255,0.06)' } }}>
                    Try Demo Account
                  </Button>
                  <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    No account?{' '}
                    <Box component="span" onClick={() => setTab(1)}
                      sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      Sign up free
                    </Box>
                  </Typography>
                </Stack>
              )}

              {tab === 1 && (
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Business Name" fullWidth size="small"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        placeholder="City Clinic"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Phone" fullWidth size="small"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        placeholder="9876543210"
                      />
                    </Grid>
                  </Grid>
                  <TextField label="Business Email" type="email" fullWidth size="small"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="you@business.com"
                  />
                  <TextField label="Address" fullWidth size="small"
                    value={signupData.address}
                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                    placeholder="123 MG Road, Jaipur"
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Password" type="password" fullWidth size="small"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Confirm Password" type="password" fullWidth size="small"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </Grid>
                  </Grid>
                  <Button fullWidth variant="contained" size="large"
                    loading={loading} onClick={handleSignup}
                    sx={{ py: 1.4, mt: 0.5, borderRadius: 2 }}>
                    Create Business Account →
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.1)' }} />
                  </Box>
                  <Button fullWidth variant="outlined" size="large" startIcon={<PlayArrow />}
                    onClick={() => { setTab(0); setLoginData({ email: 'demo@waitless.app', password: 'demo1234' }); }}
                    sx={{ py: 1.3, borderRadius: 2, borderColor: 'rgba(123,97,255,0.3)', color: '#7B61FF',
                      '&:hover': { borderColor: '#7B61FF', background: 'rgba(123,97,255,0.06)' } }}>
                    Try Demo Account
                  </Button>
                  <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Already registered?{' '}
                    <Box component="span" onClick={() => setTab(0)}
                      sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
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
      px: { xs: 3, md: 6 }, py: 3.5,
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
    setTimeout(() => setDemoFill(v => !v), 600);
  };

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* FIX: position relative here so AnimatedBg (absolute) stays contained */}
      <Box sx={{ position: 'relative', background: '#020A14', minHeight: '100vh', overflowX: 'hidden' }}>
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