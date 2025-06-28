import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"

const Providers = () => {
  return (
    <ReactFlowProvider>
      <Outlet />
    </ReactFlowProvider>
  )
}

export default Providers
