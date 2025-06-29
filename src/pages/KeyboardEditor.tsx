import type React from "react"
import { useRef } from "react"
import { useCallback, useEffect, useState } from "react"
import type { NodeChange, NodeProps } from "@xyflow/react"
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"
import { useParams } from "react-router-dom"
import type { PostgrestError } from "@supabase/supabase-js"
import { getHelperLines } from "../utils/utils.ts"
import HelperLines from "../components/HelperLines.tsx"
import ContextMenu from "../components/ContextMenu.tsx"
import { uuid } from "@supabase/supabase-js/dist/main/lib/helpers"
import type { KeyboardLayout } from "../types/KeyboardTypes.ts"
import { Box, Paper, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  useFetchKeyboard,
  useUpdateKeyboard,
} from "../context/KeyboardContext.tsx"
import { GridCheckIcon } from "@mui/x-data-grid"
import LoadingPage from "./LoadingPage.tsx"
import ErrorPage from "./ErrorPage.tsx"

const unitSize = 60 // px per 1u

const KEY_SIZES = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.75, 3, 6]

const KeyboardKeyNode = ({ data }: NodeProps) => {
  const width = Number(data.widthU) * unitSize
  return (
    <div
      style={{
        width,
        height: unitSize,
        border: "1px solid #555",
        borderRadius: 4,
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontFamily: "monospace",
      }}
    >
      {String(data.label)}
    </div>
  )
}

const nodeTypes = {
  keyboardKey: KeyboardKeyNode,
}

const KeyboardEditor: React.FC = () => {
  const reactFlowWrapper = useRef(null)
  const fetchKeyboard = useFetchKeyboard()
  const updateKeyboard = useUpdateKeyboard()
  const { keyboardId } = useParams<{ keyboardId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [menu, setMenu] = useState(null)
  const reactFlowInstance = useReactFlow()
  const { screenToFlowPosition } = useReactFlow()
  const theme = useTheme()
  const ref = useRef(null)

  const [helperLineHorizontal, setHelperLineHorizontal] = useState<
    number | undefined
  >(undefined)
  const [helperLineVertical, setHelperLineVertical] = useState<
    number | undefined
  >(undefined)

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  const saveFlow = useCallback(async () => {
    if (!keyboardId) return
    const { error } = await updateKeyboard(keyboardId, {
      reactflow: reactFlowInstance.toObject(),
    })

    if (error) {
      console.error("Error saving layout:", error.message)
    }
  }, [updateKeyboard, reactFlowInstance, keyboardId])

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      void saveFlow()
    }, 800) // wait 800ms after last change
  }, [saveFlow])

  // === Change Handlers ===
  const updateHelperLines = useCallback(
    (changes: NodeChange[], nodes: Node[]) => {
      // reset the helper lines (clear existing lines, if any)
      setHelperLineHorizontal(undefined)
      setHelperLineVertical(undefined)

      // this will be true if it's a single node being dragged
      // inside we calculate the helper lines and snap position for the position where the node is being moved to
      if (
        changes.length === 1 &&
        changes[0].type === "position" &&
        changes[0].dragging &&
        changes[0].position
      ) {
        const helperLines = getHelperLines(changes[0], nodes)

        // if we have a helper line, we snap the node to the helper line position
        // this is being done by manipulating the node position inside the change object
        changes[0].position.x =
          helperLines.snapPosition.x ?? changes[0].position.x
        changes[0].position.y =
          helperLines.snapPosition.y ?? changes[0].position.y

        // if helper lines are returned, we set them so that they can be displayed
        setHelperLineHorizontal(helperLines.horizontal)
        setHelperLineVertical(helperLines.vertical)
      }

      return changes
    },
    [],
  )

  const onNodesChange = useCallback(
    changes => {
      setNodes(nds => {
        const updatedChanges = updateHelperLines(changes, nds)
        return applyNodeChanges(updatedChanges, nds)
      })
      scheduleSave()
    },
    [setNodes, scheduleSave, updateHelperLines],
  )

  const onEdgesChange = useCallback(
    changes => {
      setEdges(eds => applyEdgeChanges(changes, eds))
      scheduleSave()
    },
    [setEdges, scheduleSave],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => {
        const updated = addEdge(connection, eds)
        scheduleSave()
        return updated
      })
    },
    [setEdges, scheduleSave],
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data, error } = await fetchKeyboard(keyboardId)

      if (error) {
        setError(error)
        console.error("Supabase error:", error)
      } else {
        const layout: KeyboardLayout = data?.reactflow as KeyboardLayout

        if (layout) {
          await reactFlowInstance.setViewport(layout.viewport)
          setNodes(layout.nodes ?? [])
          setEdges(layout.edges ?? [])
        }
        console.log(data)
      }

      setLoading(false)
    }

    void load()
  }, [keyboardId, setEdges, setNodes])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const data = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      )

      if (!data || data.type !== "keyboardKey") return

      const keyWidth = data.widthU * unitSize
      const keyHeight = unitSize

      const position = screenToFlowPosition({
        x: event.clientX - keyWidth / 2,
        y: event.clientY - keyHeight / 2,
      })

      const newNode: Node = {
        id: uuid(),
        type: "keyboardKey",
        position,
        data: {
          label: `${data.widthU}u`,
          widthU: data.widthU,
        },
      }

      setNodes(nds => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const ShapePanel = () => {
    return (
      <Paper
        elevation={4}
        sx={{
          padding: 2,
          ml: 1,
          position: "fixed",
          zIndex: 1200,
          left: "50%",
          bottom: 24,
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "1000px",
        }}
      >
        {KEY_SIZES.map(u => (
          <div
            key={u}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData(
                "application/reactflow",
                JSON.stringify({ type: "keyboardKey", widthU: u }),
              )
              e.dataTransfer.effectAllowed = "move"
            }}
            style={{
              width: u * unitSize,
              height: unitSize,
              backgroundColor: "#ddd",
              border: "1px solid #888",
              borderRadius: 4,
              marginBottom: 8,
              textAlign: "center",
              lineHeight: `${unitSize}px`,
              fontFamily: "monospace",
              cursor: "grab",
            }}
          >
            {u}u
          </div>
        ))}
      </Paper>
    )
  }

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault()

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect()
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      })
    },
    [setMenu],
  )

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu])

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage />

  return (
    <div
      className="tester"
      style={{
        display: "flex",
        flexGrow: 1,
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
      }}
    >
      <ShapePanel />
      <div
        ref={reactFlowWrapper}
        style={{ flexGrow: 1, position: "relative" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          ref={ref}
          nodes={nodes}
          edges={edges}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onMoveEnd={scheduleSave}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          fitView
          proOptions={{
            hideAttribution: true,
          }}
          nodeTypes={nodeTypes}
        >
          <MiniMap pannable={true} />
          <Controls />
          <Background gap={16} />
          <HelperLines
            horizontal={helperLineHorizontal}
            vertical={helperLineVertical}
          />
          {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
        </ReactFlow>
      </div>
    </div>
  )
}

export default KeyboardEditor
