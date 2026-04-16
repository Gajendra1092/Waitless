import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#111118",
      paper: "#16161e",
      paperLight: "#1a1a24",
    },
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#8a8a8a",
    },
    success: {
      main: "#22c55e",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
    info: {
      main: "#3b82f6",
    },
    divider: "#2a2a35",
    text: {
      primary: "#e0e0e0",
      secondary: "#8a8a8a",
      disabled: "#555555",
    },
    custom: {
      borderLight: "#3a3a45",
      purple: "#8b5cf6",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#111118",
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a35 #111118",
        },
        "*::-webkit-scrollbar": { width: "6px" },
        "*::-webkit-scrollbar-track": { background: "#111118" },
        "*::-webkit-scrollbar-thumb": {
          background: "#2a2a35",
          borderRadius: "3px",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#16161e",
          borderRight: "1px solid #2a2a35",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #2a2a35", padding: "12px 16px" },
        head: {
          fontWeight: 600,
          color: "#8a8a8a",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: "8px" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a2a35" },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3a3a45",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#5a5a65",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: "8px" } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: "6px", fontWeight: 500, fontSize: "0.75rem" },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#8a8a8a",
          "&.Mui-selected": { backgroundColor: "#2a2a35", color: "#ffffff" },
        },
      },
    },
  },
});

export default theme;