import * as React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Github } from "lucide-react"
import ForgotPassword from "./ForgotPassword.tsx"
import { supabase } from "../../app/supabaseClient.ts"
import { Button, Input, Checkbox, Alert, Card } from "../../components/ui"

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

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
      void navigate("/", { replace: true })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (validateInputs()) {
      setError(null)
      setEmailError(false)
      setPasswordError(false)
      void handleEmailLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative bg-bg-base">
      {/* Background gradient orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(124, 58, 237, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      <Card
        variant="glass"
        className="w-full max-w-[450px] p-8 relative z-10"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-6">Sign in</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            helperText={emailErrorMessage}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••"
            autoComplete="current-password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            helperText={passwordErrorMessage}
          />

          <Checkbox label="Remember me" />

          <ForgotPassword open={open} handleClose={handleClose} />

          <Button type="submit" variant="primary" fullWidth>
            Sign in
          </Button>

          <button
            type="button"
            onClick={handleClickOpen}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Forgot your password?
          </button>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-sm">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={() => void handleOAuthLogin("google")}
          >
            Sign in with Google
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Github className="w-5 h-5" />}
            onClick={() => void handleOAuthLogin("github")}
          >
            Sign in with GitHub
          </Button>

          <p className="text-center text-text-secondary mt-4">
            Don&apos;t have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
