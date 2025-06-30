import React, { useContext } from "react"
import { useRef } from "react"
import { useCallback, useEffect, useState } from "react"
import type { NodeChange } from "@xyflow/react"
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
import "../styles.css"
import { useParams } from "react-router-dom"
import type { PostgrestError } from "@supabase/supabase-js"
import { getHelperLines } from "../utils/utils.ts"
import HelperLines from "../components/HelperLines.tsx"
import ContextMenu from "../components/ContextMenu.tsx"
import { uuid } from "@supabase/supabase-js/dist/main/lib/helpers"
import type { KeyboardLayout } from "../types/KeyboardTypes.ts"
import { useTheme } from "@mui/material/styles"
import {
  useFetchKeyboard,
  useUpdateKeyboard,
} from "../context/KeyboardContext.tsx"
import LoadingPage from "./LoadingPage.tsx"
import ErrorPage from "./ErrorPage.tsx"
import EditorSidebar from "../components/EditorSidebar.tsx"
import KeyboardKey from "../components/shapes/KeyboardKey.tsx"
import { HistoryContext } from "../context/HistoryContext.tsx"

const unitSize = 60 // px per 1u

const nodeTypes = {
  keyboardKey: KeyboardKey,
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
  const { recordHistory } = useContext(HistoryContext)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedNodes, setSelectedNodes] = useState<Node>([])

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
        recordHistory()
        return updated
      })
    },
    [setEdges, scheduleSave, recordHistory],
  )

  const onNodeDragStart = useCallback(() => {
    console.log("Drag started")
    recordHistory()
  }, [recordHistory])

  useEffect(() => {
    const load = async () => {
      if (!keyboardId) {
        setNodes([])
        setEdges([])
        setName("New Keyboard")
        setLoading(false)
        return
      }
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
          setName(data?.name ?? "")
          setDescription(data?.description ?? "")
        }
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

      const stepSize = unitSize / 4 // 1u is 60px, so 1/4 of that is 15px

      const keyWidth = data.widthU * unitSize
      const keyHeight = data.heightU * unitSize

      const rawPosition = screenToFlowPosition({
        x: event.clientX - keyWidth / 2,
        y: event.clientY - keyHeight / 2,
      })

      const snapToGrid = (val: number) => Math.round(val / stepSize) * stepSize

      const snappedPosition = {
        x: snapToGrid(rawPosition.x),
        y: snapToGrid(rawPosition.y),
      }

      const newNode: Node = {
        id: uuid(),
        type: "keyboardKey",
        position: snappedPosition,
        data: {
          label: data.label,
          widthU: data.widthU,
          heightU: data.heightU ?? 1,
        },
        width: keyWidth,
        height: keyHeight,
      }

      setNodes(nds => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

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
        position: "relative",
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
      }}
    >
      <EditorSidebar />
      <div
        ref={reactFlowWrapper}
        style={{ flexGrow: 1, position: "relative" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          snapGrid={[unitSize / 4, unitSize / 4]}
          snapToGrid={true}
          ref={ref}
          nodes={nodes}
          edges={edges}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onMoveEnd={scheduleSave}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDragStart={onNodeDragStart}
          onPaneClick={onPaneClick}
          fitView
          proOptions={{
            hideAttribution: true,
          }}
          onSelectionChange={({ nodes }) => {
            setSelectedNodes(nodes)
          }}
          nodeTypes={nodeTypes}
        >
          <MiniMap pannable={true} />
          <Controls />
          <Background gap={unitSize / 4} />
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
