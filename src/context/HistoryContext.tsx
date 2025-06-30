import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { useMemo } from "react"
import { createContext, useCallback } from "react"
import { type Edge, type Node, useReactFlow, useStoreApi } from "@xyflow/react"

type HistoryContextType = {
  undo: () => void
  redo: () => void
  recordHistory: () => void
}

type FlowSnapshot = {
  nodes: Node[]
  edges: Edge[]
}

type HistoryContextProviderProps = {
  children: ReactNode
}

const initialValue = {
  undo: () => {
    // do nothing.
  },
  redo: () => {
    // do nothing.
  },
  recordHistory: () => {
    // do nothing.
  },
}

export const HistoryContext = createContext<HistoryContextType>(initialValue)

/**
 * Keeps track of the history for any actions that use the recordHistory function
 */
export function HistoryContextProvider({
  children,
}: HistoryContextProviderProps) {
  const store = useStoreApi()
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()
  // const { dispatchSaveFlowchart } = useContext(SaveFlowchartContext)
  const reactFlowInstance = useReactFlow()
  const historyRef = useRef<FlowSnapshot[]>([])
  const redoStackRef = useRef<FlowSnapshot[]>([])

  /**
   * Takes a snapshot in the history for the undo/redo feature.
   */
  const recordHistory = useCallback(() => {
    console.log("Recording history snapshot")
    historyRef.current.push({
      nodes: getNodes(),
      edges: getEdges(),
    })
    redoStackRef.current = []
  }, [getNodes, getEdges])

  const undo = useCallback(() => {
    const prev = historyRef.current.pop()
    if (prev) {
      redoStackRef.current.push({ nodes: getNodes(), edges: getEdges() })
      setNodes(prev.nodes)
      setEdges(prev.edges)
    }
  }, [getNodes, getEdges, setNodes, setEdges])

  const redo = useCallback(() => {
    const next = redoStackRef.current.pop()
    if (next) {
      historyRef.current.push({ nodes: getNodes(), edges: getEdges() })
      setNodes(next.nodes)
      setEdges(next.edges)
    }
  }, [getNodes, getEdges, setNodes, setEdges])

  const HistoryContextMemo = useMemo(
    () => ({ undo, redo, recordHistory }),
    [undo, redo, recordHistory],
  )

  return (
    <HistoryContext.Provider value={HistoryContextMemo}>
      {children}
    </HistoryContext.Provider>
  )
}
