import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useSession } from "../context/SessionContext.tsx"

const AuthProtectedRoute = () => {
  const navigate = useNavigate()
  const { session } = useSession()

  useEffect(() => {
    if (session) {
      // If session, route to home
      void navigate("/", { replace: true })
    }
  }, [session, navigate])

  return <Outlet />
}

export default AuthProtectedRoute
