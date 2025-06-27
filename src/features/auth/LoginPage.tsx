import type React from "react"
import { useState } from "react"
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
} from "@mui/material"
import GitHubIcon from "@mui/icons-material/GitHub"
import GoogleIcon from "@mui/icons-material/Google"
import { supabase } from "./supabaseClient"
import { setSession } from "./authSlice"
import { useAppDispatch } from "../../app/hooks.ts"
import { Link } from "react-router-dom"

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: "github" | "google") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }

  const handleEmailLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      dispatch(setSession(data.session))
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GitHubIcon />}
            onClick={() => handleOAuthLogin("github")}
          >
            GitHub
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={() => handleOAuthLogin("google")}
          >
            Google
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
            }}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleEmailLogin}
          >
            Login with Email
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don’t have an account? <Link to="/auth/signup">Sign Up</Link>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  )
}

export default LoginPage
