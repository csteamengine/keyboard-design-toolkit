import { useState } from "react"
import { Upload, Download, Copy } from "lucide-react"
import { importKLE } from "../utils/kleParser"
import { exportKLE } from "../utils/kleExporter"
import type { Node } from "@xyflow/react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Alert,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "./ui"

type ImportExportDialogProps = {
  open: boolean
  onClose: () => void
  onImport: (nodes: Node[]) => void
  getNodes: () => Node[]
}

export default function ImportExportDialog({
  open,
  onClose,
  onImport,
  getNodes,
}: ImportExportDialogProps) {
  const [tab, setTab] = useState("import")
  const [importText, setImportText] = useState("")
  const [exportText, setExportText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleTabChange = (newValue: string) => {
    setTab(newValue)
    setError(null)
    setSuccessMessage(null)

    // Generate export text when switching to export tab
    if (newValue === "export") {
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

      setSuccessMessage(`Imported ${nodes.length} keys successfully`)
      setImportText("")
      setTimeout(() => {
        onClose()
        setSuccessMessage(null)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse KLE data")
      console.error(err)
    }
  }

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText)
      setSuccessMessage("Copied to clipboard")
      setTimeout(() => setSuccessMessage(null), 2000)
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
      setSuccessMessage("Downloaded keyboard-layout.json")
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      setError("Failed to download file")
      console.error(err)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccessMessage(null)
    setImportText("")
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle onClose={handleClose}>Import / Export KLE Format</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange}>
          <TabList>
            <Tab value="import" icon={<Upload className="w-4 h-4" />} label="Import" />
            <Tab value="export" icon={<Download className="w-4 h-4" />} label="Export" />
          </TabList>

          {error && (
            <Alert severity="error" className="mt-4" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" className="mt-4">
              {successMessage}
            </Alert>
          )}

          <TabPanel value="import" className="pt-4">
            <p className="text-sm text-text-muted mb-4">
              Paste your Keyboard Layout Editor (KLE) JSON data below. You can
              copy this from{" "}
              <a
                href="https://keyboard-layout-editor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                keyboard-layout-editor.com
              </a>{" "}
              using the Raw Data tab.
            </p>
            <Input
              multiline
              rows={12}
              fullWidth
              placeholder={`Paste KLE data here, e.g.:
[{x:1.5},"~\\n\`","!\\n1","@\\n2"],
[{w:1.5},"Tab","Q","W","E"]`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="font-mono text-xs"
            />
            <Alert severity="info" className="mt-4">
              Importing will replace your current layout. Make sure to save
              your work first.
            </Alert>
          </TabPanel>

          <TabPanel value="export" className="pt-4">
            <p className="text-sm text-text-muted mb-4">
              Copy this KLE JSON and paste it into the Raw Data tab on{" "}
              <a
                href="https://keyboard-layout-editor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                keyboard-layout-editor.com
              </a>
              .
            </p>
            <div className="relative">
              <Input
                multiline
                rows={12}
                fullWidth
                value={exportText}
                readOnly
                className="font-mono text-xs"
              />
              <button
                onClick={() => void handleCopyExport()}
                className="absolute top-2 right-2 p-2 rounded bg-bg-surface hover:bg-bg-muted text-text-secondary hover:text-text-primary transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </TabPanel>
        </Tabs>
      </DialogContent>
      <DialogActions>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        {tab === "import" && (
          <Button
            variant="primary"
            onClick={handleImport}
            startIcon={<Upload className="w-4 h-4" />}
          >
            Import
          </Button>
        )}
        {tab === "export" && (
          <>
            <Button
              variant="outlined"
              onClick={handleDownloadJSON}
              startIcon={<Download className="w-4 h-4" />}
            >
              Download JSON
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleCopyExport()}
              startIcon={<Copy className="w-4 h-4" />}
            >
              Copy to Clipboard
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
