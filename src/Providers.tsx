import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"
import { SessionProvider } from "./context/SessionContext"

const Providers = () => {
  return (
    <SessionProvider>
      <ReactFlowProvider>
        <Outlet />
      </ReactFlowProvider>
    </SessionProvider>
  )
}

export default Providers
