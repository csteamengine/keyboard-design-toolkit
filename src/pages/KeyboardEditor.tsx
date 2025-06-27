import type React from "react"
import { useRef } from "react"
import { useCallback, useEffect, useState } from "react"
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"
import { useParams } from "react-router-dom"
import { supabase } from "../app/supabaseClient"
import type { PostgrestError } from "@supabase/supabase-js"

type KeyboardLayout = {
  nodes: Node[]
  edges: Edge[]
}

type Props = {}

const KeyboardEditor: React.FC<Props> = () => {
  const { keyboardId } = useParams<{ keyboardId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reactFlowInstance = useReactFlow()

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  const saveFlow = useCallback(async () => {
    const { data, error } = await supabase
      .from("keyboards")
      .update({ reactflow: reactFlowInstance.toObject() })
      .eq("id", keyboardId)
      .select()
      .single()

    if (error) {
      console.error("Error saving layout:", error.message)
    } else {
      console.log("Layout saved", data)
    }
  }, [nodes, edges, keyboardId])

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      void saveFlow()
    }, 800) // wait 800ms after last change
  }, [saveFlow])

  // === Change Handlers ===
  const onNodesChange = useCallback(
    changes => {
      setNodes(nds => applyNodeChanges(changes, nds))
      scheduleSave()
    },
    [scheduleSave],
  )

  const onEdgesChange = useCallback(
    changes => {
      setEdges(eds => applyEdgeChanges(changes, eds))
      scheduleSave()
    },
    [scheduleSave],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => {
        const updated = addEdge(connection, eds)
        scheduleSave()
        return updated
      })
    },
    [scheduleSave],
  )

  useEffect(() => {
    const fetchKeyboard = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("keyboards")
        .select("*")
        .eq("id", keyboardId)
        .single()

      if (error) {
        setError(error)
        console.error("Supabase error:", error)
      } else {
        const layout: KeyboardLayout = data.reactflow as KeyboardLayout
        setNodes(layout.nodes ?? [])
        setEdges(layout.edges ?? [])
        console.log(data)
      }

      setLoading(false)
    }

    void fetchKeyboard()
  }, [keyboardId, setEdges, setNodes])

  if (loading) return <div>Loading keyboard layout...</div>
  if (error) return <div>Error loading keyboard layout: {error.message}</div>

  return (
    <div
      style={{ width: "100%", height: "100%", display: "flex", flexGrow: 1 }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  )
}

export default KeyboardEditor
