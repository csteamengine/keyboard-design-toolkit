import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "../../app/hooks.ts"
import type { RootState } from "./store.ts"

type ProtectedRouteProps = {
  children: React.ReactNode
  requiresAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
}) => {
  const session = useAppSelector((state: RootState) => state.auth.session)
  const location = useLocation()

  if (requiresAuth && !session) {
    // Trying to access a protected route without being logged in
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!requiresAuth && session) {
    // Trying to access login/signup while logged in
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
