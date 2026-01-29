import React, { useContext, useRef, useCallback, useEffect, useState } from "react"
import type { NodeChange, EdgeChange, Node, Edge, Connection, Viewport } from "@xyflow/react"
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
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
import { v4 as uuid } from "uuid"
import type { KeyboardLayout } from "../types/KeyboardTypes.ts"
import { useTheme } from "@mui/material/styles"
import { useFetchKeyboard } from "../context/EditorContext.tsx"
import LoadingPage from "./LoadingPage.tsx"
import ErrorPage from "./ErrorPage.tsx"
import EditorSidebar from "../components/EditorSidebar.tsx"
import KeyboardKey from "../components/shapes/KeyboardKey.tsx"
import GroupRotationHandle from "../components/GroupRotationHandle.tsx"
import { HistoryContext } from "../context/HistoryContext.tsx"
import { useAppDispatch } from "../app/hooks.ts"
import { setKeyboard } from "../app/editorSlice.tsx"
import { UNIT_SIZE, SNAP_SIZE, FINE_SNAP_SIZE } from "../constants/editor"

const nodeTypes = {
  keyboardKey: KeyboardKey,
}

type MenuState = {
  id: string
  top?: number
  left?: number
  right?: number
  bottom?: number
} | null

const KeyboardEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const fetchKeyboard = useFetchKeyboard()
  const { keyboardId } = useParams<{ keyboardId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [menu, setMenu] = useState<MenuState>(null)
  const reactFlowInstance = useReactFlow()
  const { screenToFlowPosition } = useReactFlow()
  const theme = useTheme()
  const { recordHistory, scheduleSave } = useContext(HistoryContext)
  const dispatch = useAppDispatch()

  const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined)
  const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined)

  const [nodes, setNodes] = useNodesState<Node>([])
  const [edges, setEdges] = useEdgesState<Edge>([])

  // Track Alt key for fine snap mode
  const [isAltPressed, setIsAltPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const currentSnapSize = isAltPressed ? FINE_SNAP_SIZE : SNAP_SIZE

  const updateHelperLines = useCallback(
    (changes: NodeChange[], currentNodes: Node[]) => {
      setHelperLineHorizontal(undefined)
      setHelperLineVertical(undefined)

      // Find all position changes that are dragging
      const positionChanges = changes.filter(
        (c): c is NodeChange & { type: "position"; position: { x: number; y: number }; dragging: true } =>
          c.type === "position" && c.dragging === true && c.position !== undefined
      )

      if (positionChanges.length === 0) {
        return changes
      }

      const snapSize = currentSnapSize

      if (positionChanges.length === 1) {
        // Single node drag - apply helper lines snapping first, then grid snap
        const change = positionChanges[0]
        const helperLines = getHelperLines(change, currentNodes)

        // Apply helper line snap if available
        if (helperLines.snapPosition.x !== undefined) {
          change.position.x = helperLines.snapPosition.x
          setHelperLineVertical(helperLines.vertical)
        } else {
          // Otherwise apply grid snap
          change.position.x = Math.round(change.position.x / snapSize) * snapSize
        }

        if (helperLines.snapPosition.y !== undefined) {
          change.position.y = helperLines.snapPosition.y
          setHelperLineHorizontal(helperLines.horizontal)
        } else {
          // Otherwise apply grid snap
          change.position.y = Math.round(change.position.y / snapSize) * snapSize
        }
      } else {
        // Multi-select drag - preserve relative positions by applying uniform snap
        // Use the first node as anchor and apply the same grid snap to all
        const anchor = positionChanges[0]

        // Calculate how much the anchor would need to move to snap to grid
        const snappedX = Math.round(anchor.position.x / snapSize) * snapSize
        const snappedY = Math.round(anchor.position.y / snapSize) * snapSize
        const deltaX = snappedX - anchor.position.x
        const deltaY = snappedY - anchor.position.y

        // Apply the same delta to all selected nodes to preserve relative positions
        for (const change of positionChanges) {
          change.position.x += deltaX
          change.position.y += deltaY
        }
      }

      return changes
    },
    [currentSnapSize]
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(prevNodes => {
        const updatedChanges = updateHelperLines(changes, prevNodes)
        return applyNodeChanges(updatedChanges, prevNodes)
      })
    },
    [setNodes, updateHelperLines]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(eds => applyEdgeChanges(changes, eds))
      scheduleSave()
    },
    [setEdges, scheduleSave]
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
    [setEdges, scheduleSave, recordHistory]
  )

  const onNodeDragStart = useCallback(() => {
    recordHistory()
  }, [recordHistory])

  const onNodeDragStop = useCallback(() => {
    scheduleSave()
  }, [scheduleSave])

  function safeCloneNode(node: Node): Node {
    return {
      ...node,
      data: { ...node.data },
      position: { ...node.position },
      measured: node.measured ? { ...node.measured } : undefined,
    }
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!keyboardId) {
        setNodes([])
        setEdges([])
        setLoading(false)
        return
      }
      setLoading(true)

      const { data, error } = await fetchKeyboard(keyboardId)

      if (cancelled) return

      if (error) {
        setError(error)
        console.error("Supabase error:", error)
      } else if (data) {
        const layout = data.reactflow as KeyboardLayout | undefined

        if (layout) {
          if (layout.viewport) {
            void reactFlowInstance.setViewport(layout.viewport as Viewport)
          }

          const nodesForReactFlow = layout.nodes?.map(safeCloneNode) ?? []
          setNodes(nodesForReactFlow)
          setEdges(layout.edges ?? [])
          dispatch(setKeyboard(data))
        }
      }

      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardId])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const transferData = event.dataTransfer.getData("application/reactflow")
      if (!transferData) return

      const data = JSON.parse(transferData)
      if (!data || data.type !== "keyboardKey") return

      const keyWidth = data.widthU * UNIT_SIZE
      const keyHeight = data.heightU * UNIT_SIZE

      const rawPosition = screenToFlowPosition({
        x: event.clientX - keyWidth / 2,
        y: event.clientY - keyHeight / 2,
      })

      const snapSize = event.altKey ? FINE_SNAP_SIZE : SNAP_SIZE
      const snapToGrid = (val: number) => Math.round(val / snapSize) * snapSize

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

      setNodes(nds => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()

      if (!ref.current) return
      const pane = ref.current.getBoundingClientRect()
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 ? event.clientY : undefined,
        left: event.clientX < pane.width - 200 ? event.clientX : undefined,
        right: event.clientX >= pane.width - 200 ? pane.width - event.clientX : undefined,
        bottom: event.clientY >= pane.height - 200 ? pane.height - event.clientY : undefined,
      })
    },
    []
  )

  const onPaneClick = useCallback(() => setMenu(null), [])

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage />

  return (
    <div
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
          snapGrid={[currentSnapSize, currentSnapSize]}
          snapToGrid={false}
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
          onNodeDragStop={onNodeDragStop}
          onPaneClick={onPaneClick}
          fitView
          proOptions={{
            hideAttribution: true,
          }}
          nodeTypes={nodeTypes}
        >
          <MiniMap pannable={true} />
          <Controls />
          <Background gap={SNAP_SIZE} />
          <HelperLines
            horizontal={helperLineHorizontal}
            vertical={helperLineVertical}
          />
          <GroupRotationHandle />
          {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
        </ReactFlow>
      </div>
    </div>
  )
}

export default KeyboardEditor
