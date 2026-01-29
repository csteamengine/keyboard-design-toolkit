import * as React from "react"
import type { CSSObject, Theme } from "@mui/material/styles"
import { styled, useTheme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import MuiDrawer from "@mui/material/Drawer"
import type { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import MuiAppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import List from "@mui/material/List"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import HomeIcon from "@mui/icons-material/Home"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import AccountCircle from "@mui/icons-material/AccountCircle"
import { ListItemIcon, Menu, MenuItem } from "@mui/material"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../app/supabaseClient.ts"
import { useLogout, useSession } from "../context/SessionContext.tsx"

const drawerWidth = 240

const Main = styled("main", {
  shouldForwardProp: prop => prop !== "open",
})<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  height: "100vh",
  overflow: "hidden",
  backgroundColor: "#0a0a0b",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

type AppBarProps = {
  open?: boolean
} & MuiAppBarProps

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}))

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: "#111113",
  borderRight: "1px solid #27272a",
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  backgroundColor: "#111113",
  borderRight: "1px solid #27272a",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "rgba(17, 17, 19, 0.8)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #27272a",
  boxShadow: "none",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${String(drawerWidth)}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}))

export default function PersistentDrawerLeft() {
  const theme = useTheme()
  const logout = useLogout()
  const { user, session } = useSession()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    {
      label: "Keyboard Editor",
      path: "/keyboards",
      icon: <KeyboardIcon />,
    },
  ]

  const drawerContents = (
    <List>
      {menuItems.map(item => (
        <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
          <ListItemButton
            selected={location.pathname === item.path}
            sx={[
              {
                minHeight: 48,
                px: 2.5,
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
              open
                ? {
                    justifyContent: "initial",
                  }
                : {
                    justifyContent: "center",
                  },
            ]}
            component={Link}
            to={item.path}
          >
            <ListItemIcon
              sx={[
                {
                  minWidth: 0,
                  justifyContent: "center",
                  color: "inherit",
                },
                open
                  ? {
                      mr: 3,
                    }
                  : {
                      mr: "auto",
                    },
              ]}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={[
                open
                  ? {
                      opacity: 1,
                    }
                  : {
                      opacity: 0,
                    },
              ]}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
  const userEmail = user?.email
  const username = String(user?.user_metadata.full_name ?? userEmail)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    void logout()
    handleMenuClose()
    void navigate("/auth/login", { replace: true })
  }

  return (
    <Box sx={{ display: "flex", backgroundColor: "#0a0a0b" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              { mr: 2, color: "#a1a1aa", "&:hover": { color: "#fafafa" } },
              open && { display: "none" },
            ]}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 600,
            }}
          >
            Keyboard Design Toolkit
          </Typography>

          {/* Right-aligned section */}

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {session && username && (
              <Typography variant="body1" sx={{ mr: 1, color: "#a1a1aa" }}>
                {username}
              </Typography>
            )}

            <IconButton
              sx={{ color: "#a1a1aa", "&:hover": { color: "#fafafa" } }}
              onClick={handleMenuOpen}
            >
              <AccountCircle />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {session && (
              <Box>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={() => void handleLogout()}>Logout</MenuItem>
              </Box>
            )}
            {!session && (
              <Box>
                <MenuItem component={Link} to="/auth/login">
                  Login
                </MenuItem>
                <MenuItem component={Link} to="/auth/signup">
                  Sign Up
                </MenuItem>
              </Box>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" anchor="left" open={open}>
        <DrawerHeader sx={{ backgroundColor: "#111113" }}>
          <IconButton
            onClick={handleDrawerClose}
            sx={{ color: "#a1a1aa", "&:hover": { color: "#fafafa" } }}
          >
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: "#27272a" }} />
        {drawerContents}
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  )
}
