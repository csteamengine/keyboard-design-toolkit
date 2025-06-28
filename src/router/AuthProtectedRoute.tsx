import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { supabase } from "../app/supabaseClient.ts"
import { setSession } from "../pages/auth/authSlice.ts"
import { useSession } from "../context/SessionContext.tsx"

const AuthProtectedRoute = () => {
  const { user, session } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) {
      // If no session, redirect to login page
      void navigate("/auth/login", { replace: true })
    }
  }, [session, navigate])

  return <Outlet />
}

export default AuthProtectedRoute
