import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  Typography,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import SaveAltIcon from "@mui/icons-material/SaveAlt"
import { importKLE } from "../utils/kleParser"
import { exportKLE } from "../utils/kleExporter"
import type { Node } from "@xyflow/react"

type ImportExportDialogProps = {
  open: boolean
  onClose: () => void
  onImport: (nodes: Node[]) => void
  getNodes: () => Node[]
}

type TabPanelProps = {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function ImportExportDialog({
  open,
  onClose,
  onImport,
  getNodes,
}: ImportExportDialogProps) {
  const [tab, setTab] = useState(0)
  const [importText, setImportText] = useState("")
  const [exportText, setExportText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setError(null)

    // Generate export text when switching to export tab
    if (newValue === 1) {
      try {
        const nodes = getNodes()
        const kleText = exportKLE(nodes)
        setExportText(kleText)
      } catch (err) {
        setError("Failed to generate KLE export")
        console.error(err)
      }
    }
  }

  const handleImport = () => {
    setError(null)

    if (!importText.trim()) {
      setError("Please enter KLE data to import")
      return
    }

    try {
      const nodes = importKLE(importText)

      if (nodes.length === 0) {
        setError("No keys found in the KLE data")
        return
      }

      // Replace current nodes with imported ones
      onImport(nodes)

      setSnackbarMessage(`Imported ${nodes.length} keys successfully`)
      setSnackbarOpen(true)
      setImportText("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse KLE data")
      console.error(err)
    }
  }

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText)
      setSnackbarMessage("Copied to clipboard")
      setSnackbarOpen(true)
    } catch (err) {
      setError("Failed to copy to clipboard")
      console.error(err)
    }
  }

  const handleDownloadJSON = () => {
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
      setError("Failed to download file")
      console.error(err)
    }
  }

  const handleClose = () => {
    setError(null)
    setImportText("")
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Import / Export KLE Format</DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab
              icon={<FileUploadIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Import"
            />
            <Tab
              icon={<FileDownloadIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Export"
            />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tab} index={0}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Paste your Keyboard Layout Editor (KLE) JSON data below. You can
              copy this from{" "}
              <a
                href="https://keyboard-layout-editor.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                keyboard-layout-editor.com
              </a>{" "}
              using the Raw Data tab.
            </Typography>
            <TextField
              multiline
              rows={12}
              fullWidth
              placeholder={`Paste KLE data here, e.g.:
[{x:1.5},"~\\n\`","!\\n1","@\\n2"],
[{w:1.5},"Tab","Q","W","E"]`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              sx={{
                fontFamily: "monospace",
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.8125rem",
                },
              }}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Importing will replace your current layout. Make sure to save
              your work first.
            </Alert>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Copy this KLE JSON and paste it into the Raw Data tab on{" "}
              <a
                href="https://keyboard-layout-editor.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                keyboard-layout-editor.com
              </a>
              .
            </Typography>
            <Box sx={{ position: "relative" }}>
              <TextField
                multiline
                rows={12}
                fullWidth
                value={exportText}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  fontFamily: "monospace",
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: "0.8125rem",
                  },
                }}
              />
              <IconButton
                onClick={handleCopyExport}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "background.paper",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                size="small"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          {tab === 0 && (
            <Button
              onClick={handleImport}
              variant="contained"
              startIcon={<FileUploadIcon />}
            >
              Import
            </Button>
          )}
          {tab === 1 && (
            <>
              <Button
                onClick={handleDownloadJSON}
                variant="outlined"
                startIcon={<SaveAltIcon />}
              >
                Download JSON
              </Button>
              <Button
                onClick={handleCopyExport}
                variant="contained"
                startIcon={<ContentCopyIcon />}
              >
                Copy to Clipboard
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  )
}
