import type { Edge, Node } from "@xyflow/react"

export type KeyboardLayout = {
  nodes: Node[]
  edges: Edge[]
  viewport?: { x: number; y: number; zoom: number }
}
