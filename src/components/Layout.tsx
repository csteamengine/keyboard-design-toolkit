import { Outlet } from "react-router-dom"
import Toolbar from "./Toolbar"
import { Box } from "@mui/material"

const drawerWidth = 240

const Layout = () => {
  return (
    <Box
      className="app-shell"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // 🔑 full height
      }}
    >
      <Toolbar />
      <Box
        className="mainBox"
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          width: { sm: `calc(100% - ${String(drawerWidth)}px)` },
          ml: { sm: `${String(drawerWidth)}px` },
          mt: 8,
          overflow: "auto",
          height: "100%",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
