import type { ReactNode } from "react"
import { useRef } from "react"
import { useMemo } from "react"
import { createContext, useCallback } from "react"
import { type Edge, type Node, useReactFlow } from "@xyflow/react"
import { useUpdateKeyboard } from "./EditorContext.tsx"
import { useParams } from "react-router-dom"
import { enqueueSnackbar } from "notistack"
import { useAppSelector } from "../app/hooks.ts"
import { selectKeyboard } from "../app/editorSlice.tsx"

type HistoryContextType = {
  undo: () => void
  redo: () => void
  recordHistory: () => void
  scheduleSave: () => void
  saveFlow: () => Promise<void>
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
  scheduleSave: () => {
    // do nothing.
  },
  saveFlow: async () => {
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
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()
  const keyboard = useAppSelector(selectKeyboard)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const historyRef = useRef<FlowSnapshot[]>([])
  const redoStackRef = useRef<FlowSnapshot[]>([])
  const updateKeyboard = useUpdateKeyboard()
  const reactFlowInstance = useReactFlow()
  const { keyboardId } = useParams<{ keyboardId: string }>()

  const saveFlow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    if (!keyboardId) return
    const { error } = await updateKeyboard(keyboardId, {
      name: keyboard.name,
      description: keyboard.description,
      reactflow: reactFlowInstance.toObject(),
      settings: keyboard?.settings,
    })

    if (error) {
      console.error("Error saving layout:", error.message)
      enqueueSnackbar("that was easy!", { variant: "error" })
    } else {
      enqueueSnackbar("Layout saved successfully!", {
        variant: "success",
      })
    }
  }, [updateKeyboard, reactFlowInstance, keyboardId])

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      void saveFlow()
    }, 10000) // wait 10s after last change
  }, [saveFlow])

  /**
   * Takes a snapshot in the history for the undo/redo feature.
   */
  const recordHistory = useCallback(() => {
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
    () => ({ undo, redo, recordHistory, scheduleSave, saveFlow }),
    [undo, redo, recordHistory, scheduleSave, saveFlow],
  )

  return (
    <HistoryContext.Provider value={HistoryContextMemo}>
      {children}
    </HistoryContext.Provider>
  )
}
