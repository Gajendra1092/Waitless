import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import api from "../utils/api";
import { useProfileStore } from "../store/useProfileStore";

const SettingsCard = ({ title, icon, action, children }) => (
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: "12px" }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Paper>
);

const SettingsPage = () => {
  const { profile: globalProfile, fetchProfile, updateProfileLocally } = useProfileStore();

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (globalProfile) {
      setProfile((prev) => ({ ...prev, ...globalProfile }));
      setOriginalProfile(globalProfile);
    }
  }, [globalProfile]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.patch("/api/business/profile", {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      updateProfileLocally({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      setSnackbar({
        open: true,
        message: data.message || "Profile updated successfully!",
        severity: "success",
      });
      setOriginalProfile(profile);
      setIsEditingProfile(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update profile.",
        severity: "error",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (password.newPassword !== password.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords do not match.",
        severity: "error",
      });
      return;
    }
    setLoadingPassword(true);
    try {
      const { data } = await api.post("/api/business/change-password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setSnackbar({
        open: true,
        message: data.message || "Password changed successfully!",
        severity: "success",
      });
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to change password.",
        severity: "error",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleRevertProfile = () => {
    setProfile(originalProfile);
    setIsEditingProfile(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#ffffff",
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <SettingsIcon sx={{ color: "#8a8a8a", fontSize: 32 }} /> Settings
      </Typography>
      <Typography sx={{ color: "#8a8a8a", mb: 4 }}>
        Manage your business profile and account security.
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Settings */}
        <Grid size={{ xs: 12 }}>
          <SettingsCard
            title="Business Profile"
            icon={<PersonIcon sx={{ color: "#8a8a8a" }} />}
            action={
              !isEditingProfile && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit
                </Button>
              )
            }
          >
            {!isEditingProfile ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                    Business ID
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#e0e0e0",
                      fontWeight: 500,
                      fontFamily: "monospace",
                    }}
                  >
                    {profile.id || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                    Business Name
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e0e0e0", fontWeight: 500 }}
                  >
                    {profile.name || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                    Email Address
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e0e0e0", fontWeight: 500 }}
                  >
                    {profile.email || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                    Contact Phone
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e0e0e0", fontWeight: 500 }}
                  >
                    {profile.phone || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: "#8a8a8a" }}>
                    Address
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e0e0e0", fontWeight: 500 }}
                  >
                    {profile.address || "—"}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Business ID"
                      value={profile.id || ""}
                      fullWidth
                      size="small"
                      disabled
                      helperText="ID cannot be changed."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Email Address"
                      value={profile.email || ""}
                      fullWidth
                      size="small"
                      disabled
                      helperText="Email cannot be changed."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Business Name"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleProfileChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Contact Phone"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleProfileChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Address"
                      name="address"
                      value={profile.address || ""}
                      onChange={handleProfileChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="text"
                    onClick={handleRevertProfile}
                    disabled={loadingProfile}
                    sx={{ color: "#8a8a8a" }}
                  >
                    Revert Changes
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleProfileSave}
                    disabled={loadingProfile}
                    startIcon={
                      loadingProfile && (
                        <CircularProgress size={20} color="inherit" />
                      )
                    }
                  >
                    {loadingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Box>
            )}
          </SettingsCard>
        </Grid>

        {/* Security Settings */}
        <Grid size={{ xs: 12 }}>
          <SettingsCard
            title="Security"
            icon={<LockIcon sx={{ color: "#8a8a8a" }} />}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handlePasswordSave}
                disabled={loadingPassword}
                startIcon={
                  loadingPassword && (
                    <CircularProgress size={20} color="inherit" />
                  )
                }
              >
                {loadingPassword ? "Changing..." : "Change Password"}
              </Button>
            </Box>
          </SettingsCard>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
