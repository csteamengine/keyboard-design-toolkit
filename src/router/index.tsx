import { createBrowserRouter } from "react-router-dom"
import HomePage from "../pages/HomePage.tsx"
import AuthProtectedRoute from "./AuthProtectedRoute.tsx"
import LoginPage from "../pages/auth/LoginPage.tsx"
import SignUpPage from "../pages/auth/SignUpPage.tsx"
import Layout from "../components/Layout.tsx"
import Keyboards from "../pages/Keyboards.tsx"
import KeyboardEditor from "../pages/KeyboardEditor.tsx"
import Providers from "../Providers.tsx"

const router = createBrowserRouter([
  {
    path: "",
    element: <Providers />,
    children: [
      {
        path: "auth/login",
        element: <LoginPage />,
      },
      {
        path: "auth/signup",
        element: <SignUpPage />,
      },
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
            element: <AuthProtectedRoute />,
            children: [
              {
                path: "",
                element: <KeyboardEditor />,
              },
            ],
          },
        ],
      },
      {
        path: "editor",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <KeyboardEditor />,
          },
        ],
      },
    ],
  },
])

export default router
