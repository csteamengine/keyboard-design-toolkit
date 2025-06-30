import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"
import { SessionProvider } from "./context/SessionContext"
import { KeyboardProvider } from "./context/KeyboardContext.tsx"
import { Analytics } from "@vercel/analytics/react"
import { KeyboardShortcutsProvider } from "./context/KeyboardShortcutsContext.tsx"
import { HistoryContextProvider } from "./context/HistoryContext.tsx"

const Providers = () => {
  return (
    <SessionProvider>
      <KeyboardProvider>
        <ReactFlowProvider>
          <HistoryContextProvider>
            <KeyboardShortcutsProvider>
              <Analytics />
              <Outlet />
            </KeyboardShortcutsProvider>
          </HistoryContextProvider>
        </ReactFlowProvider>
      </KeyboardProvider>
    </SessionProvider>
  )
}

export default Providers
