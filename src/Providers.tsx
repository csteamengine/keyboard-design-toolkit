import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"
import { SessionProvider } from "./context/SessionContext"
import { EditorProvider } from "./context/EditorContext.tsx"
import { Analytics } from "@vercel/analytics/react"
import { KeyboardShortcutsProvider } from "./context/KeyboardShortcutsContext.tsx"
import { HistoryContextProvider } from "./context/HistoryContext.tsx"
import { useRef } from "react"

const Providers = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  return (
    <SessionProvider>
      <EditorProvider>
        <ReactFlowProvider>
          <HistoryContextProvider>
            <KeyboardShortcutsProvider>
              <Analytics />
              <Outlet />
            </KeyboardShortcutsProvider>
          </HistoryContextProvider>
        </ReactFlowProvider>
      </EditorProvider>
    </SessionProvider>
  )
}

export default Providers
