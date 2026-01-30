import type { ReactNode } from "react"
import { useState, useCallback } from "react"
import {
  Shapes,
  SlidersHorizontal,
  Settings,
  ArrowLeftRight,
  Copy,
  Upload,
  Download,
} from "lucide-react"
import { useReactFlow } from "@xyflow/react"
import KeyDetailsForm from "./KeyDetailsForm.tsx"
import KeyboardSettingsForm from "./KeyboardSettingsForm.tsx"
import { importKLE } from "../utils/kleParser"
import { exportKLE } from "../utils/kleExporter"
import { useAppSelector } from "../app/hooks.ts"
import { selectKeyboard } from "../app/editorSlice.tsx"
import {
  UNIT_SIZE,
  HORIZONTAL_KEY_SIZES,
  VERTICAL_KEY_SIZES,
  PREVIEW_SCALE,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "../constants/editor"
import { Button, Input, Alert, Tooltip } from "./ui"

type TabPanelProps = {
  children?: ReactNode
  index: string
  value: string
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <div className="p-4">{children}</div>}
    </div>
  )
}

type KeyPreviewProps = {
  widthU: number
  heightU: number
  label: string
}

function KeyPreview({ widthU, heightU, label }: KeyPreviewProps) {
  const previewWidth = widthU * UNIT_SIZE * PREVIEW_SCALE
  const previewHeight = heightU * UNIT_SIZE * PREVIEW_SCALE

  return (
    <Tooltip content={`${widthU}u x ${heightU}u`} placement="top">
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify({
              type: "keyboardKey",
              widthU,
              heightU,
              label,
            })
          )
          e.dataTransfer.effectAllowed = "move"
        }}
        className="flex items-center justify-center cursor-grab rounded transition-all duration-150
                   bg-bg-muted border border-border
                   hover:border-indigo-500 hover:-translate-y-0.5
                   active:cursor-grabbing active:translate-y-0"
        style={{
          width: previewWidth,
          height: previewHeight,
          boxShadow: `0 2px 4px rgba(0, 0, 0, 0.2)`,
        }}
      >
        <span className="font-mono text-xs font-medium text-text-secondary select-none">
          {label}
        </span>
      </div>
    </Tooltip>
  )
}

export default function EditorSidebar() {
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string>("")
  const [importText, setImportText] = useState("")
  const [exportText, setExportText] = useState("")
  const [importExportError, setImportExportError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const { setNodes, getNodes, getEdges, getViewport } = useReactFlow()
  const keyboard = useAppSelector(selectKeyboard)
  const [jsonExportText, setJsonExportText] = useState("")

  const handleImport = useCallback(() => {
    setImportExportError(null)
    if (!importText.trim()) {
      setImportExportError("Please enter KLE data to import")
      return
    }
    try {
      const nodes = importKLE(importText)
      if (nodes.length === 0) {
        setImportExportError("No keys found in the KLE data")
        return
      }
      setNodes(nodes)
      setSnackbarMessage(`Imported ${nodes.length} keys successfully`)
      setSnackbarOpen(true)
      setImportText("")
    } catch (err) {
      setImportExportError(err instanceof Error ? err.message : "Failed to parse KLE data")
    }
  }, [importText, setNodes])

  const handleGenerateExport = useCallback(() => {
    try {
      const nodes = getNodes()
      const kleText = exportKLE(nodes)
      setExportText(kleText)
      setImportExportError(null)
    } catch (err) {
      setImportExportError("Failed to generate KLE export")
    }
  }, [getNodes])

  const handleCopyExport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText)
      setSnackbarMessage("Copied to clipboard")
      setSnackbarOpen(true)
    } catch (err) {
      setImportExportError("Failed to copy to clipboard")
    }
  }, [exportText])

  const handleDownloadJSON = useCallback(() => {
    try {
      const blob = new Blob([exportText], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "keyboard-layout.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSnackbarMessage("Downloaded keyboard-layout.json")
      setSnackbarOpen(true)
    } catch (err) {
      setImportExportError("Failed to download file")
    }
  }, [exportText])

  const handleGenerateJSONExport = useCallback(() => {
    try {
      const nodes = getNodes()
      const edges = getEdges()
      const viewport = getViewport()
      const exportData = {
        version: "1.0",
        name: keyboard?.name ?? "Untitled Keyboard",
        description: keyboard?.description ?? "",
        settings: keyboard?.settings ?? {},
        layout: {
          nodes,
          edges,
          viewport,
        },
        exportedAt: new Date().toISOString(),
      }
      setJsonExportText(JSON.stringify(exportData, null, 2))
      setImportExportError(null)
    } catch (err) {
      setImportExportError("Failed to generate JSON export")
    }
  }, [getNodes, getEdges, getViewport, keyboard])

  const handleCopyJSONExport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonExportText)
      setSnackbarMessage("Copied to clipboard")
      setSnackbarOpen(true)
    } catch (err) {
      setImportExportError("Failed to copy to clipboard")
    }
  }, [jsonExportText])

  const handleDownloadJSONFile = useCallback(() => {
    try {
      const blob = new Blob([jsonExportText], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const filename = (keyboard?.name ?? "keyboard").replace(/[^a-z0-9]/gi, "-").toLowerCase()
      a.download = `${filename}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSnackbarMessage(`Downloaded ${filename}.json`)
      setSnackbarOpen(true)
    } catch (err) {
      setImportExportError("Failed to download file")
    }
  }, [jsonExportText, keyboard])

  const handleTabClick = (panelKey: string) => {
    if (!open) {
      // Sidebar is closed - open it and show this tab
      setActivePanel(panelKey)
      setOpen(true)
    } else if (activePanel === panelKey) {
      // Clicking the already active tab - close the sidebar
      setOpen(false)
    } else {
      // Clicking a different tab - switch to it
      setActivePanel(panelKey)
    }
  }

  const sidebarWidth = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  // Section header with gradient underline
  const SectionHeader = ({ children }: { children: ReactNode }) => (
    <div className="mb-3">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {children}
      </h3>
      <div
        className="h-0.5 w-8 mt-1 rounded"
        style={{
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
        }}
      />
    </div>
  )

  const tabs = [
    { key: "shapes", icon: <Shapes className="w-5 h-5" />, label: "Key Shapes" },
    { key: "details", icon: <SlidersHorizontal className="w-5 h-5" />, label: "Key Details" },
    { key: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
    { key: "import-export", icon: <ArrowLeftRight className="w-5 h-5" />, label: "Import/Export" },
  ]

  return (
    <>
      <div
        className="relative h-full z-[3] bg-bg-subtle border-r border-border overflow-y-auto transition-all duration-200"
        style={{
          width: sidebarWidth,
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="flex h-full w-full absolute top-0 left-0">
          {/* Content area */}
          <div
            className={`flex-grow border-r border-border overflow-auto transition-opacity duration-150 bg-bg-subtle ${
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            style={{ marginRight: SIDEBAR_WIDTH_COLLAPSED }}
          >
            <TabPanel value={activePanel} index="shapes">
              <SectionHeader>Horizontal Keys</SectionHeader>
              <div className="flex flex-wrap gap-2 items-start mb-6">
                {HORIZONTAL_KEY_SIZES.map(u => (
                  <KeyPreview key={u} widthU={u} heightU={1} label={`${u}u`} />
                ))}
              </div>

              <div className="border-t border-border my-4" />

              <SectionHeader>Vertical Keys</SectionHeader>
              <div className="flex flex-wrap gap-2 items-start">
                {VERTICAL_KEY_SIZES.map(u => (
                  <KeyPreview key={`${u}v`} widthU={1} heightU={u} label={`${u}u`} />
                ))}
              </div>
            </TabPanel>

            <TabPanel value={activePanel} index="details">
              <SectionHeader>Key Properties</SectionHeader>
              <KeyDetailsForm />
            </TabPanel>

            <TabPanel value={activePanel} index="settings">
              <SectionHeader>Keyboard Settings</SectionHeader>
              <KeyboardSettingsForm />
            </TabPanel>

            <TabPanel value={activePanel} index="import-export">
              {importExportError && (
                <Alert severity="error" className="mb-4" onClose={() => setImportExportError(null)}>
                  {importExportError}
                </Alert>
              )}

              <SectionHeader>Import from KLE</SectionHeader>
              <p className="text-xs text-text-muted mb-2">
                Paste KLE raw data from keyboard-layout-editor.com
              </p>
              <Input
                multiline
                rows={6}
                fullWidth
                placeholder="Paste KLE data here..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="font-mono text-xs mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                startIcon={<Upload className="w-4 h-4" />}
                onClick={handleImport}
                fullWidth
                className="mb-6"
              >
                Import
              </Button>

              <div className="border-t border-border my-4" />

              <SectionHeader>Export to KLE</SectionHeader>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleGenerateExport}
                fullWidth
                className="mb-2"
              >
                Generate Export
              </Button>
              {exportText && (
                <>
                  <Input
                    multiline
                    rows={6}
                    fullWidth
                    value={exportText}
                    readOnly
                    className="font-mono text-xs mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outlined"
                      size="sm"
                      startIcon={<Download className="w-4 h-4" />}
                      onClick={handleDownloadJSON}
                      className="flex-1"
                    >
                      Download
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      startIcon={<Copy className="w-4 h-4" />}
                      onClick={() => void handleCopyExport()}
                      className="flex-1"
                    >
                      Copy
                    </Button>
                  </div>
                </>
              )}

              <div className="border-t border-border my-4" />

              <SectionHeader>Export to JSON</SectionHeader>
              <p className="text-xs text-text-muted mb-2">
                Export full keyboard data including layout and settings
              </p>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleGenerateJSONExport}
                fullWidth
                className="mb-2"
              >
                Generate JSON Export
              </Button>
              {jsonExportText && (
                <>
                  <Input
                    multiline
                    rows={6}
                    fullWidth
                    value={jsonExportText}
                    readOnly
                    className="font-mono text-xs mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outlined"
                      size="sm"
                      startIcon={<Download className="w-4 h-4" />}
                      onClick={handleDownloadJSONFile}
                      className="flex-1"
                    >
                      Download
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      startIcon={<Copy className="w-4 h-4" />}
                      onClick={() => void handleCopyJSONExport()}
                      className="flex-1"
                    >
                      Copy
                    </Button>
                  </div>
                </>
              )}
            </TabPanel>
          </div>

          {/* Tabs on the right side */}
          <div
            className="absolute top-0 right-0 h-full flex flex-col border-l border-border bg-bg-subtle"
            style={{ width: SIDEBAR_WIDTH_COLLAPSED }}
          >
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`
                  relative flex items-center justify-center h-14 w-full transition-colors
                  ${activePanel === tab.key
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary hover:bg-bg-muted/50"}
                `}
                aria-label={tab.label}
              >
                {tab.icon}
                {/* Gradient indicator */}
                {activePanel === tab.key && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      background: "linear-gradient(180deg, #7c3aed, #6366f1, #3b82f6)",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbarOpen && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-bg-surface border border-border rounded-lg shadow-lg text-sm text-text-primary"
          onClick={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </div>
      )}
    </>
  )
}
