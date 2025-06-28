import { createBrowserRouter } from "react-router-dom"
import HomePage from "../pages/HomePage.tsx"
import NotFoundPage from "../pages/404Page.tsx"
import AuthProtectedRoute from "./AuthProtectedRoute.tsx"
import Providers from "../Providers.tsx"
import LoginPage from "../pages/auth/LoginPage.tsx"
import SignUpPage from "../pages/auth/SignUpPage.tsx"
import Layout from "../components/Layout.tsx"
import Keyboards from "../pages/Keyboards.tsx"
import KeyboardEditor from "../pages/KeyboardEditor.tsx"

const router = createBrowserRouter([
  // I recommend you reflect the routes here in the pages folder
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/auth/login",
        element: <LoginPage />,
      },
      {
        path: "/auth/signup",
        element: <SignUpPage />,
      },
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/",
            element: <Layout />,
            children: [
              {
                path: "/",
                element: <HomePage />,
              },
              {
                path: "/keyboards",
                element: <Keyboards />,
              },
              {
                path: "/keyboards/:keyboardId",
                element: <KeyboardEditor />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

export default router
