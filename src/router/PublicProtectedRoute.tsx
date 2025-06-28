import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import type { RootState } from "../pages/auth/store.ts"
import { supabase } from "../app/supabaseClient.ts"
import { setSession } from "../pages/auth/authSlice.ts"

const AuthProtectedRoute = () => {
  const navigate = useNavigate()
  const currentSession = useAppSelector(
    (state: RootState) => state.auth.session,
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch, navigate])

  useEffect(() => {
    if (currentSession) {
      // If session, route to home
      void navigate("/", { replace: true })
    }
  }, [currentSession, navigate])

  return <Outlet />
}

export default AuthProtectedRoute
