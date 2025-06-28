import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import type { RootState } from "../pages/auth/store.ts"
import { supabase } from "../app/supabaseClient.ts"
import { setSession } from "../pages/auth/authSlice.ts"
import { useSession } from "../context/SessionContext.tsx"

const AuthProtectedRoute = () => {
  const navigate = useNavigate()
  const { user, session } = useSession()

  useEffect(() => {
    if (session) {
      // If session, route to home
      void navigate("/", { replace: true })
    }
  }, [session, navigate])

  return <Outlet />
}

export default AuthProtectedRoute
