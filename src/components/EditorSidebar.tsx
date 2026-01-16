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
    <Tooltip title={`${widthU}u × ${heightU}u`} placement="top" arrow>
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
          backgroundColor: "#ffffff",
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          transition: "all 0.15s ease",
          boxShadow: `
            0 1px 2px rgba(0, 0, 0, 0.05),
            inset 0 -2px 0 rgba(0, 0, 0, 0.08)
          `,
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 -2px 0 rgba(0, 0, 0, 0.08)
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
            color: "text.secondary",
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
  const { setNodes, getNodes } = useReactFlow()

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
          backgroundColor: "background.paper",
          overflowY: "auto",
          transition: "width 0.2s ease",
          boxShadow: theme => theme.shadows[4],
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
              borderColor: "divider",
              overflow: "auto",
              opacity: open ? 1 : 0,
              transition: "opacity 0.15s ease",
              pointerEvents: open ? "auto" : "none",
              marginRight: `${SIDEBAR_WIDTH_COLLAPSED}px`,
            }}
          >
            <TabPanel value={activePanel} index="shapes">
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Horizontal Keys
              </Typography>
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

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Vertical Keys
              </Typography>
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
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Key Properties
              </Typography>
              <KeyDetailsForm />
            </TabPanel>

            <TabPanel value={activePanel} index="settings">
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Keyboard Settings
              </Typography>
              <KeyboardSettingsForm />
            </TabPanel>

            <TabPanel value={activePanel} index="import-export">
              {importExportError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImportExportError(null)}>
                  {importExportError}
                </Alert>
              )}

              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Import from KLE
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.75rem" }}>
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

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                Export to KLE
              </Typography>
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
              borderColor: "divider",
              backgroundColor: "background.paper",
              ".MuiTabs-flexContainer": {
                flexDirection: "column",
              },
              ".MuiTab-root": {
                minWidth: SIDEBAR_WIDTH_COLLAPSED,
                minHeight: 56,
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
