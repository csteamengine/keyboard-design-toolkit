import { createTheme } from "@mui/material/styles"

// Modern Slate/Indigo color palette
const palette = {
  primary: {
    main: "#4f46e5",
    light: "#818cf8",
    dark: "#4338ca",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#64748b",
    light: "#94a3b8",
    dark: "#475569",
    contrastText: "#ffffff",
  },
  error: {
    main: "#ef4444",
    light: "#fee2e2",
    dark: "#dc2626",
  },
  warning: {
    main: "#f59e0b",
    light: "#fef3c7",
    dark: "#d97706",
  },
  success: {
    main: "#10b981",
    light: "#d1fae5",
    dark: "#059669",
  },
  info: {
    main: "#3b82f6",
    light: "#dbeafe",
    dark: "#2563eb",
  },
  background: {
    default: "#fafafa",
    paper: "#ffffff",
  },
  text: {
    primary: "#1e293b",
    secondary: "#64748b",
    disabled: "#94a3b8",
  },
  divider: "#e2e8f0",
  action: {
    hover: "#f1f5f9",
    selected: "#e0e7ff",
    disabled: "#94a3b8",
    disabledBackground: "#f1f5f9",
  },
  grey: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
}

export const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.875rem",
    },
    body1: {
      fontSize: "0.875rem",
    },
    body2: {
      fontSize: "0.8125rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
    caption: {
      fontSize: "0.75rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 6,
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        elevation3: {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            "& fieldset": {
              borderColor: "#e2e8f0",
            },
            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4f46e5",
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          minHeight: 48,
          "&.Mui-selected": {
            color: "#4f46e5",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#4f46e5",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#4f46e5",
        },
        thumb: {
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "0 0 0 8px rgba(79, 70, 229, 0.16)",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #e2e8f0",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1e293b",
          fontSize: "0.75rem",
          padding: "6px 12px",
          borderRadius: 4,
        },
        arrow: {
          color: "#1e293b",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.125rem",
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme
