import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"
import { SessionProvider } from "./context/SessionContext"
import { KeyboardProvider } from "./context/KeyboardContext.tsx"
import { Analytics } from "@vercel/analytics/react"

const Providers = () => {
  return (
    <SessionProvider>
      <KeyboardProvider>
        <ReactFlowProvider>
          <Analytics />
          <Outlet />
        </ReactFlowProvider>
      </KeyboardProvider>
    </SessionProvider>
  )
}

export default Providers
