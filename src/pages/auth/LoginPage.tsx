import * as React from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import Divider from "@mui/material/Divider"
import FormLabel from "@mui/material/FormLabel"
import FormControl from "@mui/material/FormControl"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import ForgotPassword from "./ForgotPassword.tsx"
import { useState } from "react"
import { supabase } from "../../app/supabaseClient.ts"
import GoogleIcon from "@mui/icons-material/Google"
import GitHubIcon from "@mui/icons-material/GitHub"
import { Link, useNavigate } from "react-router-dom"
import { Alert, Card, Link as MuiLink } from "@mui/material"

const SignInContainer = styled(Stack)(() => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: "16px",
  position: "relative",
  backgroundColor: "#0a0a0b",
  "@media (min-width: 600px)": {
    padding: "32px",
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: 0,
    inset: 0,
    background: `
      radial-gradient(ellipse at 20% 30%, rgba(124, 58, 237, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
    `,
    pointerEvents: "none",
  },
}))

export default function LoginPage() {
  const navigate = useNavigate()
  const [emailError, setEmailError] = React.useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("")
  const [passwordError, setPasswordError] = React.useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: "github" | "google") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      void navigate("/", { replace: true }) // Redirect to home on successful login
    }
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const validateInputs = () => {
    let isValid = true

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true)
      setEmailErrorMessage("Please enter a valid email address.")
      isValid = false
    } else {
      setEmailError(false)
      setEmailErrorMessage("")
    }

    if (!password || password.length < 6) {
      setPasswordError(true)
      setPasswordErrorMessage("Password must be at least 6 characters long.")
      isValid = false
    } else {
      setPasswordError(false)
      setPasswordErrorMessage("")
    }

    return isValid
  }

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "center",
          width: "100%",
          padding: 4,
          gap: 2,
          margin: "auto",
          maxWidth: "450px",
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(24, 24, 27, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid #27272a",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
        }}
        variant="outlined"
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: "100%",
            fontSize: "clamp(2rem, 10vw, 2.15rem)",
            color: "#fafafa",
          }}
        >
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={e => {
            e.stopPropagation()
            e.preventDefault()

            if (validateInputs()) {
              // If inputs are valid, proceed with email login
              setError(null)
              setEmailError(false)
              setPasswordError(false)
              void handleEmailLogin()
            }
          }}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email" sx={{ color: "#a1a1aa" }}>
              Email
            </FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              onChange={event => {
                setEmail(event.target.value)
              }}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? "error" : "primary"}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password" sx={{ color: "#a1a1aa" }}>
              Password
            </FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              onChange={event => {
                setPassword(event.target.value)
              }}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? "error" : "primary"}
            />
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                sx={{
                  color: "#3f3f46",
                  "&.Mui-checked": { color: "#6366f1" },
                }}
              />
            }
            label="Remember me"
            sx={{ color: "#a1a1aa" }}
          />
          <ForgotPassword open={open} handleClose={handleClose} />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Sign in
          </Button>
          <MuiLink
            component="button"
            type="button"
            onClick={handleClickOpen}
            variant="body2"
            sx={{ alignSelf: "center", color: "#818cf8" }}
          >
            Forgot your password?
          </MuiLink>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
        <Divider sx={{ borderColor: "#27272a" }}>
          <Typography sx={{ color: "#71717a" }}>or</Typography>
        </Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              void handleOAuthLogin("google")
            }}
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              void handleOAuthLogin("github")
            }}
            startIcon={<GitHubIcon />}
          >
            Sign in with GitHub
          </Button>
          <Typography sx={{ textAlign: "center", color: "#a1a1aa" }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/auth/signup"
              style={{ color: "#818cf8", textDecoration: "none" }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Card>
    </SignInContainer>
  )
}
