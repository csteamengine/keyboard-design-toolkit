import type React from "react"
import { Typography, CssBaseline, Box } from "@mui/material"
const HomePage: React.FC = () => {
  return (
    <Box m={2}>
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Welcome to the Keyboard Design Toolkit
      </Typography>
      <Typography>WIP, of course...</Typography>
    </Box>
  )
}

export default HomePage
