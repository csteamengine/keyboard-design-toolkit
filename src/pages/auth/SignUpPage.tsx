import * as React from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import Divider from "@mui/material/Divider"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import FormControl from "@mui/material/FormControl"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import { useState } from "react"
import { supabase } from "../../app/supabaseClient.ts"
import GitHubIcon from "@mui/icons-material/GitHub"
import GoogleIcon from "@mui/icons-material/Google"
import { Alert, Card } from "@mui/material"
import { Link } from "react-router-dom"

const SignUpContainer = styled(Stack)(() => ({
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

export default function SignUp() {
  const [emailError, setEmailError] = React.useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("")
  const [passwordError, setPasswordError] = React.useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOAuthSignup = async (provider: "github" | "google") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }

  const handleEmailSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setSuccess(null)
    } else {
      if (!data.session) {
        setSuccess("Signup successful! Please check your email to confirm.")
      }
    }
  }

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement
    const password = document.getElementById("password") as HTMLInputElement

    let isValid = true

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true)
      setEmailErrorMessage("Please enter a valid email address.")
      isValid = false
    } else {
      setEmailError(false)
      setEmailErrorMessage("")
    }

    if (!password.value || password.value.length < 6) {
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
    <SignUpContainer direction="column" justifyContent="space-between">
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
          Sign up
        </Typography>
        <Box
          component="form"
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            if (validateInputs()) {
              void handleEmailSignup()
            }
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="email" sx={{ color: "#a1a1aa" }}>
              Email
            </FormLabel>
            <TextField
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              name="email"
              autoComplete="email"
              variant="outlined"
              error={emailError}
              helperText={emailErrorMessage}
              color={passwordError ? "error" : "primary"}
              onChange={e => {
                setEmail(e.target.value)
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password" sx={{ color: "#a1a1aa" }}>
              Password
            </FormLabel>
            <TextField
              required
              fullWidth
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="new-password"
              variant="outlined"
              error={passwordError}
              helperText={passwordErrorMessage}
              color={passwordError ? "error" : "primary"}
              onChange={e => {
                setPassword(e.target.value)
              }}
            />
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                value="allowExtraEmails"
                sx={{
                  color: "#3f3f46",
                  "&.Mui-checked": { color: "#6366f1" },
                }}
              />
            }
            label="I want to receive updates via email."
            sx={{ color: "#a1a1aa" }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Sign up
          </Button>
        </Box>
        <Divider sx={{ borderColor: "#27272a" }}>
          <Typography sx={{ color: "#71717a" }}>or</Typography>
        </Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              void handleOAuthSignup("google")
            }}
            startIcon={<GoogleIcon />}
          >
            Sign up with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              void handleOAuthSignup("github")
            }}
            startIcon={<GitHubIcon />}
          >
            Sign up with GitHub
          </Button>
          <Typography align="center" sx={{ mt: 2, color: "#a1a1aa" }}>
            Already have an account?{" "}
            <Link
              to="/auth/login"
              style={{ color: "#818cf8", textDecoration: "none" }}
            >
              Login
            </Link>
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Card>
    </SignUpContainer>
  )
}
