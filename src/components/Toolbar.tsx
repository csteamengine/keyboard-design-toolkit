// Toolbar.tsx
import {
  AppBar,
  Box,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar as MuiToolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircle from "@mui/icons-material/AccountCircle"
import React from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import type { RootState } from "../app/store.ts"
import { supabase } from "../app/supabaseClient.ts"
import { signOut } from "../features/auth/authSlice.ts"
import { Link } from "react-router-dom"

const drawerWidth = 240

const Toolbar = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const dispatch = useAppDispatch()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const menuItems = [
    { label: "Home", path: "/" },
    {
      label: "Keyboard Editor",
      path: "/keyboards",
    },
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <List sx={{ mt: 8 }}>
      {menuItems.map(item => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton component={Link} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )

  const session = useAppSelector((state: RootState) => state.auth.session)
  const userEmail = session?.user.email
  const username = session?.user.user_metadata.full_name ?? userEmail

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    dispatch(signOut())
    handleMenuClose()
  }

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <MuiToolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          {username && (
            <Typography variant="body1" sx={{ mr: 1 }}>
              {username}
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem
              onClick={() => {
                void handleLogout()
              }}
            >
              Logout
            </MenuItem>{" "}
          </Menu>
        </MuiToolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </MuiDrawer>

        {/* Desktop drawer */}
        <MuiDrawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawer}
        </MuiDrawer>
      </Box>
    </>
  )
}

export default Toolbar
