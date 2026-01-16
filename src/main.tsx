import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { ThemeProvider, CssBaseline } from "@mui/material"
import { store } from "./app/store"
import { theme } from "./theme"
import "./index.css"
import { RouterProvider } from "react-router-dom"
import router from "./router"
import { SnackbarProvider } from "notistack"

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  root.render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider />
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </StrictMode>
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file."
  )
}
