import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Settings as SettingsIcon, Person as PersonIcon, Lock as LockIcon } from '@mui/icons-material';
import api from '../utils/api';

const SettingsCard = ({ title, icon, children }) => (
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
    </Box>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Paper>
);

const SettingsPage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/business/profile');
        setProfile(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setSnackbar({ open: true, message: 'Could not load profile data.', severity: 'error' });
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.patch('/api/business/profile', {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      setSnackbar({ open: true, message: data.message || 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update profile.', severity: 'error' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (password.newPassword !== password.confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match.', severity: 'error' });
      return;
    }
    setLoadingPassword(true);
    try {
      const { data } = await api.post('/api/business/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setSnackbar({ open: true, message: data.message || 'Password changed successfully!', severity: 'success' });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to change password.', severity: 'error' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SettingsIcon sx={{ color: '#8a8a8a', fontSize: 32 }} /> Settings
      </Typography>
      <Typography sx={{ color: '#8a8a8a', mb: 4 }}>
        Manage your business profile and account security.
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <SettingsCard title="Business Profile" icon={<PersonIcon sx={{ color: '#8a8a8a' }} />}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Business Name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleProfileChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  value={profile.email || ''}
                  fullWidth
                  size="small"
                  disabled
                  helperText="Email cannot be changed."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Phone"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleProfileChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleProfileChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleProfileSave}
                disabled={loadingProfile}
                startIcon={loadingProfile && <CircularProgress size={20} color="inherit" />}
              >
                {loadingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </SettingsCard>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <SettingsCard title="Security" icon={<LockIcon sx={{ color: '#8a8a8a' }} />}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={password.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={password.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handlePasswordSave}
                disabled={loadingPassword}
                startIcon={loadingPassword && <CircularProgress size={20} color="inherit" />}
              >
                {loadingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </SettingsCard>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;