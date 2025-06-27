import type React from "react"
import { useEffect } from "react"
import { supabase } from "./app/supabaseClient.ts"
import { setSession } from "./features/auth/authSlice"
import { useAppDispatch } from "./app/hooks.ts"
import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage.tsx"
import LoginPage from "./features/auth/LoginPage.tsx"
import SignupPage from "./features/auth/SignUpPage.tsx"
import KeyboardEditor from "./pages/KeyboardEditor.tsx"
import Layout from "./components/Layout.tsx"
import { ReactFlowProvider } from "@xyflow/react"
import Keyboards from "./pages/Keyboards.tsx"
import AuthProtectedRoute from "./features/auth/AuthProtectedRoute.tsx"
import { SessionProvider } from "./context/SessionContext.tsx"

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
    <SessionProvider>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route element={<AuthProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/keyboards" element={<Keyboards />} />
            <Route
              path="/keyboards/:keyboardId"
              element={
                <ReactFlowProvider>
                  <KeyboardEditor />
                </ReactFlowProvider>
              }
            />
            <Route path="/" element={<HomePage />} />
          </Route>
        </Route>
      </Routes>
    </SessionProvider>
  )
}

export default App
