import type React from "react"
import { Typography, CssBaseline, Box } from "@mui/material"
const HomePage: React.FC = () => {
  return (
    <Box>
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Typography>This is your main content area.</Typography>
    </Box>
  )
}

export default HomePage
