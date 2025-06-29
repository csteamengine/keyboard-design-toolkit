import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"
import { SessionProvider } from "./context/SessionContext"
import { KeyboardProvider } from "./context/KeyboardContext.tsx"

const Providers = () => {
  return (
    <SessionProvider>
      <KeyboardProvider>
        <ReactFlowProvider>
          <Outlet />
        </ReactFlowProvider>
      </KeyboardProvider>
    </SessionProvider>
  )
}

export default Providers
