import type React from "react"
import { Box, Typography, Button, Container } from "@mui/material"
import { useNavigate } from "react-router-dom"

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    void navigate("/auth/login") // Change to your actual design route
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography variant="h2" gutterBottom>
          Keyboard Design Toolkit
        </Typography>
        <Typography variant="h6" color="text.secondary" component="p">
          Craft custom keyboard layouts, export designs, and bring your ideas to
          life.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          sx={{ mt: 4 }}
        >
          Login
        </Button>
      </Box>
    </Container>
  )
}

export default WelcomePage
