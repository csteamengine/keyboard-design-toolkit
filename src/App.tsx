import type React from "react"
import { useEffect } from "react"
import LoginPage from "./features/auth/LoginPage"
import { supabase } from "./features/auth/supabaseClient"
import { setSession } from "./features/auth/authSlice"
import { useAppDispatch } from "./app/hooks.ts"
import { Route, Routes } from "react-router-dom"
import SignupPage from "./features/auth/SignUpPage.tsx"
import HomePage from "./pages/HomePage.tsx"
import ProtectedRoute from "./features/auth/ProtectedRoute.tsx"

export const App: React.FC = () => {
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

  return (
    <Routes>
      <Route
        path="/auth/login"
        element={
          <ProtectedRoute requiresAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <ProtectedRoute requiresAuth={false}>
            <SignupPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default App
