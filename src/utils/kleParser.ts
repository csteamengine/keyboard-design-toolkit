// KLE (Keyboard Layout Editor) Parser
// Converts keyboard-layout-editor.com JSON format to ReactFlow nodes

import { v4 as uuid } from "uuid"
import type { Node } from "@xyflow/react"
import type { KLEProperties, KLERow } from "../types/KeyboardTypes"
import { UNIT_SIZE } from "../constants/editor"
import { getRotatedBoundingBox, rotatePoint } from "./rotation"

// Default state for KLE parsing
type ParserState = {
  x: number
  y: number
  rotation: number
  rotationOriginX: number
  rotationOriginY: number
  width: number
  height: number
  color: string
  textColor: string
}

function createDefaultState(): ParserState {
  return {
    x: 0,
    y: 0,
    rotation: 0,
    rotationOriginX: 0,
    rotationOriginY: 0,
    width: 1,
    height: 1,
    color: "#ffffff",
    textColor: "#000000",
  }
}

/**
 * Parse a KLE raw data string into a JavaScript array.
 * KLE format uses a slightly non-standard JSON (unquoted keys).
 */
export function parseKLERaw(rawData: string): KLERow[] {
  // Clean up the input
  let cleaned = rawData.trim()

  // Remove trailing commas (KLE sometimes has these)
  cleaned = cleaned.replace(/,\s*$/, "")

  // KLE raw data format is multiple arrays on separate lines like:
  // ["A","B","C"],
  // ["D","E","F"]
  // This needs to be wrapped in an outer array to be valid JSON

  // Check if this looks like KLE format (starts with [ but isn't already [[)
  // KLE format: starts with [ followed by something other than [
  // Already wrapped: starts with [[
  if (cleaned.startsWith("[") && !cleaned.startsWith("[[")) {
    // Check if it's a single row or multiple rows
    // If there's a ],[ pattern, it's multiple rows that need wrapping
    if (cleaned.includes("],[") || cleaned.includes("],\n[") || cleaned.includes("],\r\n[")) {
      cleaned = `[${cleaned}]`
    } else {
      // Single row - still needs to be wrapped
      cleaned = `[${cleaned}]`
    }
  } else if (!cleaned.startsWith("[")) {
    // Doesn't start with [ at all, wrap it
    cleaned = `[${cleaned}]`
  }

  // KLE uses unquoted keys which isn't valid JSON
  // Convert {x:1} to {"x":1}
  // Be careful not to match inside strings
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')

  try {
    return JSON.parse(cleaned)
  } catch (error) {
    console.error("Failed to parse KLE data:", error, "\nCleaned data:", cleaned)
    throw new Error("Invalid KLE format. Please check your input.")
  }
}

/**
 * Parse KLE JSON rows into ReactFlow nodes.
 */
export function parseKLE(kleData: KLERow[]): Node[] {
  const nodes: Node[] = []
  const state = createDefaultState()

  for (const row of kleData) {
    // If this is the first element and it's a metadata object (has "name" property),
    // skip it as it's keyboard metadata, not key data
    if (
      Array.isArray(row) === false &&
      typeof row === "object" &&
      row !== null &&
      "name" in row
    ) {
      continue
    }

    // Process each item in the row
    for (const item of row as (KLEProperties | string)[]) {
      if (typeof item === "string") {
        // This is a key label - create a node
        const node = createNodeFromState(state, item)
        nodes.push(node)

        // Advance X by key width
        state.x += state.width

        // Reset width/height to defaults after each key
        state.width = 1
        state.height = 1
      } else if (typeof item === "object" && item !== null) {
        // This is a properties object - update state
        applyProperties(state, item)
      }
    }

    // At end of row, move to next row (only if no rotation is active)
    if (state.rotation === 0) {
      state.y += 1
      state.x = 0
    } else {
      // With rotation, move relative to rotation origin
      state.y = state.rotationOriginY
      state.x = state.rotationOriginX
    }
  }

  return nodes
}

/**
 * Apply KLE properties to parser state.
 */
function applyProperties(state: ParserState, props: KLEProperties): void {
  // Position offsets (cumulative)
  if (props.x !== undefined) state.x += props.x
  if (props.y !== undefined) state.y += props.y

  // Dimensions
  if (props.w !== undefined) state.width = props.w
  if (props.h !== undefined) state.height = props.h

  // Rotation - when r is set, rx/ry default to current position if not specified
  if (props.r !== undefined) {
    state.rotation = props.r
    if (props.rx === undefined && props.ry === undefined) {
      // Keep existing rotation origin
    }
  }

  // Rotation origin
  if (props.rx !== undefined) {
    state.rotationOriginX = props.rx
    state.x = props.rx // rx also sets current x position
  }
  if (props.ry !== undefined) {
    state.rotationOriginY = props.ry
    state.y = props.ry // ry also sets current y position
  }

  // Colors
  if (props.c !== undefined) state.color = props.c
  if (props.t !== undefined) state.textColor = props.t
}

/**
 * Create a ReactFlow node from the current parser state.
 */
function createNodeFromState(state: ParserState, label: string): Node {
  const widthU = state.width
  const heightU = state.height
  const rotation = state.rotation

  const actualWidth = widthU * UNIT_SIZE
  const actualHeight = heightU * UNIT_SIZE

  // Calculate position in pixels
  let posX = state.x * UNIT_SIZE
  let posY = state.y * UNIT_SIZE

  // If rotated, apply rotation transform around origin
  if (rotation !== 0) {
    const originXPx = state.rotationOriginX * UNIT_SIZE
    const originYPx = state.rotationOriginY * UNIT_SIZE

    const rotated = rotatePoint(posX, posY, originXPx, originYPx, rotation)
    posX = rotated.x
    posY = rotated.y

    // Adjust for bounding box offset (center the key in its bounding box)
    const bounds = getRotatedBoundingBox(actualWidth, actualHeight, rotation)
    posX -= (bounds.width - actualWidth) / 2
    posY -= (bounds.height - actualHeight) / 2
  }

  // Calculate bounding box dimensions
  const bounds =
    rotation !== 0
      ? getRotatedBoundingBox(actualWidth, actualHeight, rotation)
      : { width: actualWidth, height: actualHeight }

  // Parse the label - KLE uses \n for multiple legends
  const legends = label.split("\n").filter(l => l.trim() !== "")
  const primaryLabel = legends[0] || ""

  return {
    id: uuid(),
    type: "keyboardKey",
    position: { x: posX, y: posY },
    width: bounds.width,
    height: bounds.height,
    data: {
      label: primaryLabel,
      widthU,
      heightU,
      rotation: rotation !== 0 ? rotation : undefined,
      rotationOriginX: rotation !== 0 ? state.rotationOriginX : undefined,
      rotationOriginY: rotation !== 0 ? state.rotationOriginY : undefined,
      legend: legends.length > 1 ? legends : undefined,
      color: state.color !== "#ffffff" ? state.color : undefined,
      textColor: state.textColor !== "#000000" ? state.textColor : undefined,
    },
  }
}

/**
 * Parse raw KLE text and convert to ReactFlow nodes.
 * This is the main entry point for importing KLE data.
 */
export function importKLE(rawKleData: string): Node[] {
  const kleRows = parseKLERaw(rawKleData)
  return parseKLE(kleRows)
}
