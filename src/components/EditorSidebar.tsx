import { Tabs, Tab, Box, Typography, Paper } from "@mui/material"
import type { ReactNode } from "react"
import { useState } from "react"
import CategoryIcon from "@mui/icons-material/Category"
import TuneIcon from "@mui/icons-material/Tune"
import SettingsIcon from "@mui/icons-material/Settings"
import KeyDetailsForm from "./KeyDetailsForm.tsx"

const unitSize = 60 // px per 1u

const KEY_SIZES = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.75, 3, 6, 6.5]
const VERTICAL_KEY_SIZES = [1.25, 1.5, 1.75, 2]

type TabPanelProps = {
  children?: ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function EditorSidebar({ selectedNodes, updateNodes }) {
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState("shapes") // "shapes" | "details" | "settings" | ""

  const handleTabChange = panelKey => {
    setActivePanel(prev => (prev === panelKey ? null : panelKey))
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

  const sidebarWidth = open ? 400 : 60

  return (
    <Paper
      className="charlies-sidebar"
      elevation={3}
      sx={{
        borderRadius: 0,

        // Positioning
        position: "relative",
        bottom: "auto",
        left: "auto",
        width: sidebarWidth,
        height: "100%",
        zIndex: 3,

        // Styles
        backgroundColor: "background.paper",
        overflowY: "auto",
        transition: "all 0.3s ease",
        padding: open ? 2 : 1,
        boxShadow: theme =>
          `${theme.shadows[4]}, inset 10px 0px 10px -10px ${theme.palette.background.paper}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Content area (left side) */}
        <Box
          sx={{
            flexGrow: 1,
            borderRight: 1,
            borderColor: "divider",
            overflow: "auto",
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s ease 0.1s",
            pointerEvents: open ? "auto" : "none",
            marginRight: "60px",
          }}
        >
          <TabPanel value={activePanel} index="shapes">
            <Box
              className="charlies-div"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1, // theme spacing unit, e.g., 8px if theme.spacing(1) === 8
                alignItems: "flex-start",
              }}
            >
              {KEY_SIZES.map(u => (
                <div
                  key={u}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData(
                      "application/reactflow",
                      JSON.stringify({
                        type: "keyboardKey",
                        widthU: u,
                        heightU: 1,
                        label: `${u}u`,
                      }),
                    )
                    e.dataTransfer.effectAllowed = "move"
                  }}
                  style={{
                    width: u * unitSize * (3 / 4),
                    height: unitSize * (3 / 4),
                    backgroundColor: "#ddd",
                    border: "1px solid #888",
                    borderRadius: 4,
                    textAlign: "center",
                    lineHeight: `${unitSize * (3 / 4)}px`,
                    fontFamily: "monospace",
                    cursor: "grab",
                  }}
                >
                  {u}
                </div>
              ))}
              {VERTICAL_KEY_SIZES.map(u => (
                <div
                  key={String(u) + "v"}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData(
                      "application/reactflow",
                      JSON.stringify({
                        type: "keyboardKey",
                        widthU: 1,
                        heightU: u,
                        label: `${u}u`,
                      }),
                    )
                    e.dataTransfer.effectAllowed = "move"
                  }}
                  style={{
                    width: unitSize * (3 / 4),
                    height: u * unitSize * (3 / 4),
                    backgroundColor: "#ddd",
                    border: "1px solid #888",
                    borderRadius: 4,
                    textAlign: "center",
                    lineHeight: `${unitSize * (3 / 4)}px`,
                    fontFamily: "monospace",
                    cursor: "grab",
                  }}
                >
                  {u}
                </div>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activePanel} index="details">
            <KeyDetailsForm
              selectedNodes={selectedNodes}
              updateNodes={updateNodes}
            />
          </TabPanel>
          <TabPanel value={activePanel} index="settings">
            Tab Three Content
          </TabPanel>
        </Box>

        {/* Tabs on the right side */}
        <Tabs
          value={activePanel}
          onChange={(e, val) => {
            handleTabChange(val)
          }}
          orientation="vertical"
          variant="fullWidth"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 60,
            height: "100%",
            borderLeft: 1,
            borderColor: "divider",
            marginLeft: -16,
            ".MuiTabs-flexContainer": {
              flexDirection: "column",
            },
            ".MuiTabs-list": {
              marginLeft: -2,
            },
          }}
        >
          <Tab
            icon={<CategoryIcon />}
            value="shapes"
            aria-label="Shapes"
            onClick={() => {
              handleTabClick("shapes")
            }}
          />
          <Tab
            icon={<TuneIcon />}
            value="details"
            aria-label="details"
            onClick={() => {
              handleTabClick("details")
            }}
          />
          <Tab
            icon={<SettingsIcon />}
            value="settings"
            aria-label="Settings"
            onClick={() => {
              handleTabClick("settings")
            }}
          />
        </Tabs>
      </Box>
    </Paper>
  )
}
