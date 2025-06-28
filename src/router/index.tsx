import { createBrowserRouter } from "react-router-dom"
import HomePage from "../pages/HomePage.tsx"
import AuthProtectedRoute from "./AuthProtectedRoute.tsx"
import LoginPage from "../pages/auth/LoginPage.tsx"
import SignUpPage from "../pages/auth/SignUpPage.tsx"
import Layout from "../components/Layout.tsx"
import Keyboards from "../pages/Keyboards.tsx"
import KeyboardEditor from "../pages/KeyboardEditor.tsx"
import PublicProtectedRoute from "./PublicProtectedRoute.tsx"

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <PublicProtectedRoute />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthProtectedRoute />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "keyboards",
            element: <Keyboards />,
          },
          {
            path: "keyboards/:keyboardId",
            element: <KeyboardEditor />,
          },
        ],
      },
    ],
  },
])

export default router
