import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import type { RootState } from "../pages/auth/store.ts"
import { supabase } from "../app/supabaseClient.ts"
import { setSession } from "../pages/auth/authSlice.ts"

const AuthProtectedRoute = () => {
  const session = useAppSelector((state: RootState) => state.auth.session)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  // useEffect(() => {
  //   if (!session) {
  //     // If no session, redirect to login page
  //     void navigate("/auth/login", { replace: true })
  //   }
  // })

  return <Outlet />
}

export default AuthProtectedRoute
