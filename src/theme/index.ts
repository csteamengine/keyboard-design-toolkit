import { createTheme } from "@mui/material/styles"

// Modern Dark Theme - Bold SaaS Aesthetic
// Inspired by Linear, Vercel, Stripe

const palette = {
  mode: "dark" as const,
  primary: {
    main: "#6366f1",
    light: "#818cf8",
    dark: "#4f46e5",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#a1a1aa",
    light: "#d4d4d8",
    dark: "#71717a",
    contrastText: "#ffffff",
  },
  error: {
    main: "#ef4444",
    light: "rgba(239, 68, 68, 0.15)",
    dark: "#dc2626",
  },
  warning: {
    main: "#f59e0b",
    light: "rgba(245, 158, 11, 0.15)",
    dark: "#d97706",
  },
  success: {
    main: "#10b981",
    light: "rgba(16, 185, 129, 0.15)",
    dark: "#059669",
  },
  info: {
    main: "#3b82f6",
    light: "rgba(59, 130, 246, 0.15)",
    dark: "#2563eb",
  },
  background: {
    default: "#0a0a0b",
    paper: "#18181b",
  },
  text: {
    primary: "#fafafa",
    secondary: "#a1a1aa",
    disabled: "#71717a",
  },
  divider: "#27272a",
  action: {
    hover: "#1f1f23",
    selected: "rgba(99, 102, 241, 0.15)",
    disabled: "#71717a",
    disabledBackground: "#27272a",
  },
  grey: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },
}

export const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      color: "#fafafa",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      color: "#fafafa",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#fafafa",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.25rem",
      color: "#fafafa",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1rem",
      color: "#fafafa",
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.875rem",
      color: "#fafafa",
    },
    body1: {
      fontSize: "0.875rem",
      color: "#a1a1aa",
    },
    body2: {
      fontSize: "0.8125rem",
      color: "#a1a1aa",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
    caption: {
      fontSize: "0.75rem",
      color: "#71717a",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0a0a0b",
          color: "#fafafa",
        },
      },
    },
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
          background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)",
          },
        },
        outlined: {
          borderColor: "#3f3f46",
          color: "#a1a1aa",
          "&:hover": {
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            color: "#fafafa",
          },
        },
        text: {
          color: "#a1a1aa",
          "&:hover": {
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            color: "#fafafa",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#18181b",
          borderColor: "#27272a",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)",
        },
        elevation2: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)",
        },
        elevation3: {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
        },
        elevation4: {
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#3f3f46",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            backgroundColor: "#27272a",
            "& fieldset": {
              borderColor: "#3f3f46",
            },
            "&:hover fieldset": {
              borderColor: "#52525b",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
              borderWidth: 1,
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)",
            },
          },
          "& .MuiInputBase-input": {
            color: "#fafafa",
          },
          "& .MuiInputLabel-root": {
            color: "#a1a1aa",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#6366f1",
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#a1a1aa",
          "&.Mui-focused": {
            color: "#6366f1",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#3f3f46",
          "&.Mui-checked": {
            color: "#6366f1",
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
          color: "#a1a1aa",
          "&.Mui-selected": {
            color: "#fafafa",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
          height: 2,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#6366f1",
        },
        thumb: {
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.2)",
          },
        },
        track: {
          background: "linear-gradient(90deg, #7c3aed, #6366f1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111113",
          borderRight: "1px solid #27272a",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(17, 17, 19, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #27272a",
          boxShadow: "none",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#a1a1aa",
          "&:hover": {
            backgroundColor: "#1f1f23",
            color: "#fafafa",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            color: "#fafafa",
            "&:hover": {
              backgroundColor: "rgba(99, 102, 241, 0.2)",
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: "#a1a1aa",
          "&:hover": {
            backgroundColor: "#1f1f23",
            color: "#fafafa",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            color: "#fafafa",
            "&:hover": {
              backgroundColor: "rgba(99, 102, 241, 0.2)",
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#71717a",
          ".Mui-selected &": {
            color: "#6366f1",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#27272a",
          color: "#fafafa",
          fontSize: "0.75rem",
          padding: "6px 12px",
          borderRadius: 4,
          border: "1px solid #3f3f46",
        },
        arrow: {
          color: "#27272a",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          borderRadius: 12,
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#fafafa",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#a1a1aa",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#27272a",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "#fca5a5",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        },
        standardSuccess: {
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          color: "#6ee7b7",
          border: "1px solid rgba(16, 185, 129, 0.3)",
        },
        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          color: "#fcd34d",
          border: "1px solid rgba(245, 158, 11, 0.3)",
        },
        standardInfo: {
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          color: "#93c5fd",
          border: "1px solid rgba(59, 130, 246, 0.3)",
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#27272a",
          color: "#fafafa",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#a1a1aa",
          "&:hover": {
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            color: "#fafafa",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#fafafa",
        },
        input: {
          "&::placeholder": {
            color: "#71717a",
            opacity: 1,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#818cf8",
          textDecoration: "none",
          "&:hover": {
            color: "#a5b4fc",
            textDecoration: "underline",
          },
        },
      },
    },
  },
})

export default theme
