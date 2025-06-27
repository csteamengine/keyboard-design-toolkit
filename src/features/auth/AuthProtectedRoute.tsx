import { Outlet, useNavigate } from "react-router-dom"
import NotFoundPage from "../../pages/404Page.tsx"
import { useSession } from "../../context/SessionContext.tsx"

const AuthProtectedRoute = () => {
  const { session } = useSession()
  const navigate = useNavigate()
  if (!session) {
    // or you can redirect to a different page and show a message
    return navigate("/auth/login")
  }
  return <Outlet />
}

export default AuthProtectedRoute
