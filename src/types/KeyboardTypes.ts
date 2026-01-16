import type { Edge, Node } from "@xyflow/react"

// Key-specific data stored in ReactFlow node.data
export type KeyData = {
  label: string
  widthU: number
  heightU: number
  rotation?: number // degrees, 0-360
  rotationOriginX?: number // rx in KLE format (in units)
  rotationOriginY?: number // ry in KLE format (in units)
  legend?: string[] // multiple legends (for multi-legend keycaps)
  color?: string // key background color
  textColor?: string // key label color
  row?: number
  column?: number
}

// ReactFlow node with typed data
export type KeyboardKeyNode = Node & {
  data: KeyData
  type?: "keyboardKey"
}

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

// KLE (Keyboard Layout Editor) format types
export type KLEProperties = {
  x?: number // X offset from previous key
  y?: number // Y offset from current row
  w?: number // Width in units (default 1)
  h?: number // Height in units (default 1)
  x2?: number // Secondary X (for stepped keys)
  y2?: number // Secondary Y (for stepped keys)
  w2?: number // Secondary width
  h2?: number // Secondary height
  r?: number // Rotation angle in degrees
  rx?: number // Rotation origin X (in units)
  ry?: number // Rotation origin Y (in units)
  a?: number // Legend alignment (0-7)
  f?: number // Font size
  f2?: number // Secondary font size
  fa?: number[] // Font sizes array
  p?: string // Profile (e.g., "DSA", "SA")
  c?: string // Key color
  t?: string // Text/legend color
  g?: boolean // Ghost key
  d?: boolean // Decal (non-functional key)
  n?: boolean // Homing key
  l?: boolean // Stepped key
  sm?: string // Switch mount
  sb?: string // Switch brand
  st?: string // Switch type
}

export type KLERow = (KLEProperties | string)[]
export type KLELayout = KLERow[]

// Parsed KLE metadata
export type KLEMetadata = {
  name?: string
  author?: string
  notes?: string
  background?: {
    name?: string
    style?: string
  }
  radii?: string
  switchMount?: string
  switchBrand?: string
  switchType?: string
}
