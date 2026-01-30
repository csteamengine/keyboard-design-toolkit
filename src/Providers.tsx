import { Outlet } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"
import { SessionProvider } from "./context/SessionContext"
import { EditorProvider } from "./context/EditorContext.tsx"
import { Analytics } from "@vercel/analytics/react"
import { KeyboardShortcutsProvider } from "./context/KeyboardShortcutsContext.tsx"
import { HistoryContextProvider } from "./context/HistoryContext.tsx"
import { ThemeProvider } from "./context/ThemeContext.tsx"

const Providers = () => {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}

export default Providers
