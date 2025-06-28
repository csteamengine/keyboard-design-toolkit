import type { Edge, Node } from "@xyflow/react"

export type KeyboardLayout = {
  nodes: Node[]
  edges: Edge[]
  viewport?: { x: number; y: number; zoom: number }
}

export type Keyboard = {
  id: string
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
  reactflow?: KeyboardLayout
  settings?: Record<string, unknown>
}
