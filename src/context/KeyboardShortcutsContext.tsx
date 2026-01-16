import type { ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import type { Node, Edge } from "@xyflow/react"
import { useReactFlow, useStore } from "@xyflow/react"
import { uuid } from "@supabase/supabase-js/dist/main/lib/helpers"
import { HistoryContext } from "./HistoryContext.tsx"

const KeyboardShortcutsContext = createContext(null)

export const useKeyboardShortcuts = () => useContext(KeyboardShortcutsContext)

export const KeyboardShortcutsProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const { recordHistory, undo, redo } = useContext(HistoryContext)
  const { setNodes, setEdges, addNodes, deleteElements } = useReactFlow()
  const { screenToFlowPosition } = useReactFlow()
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const { saveFlow } = useContext(HistoryContext)

  const selectedNodesRef = useRef<Node[]>([])
  const selectedEdgesRef = useRef<Edge[]>([])

  const selectedNodes = useStore(
    state => state.nodes.filter(n => n.selected),
    (a, b) => a.length === b.length && a.every((n, i) => n.id === b[i].id),
  )

  const selectedEdges = useStore(
    state => state.edges.filter(e => e.selected),
    (a, b) => a.length === b.length && a.every((e, i) => e.id === b[i].id),
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    selectedNodesRef.current = selectedNodes
  }, [selectedNodes])

  useEffect(() => {
    selectedEdgesRef.current = selectedEdges
  }, [selectedEdges])

  const clipboardRef = useRef<Node[]>([])

  const handleCopy = useCallback(() => {
    clipboardRef.current = selectedNodesRef.current.map(node => ({
      ...node,
      position: { ...node.position },
      selected: false,
    }))
  }, [selectedNodesRef])

  const handlePaste = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ ...node, selected: false })))
    setEdges(edges => edges.map(edge => ({ ...edge, selected: false })))

    const copiedNodes = clipboardRef.current
    if (copiedNodes.length === 0) return

    const centerPos = screenToFlowPosition(mousePosRef.current)

    // Safely get width/height with fallback to 0
    const getNodeBounds = (node: Node) => {
      const width = node.width ?? 0
      const height = node.height ?? 0
      return {
        left: node.position.x,
        right: node.position.x + width,
        top: node.position.y,
        bottom: node.position.y + height,
      }
    }

    // Get overall bounding box
    const bounds = copiedNodes.map(getNodeBounds)
    const minX = Math.min(...bounds.map(b => b.left))
    const maxX = Math.max(...bounds.map(b => b.right))
    const minY = Math.min(...bounds.map(b => b.top))
    const maxY = Math.max(...bounds.map(b => b.bottom))

    const selectionCenter = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    }

    const unitSize = 60 / 4 // or whatever your snapping grid size is

    const snapToGrid = (val: number) => Math.round(val / unitSize) * unitSize

    const newNodes = copiedNodes.map(node => {
      const rawX = node.position.x - selectionCenter.x + centerPos.x
      const rawY = node.position.y - selectionCenter.y + centerPos.y

      return {
        ...node,
        id: uuid(),
        position: {
          x: snapToGrid(rawX),
          y: snapToGrid(rawY),
        },
        selected: true,
        data: { ...node.data },
      }
    })

    recordHistory()

    addNodes(newNodes)
  }, [setEdges, setNodes, addNodes, recordHistory, screenToFlowPosition])

  const handleDelete = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return
    recordHistory()
    void deleteElements({ nodes: selectedNodes, edges: selectedEdges })
  }, [selectedNodes, selectedEdges, deleteElements, recordHistory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Don't intercept shortcuts when focused on input elements
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (mod && e.key === "c" && !isInputFocused) {
        e.preventDefault()
        handleCopy()
      }

      if (mod && e.key === "v" && !isInputFocused) {
        e.preventDefault()
        handlePaste()
      }

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      if ((mod && e.key === "y") || (mod && e.key === "z" && e.shiftKey)) {
        e.preventDefault()
        redo()
      }

      if (e.key === "Escape") {
        e.preventDefault()
        // Deselect all nodes and edges
        setNodes(nodes => nodes.map(node => ({ ...node, selected: false })))
        setEdges(edges => edges.map(edge => ({ ...edge, selected: false })))
      }

      if (mod && e.key === "a" && !isInputFocused) {
        e.preventDefault()
        // Select all nodes
        setNodes(nodes => nodes.map(node => ({ ...node, selected: true })))
        // Select all edges
        setEdges(edges => edges.map(edge => ({ ...edge, selected: true })))
      }

      if (mod && e.key === "s") {
        e.preventDefault()
        e.stopPropagation()
        void saveFlow()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    setEdges,
    setNodes,
    handleDelete,
    handleCopy,
    handlePaste,
    undo,
    redo,
    saveFlow,
  ])

  return (
    <KeyboardShortcutsContext.Provider value={null}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}
