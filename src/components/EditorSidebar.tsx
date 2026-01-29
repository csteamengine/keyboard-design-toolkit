import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Tooltip,
  Divider,
  TextField,
  Button,
  Alert,
  Snackbar,
} from "@mui/material"
import type { ReactNode } from "react"
import { useState, useCallback } from "react"
import CategoryIcon from "@mui/icons-material/Category"
import TuneIcon from "@mui/icons-material/Tune"
import SettingsIcon from "@mui/icons-material/Settings"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import SaveAltIcon from "@mui/icons-material/SaveAlt"
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

type TabPanelProps = {
  children?: ReactNode
  index: string
  value: string
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
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
    <Tooltip title={`${widthU}u x ${heightU}u`} placement="top" arrow>
      <Box
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
        sx={{
          width: previewWidth,
          height: previewHeight,
          backgroundColor: "#27272a",
          border: "1px solid",
          borderColor: "#3f3f46",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          transition: "all 0.15s ease",
          boxShadow: `
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -2px 0 rgba(0, 0, 0, 0.2)
          `,
          "&:hover": {
            borderColor: "#6366f1",
            boxShadow: `
              0 0 12px rgba(99, 102, 241, 0.3),
              0 4px 8px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.05),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2)
            `,
            transform: "translateY(-1px)",
          },
          "&:active": {
            cursor: "grabbing",
            transform: "translateY(0)",
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontWeight: 500,
            color: "#a1a1aa",
            userSelect: "none",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default function EditorSidebar() {
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string>("shapes")
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

  const handleTabChange = (panelKey: string) => {
    setActivePanel(prev => (prev === panelKey ? "" : panelKey))
    if (activePanel === panelKey && open) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }

  const handleTabClick = (value: string) => {
    if (value === activePanel) {
      setOpen(!open)
    }
  }

  const sidebarWidth = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  // Section header with gradient underline
  const SectionHeader = ({ children }: { children: ReactNode }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: "#a1a1aa",
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
        }}
      >
        {children}
      </Typography>
      <Box
        sx={{
          height: 2,
          width: 32,
          mt: 0.5,
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
          borderRadius: 1,
        }}
      />
    </Box>
  )

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 0,
          position: "relative",
          bottom: "auto",
          left: "auto",
          width: sidebarWidth,
          height: "100%",
          zIndex: 3,
          backgroundColor: "#111113",
          overflowY: "auto",
          transition: "width 0.2s ease",
          borderRight: "1px solid #27272a",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {/* Content area */}
          <Box
            sx={{
              flexGrow: 1,
              borderRight: 1,
              borderColor: "#27272a",
              overflow: "auto",
              opacity: open ? 1 : 0,
              transition: "opacity 0.15s ease",
              pointerEvents: open ? "auto" : "none",
              marginRight: `${SIDEBAR_WIDTH_COLLAPSED}px`,
              backgroundColor: "#111113",
            }}
          >
            <TabPanel value={activePanel} index="shapes">
              <SectionHeader>Horizontal Keys</SectionHeader>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "flex-start",
                  mb: 3,
                }}
              >
                {HORIZONTAL_KEY_SIZES.map(u => (
                  <KeyPreview
                    key={u}
                    widthU={u}
                    heightU={1}
                    label={`${u}u`}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2, borderColor: "#27272a" }} />

              <SectionHeader>Vertical Keys</SectionHeader>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "flex-start",
                }}
              >
                {VERTICAL_KEY_SIZES.map(u => (
                  <KeyPreview
                    key={`${u}v`}
                    widthU={1}
                    heightU={u}
                    label={`${u}u`}
                  />
                ))}
              </Box>
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
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImportExportError(null)}>
                  {importExportError}
                </Alert>
              )}

              <SectionHeader>Import from KLE</SectionHeader>
              <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem", color: "#71717a" }}>
                Paste KLE raw data from keyboard-layout-editor.com
              </Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                size="small"
                placeholder="Paste KLE data here..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
                sx={{
                  mb: 1,
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<FileUploadIcon />}
                onClick={handleImport}
                fullWidth
                sx={{ mb: 3 }}
              >
                Import
              </Button>

              <Divider sx={{ my: 2, borderColor: "#27272a" }} />

              <SectionHeader>Export to KLE</SectionHeader>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerateExport}
                fullWidth
                sx={{ mb: 1 }}
              >
                Generate Export
              </Button>
              {exportText && (
                <>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    size="small"
                    value={exportText}
                    InputProps={{ readOnly: true }}
                    sx={{
                      mb: 1,
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveAltIcon />}
                      onClick={handleDownloadJSON}
                      sx={{ flex: 1 }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyExport}
                      sx={{ flex: 1 }}
                    >
                      Copy
                    </Button>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2, borderColor: "#27272a" }} />

              <SectionHeader>Export to JSON</SectionHeader>
              <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem", color: "#71717a" }}>
                Export full keyboard data including layout and settings
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerateJSONExport}
                fullWidth
                sx={{ mb: 1 }}
              >
                Generate JSON Export
              </Button>
              {jsonExportText && (
                <>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    size="small"
                    value={jsonExportText}
                    InputProps={{ readOnly: true }}
                    sx={{
                      mb: 1,
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveAltIcon />}
                      onClick={handleDownloadJSONFile}
                      sx={{ flex: 1 }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyJSONExport}
                      sx={{ flex: 1 }}
                    >
                      Copy
                    </Button>
                  </Box>
                </>
              )}
            </TabPanel>
          </Box>

          {/* Tabs on the right side */}
          <Tabs
            value={activePanel}
            onChange={(_, val) => handleTabChange(val)}
            orientation="vertical"
            variant="fullWidth"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: SIDEBAR_WIDTH_COLLAPSED,
              height: "100%",
              borderLeft: 1,
              borderColor: "#27272a",
              backgroundColor: "#111113",
              ".MuiTabs-flexContainer": {
                flexDirection: "column",
              },
              ".MuiTab-root": {
                minWidth: SIDEBAR_WIDTH_COLLAPSED,
                minHeight: 56,
                color: "#71717a",
                "&:hover": {
                  color: "#a1a1aa",
                  backgroundColor: "#1f1f23",
                },
                "&.Mui-selected": {
                  color: "#fafafa",
                },
              },
              ".MuiTabs-indicator": {
                left: 0,
                right: "auto",
                width: 2,
                background: "linear-gradient(180deg, #7c3aed, #6366f1, #3b82f6)",
              },
            }}
          >
            <Tab
              icon={<CategoryIcon />}
              value="shapes"
              aria-label="Key Shapes"
              onClick={() => handleTabClick("shapes")}
            />
            <Tab
              icon={<TuneIcon />}
              value="details"
              aria-label="Key Details"
              onClick={() => handleTabClick("details")}
            />
            <Tab
              icon={<SettingsIcon />}
              value="settings"
              aria-label="Settings"
              onClick={() => handleTabClick("settings")}
            />
            <Tab
              icon={<SwapHorizIcon />}
              value="import-export"
              aria-label="Import/Export"
              onClick={() => handleTabClick("import-export")}
            />
          </Tabs>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  )
}
