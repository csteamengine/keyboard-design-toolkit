// KLE (Keyboard Layout Editor) Exporter
// Converts ReactFlow nodes to keyboard-layout-editor.com JSON format
// Reference: https://github.com/ijprest/keyboard-layout-editor/wiki/Serialized-Data-Format

import type { Node } from "@xyflow/react"
import type { KeyData, KLEProperties, KLERow } from "../types/KeyboardTypes"
import { UNIT_SIZE } from "../constants/editor"

/**
 * Format label for KLE with correct positioning.
 * KLE uses newlines to position labels in a 3x4 grid (12 positions).
 * Position 4 (center-center) requires 4 newlines before the label.
 */
function formatLabel(label: string, position: number = 4): string {
  // Position 4 = center-center (5th position, 0-indexed as 4)
  // Requires 4 newlines before the text
  const newlines = "\n".repeat(position)
  return newlines + label
}

/**
 * Export ReactFlow nodes to KLE JSON format.
 *
 * KLE position tracking rules:
 * - After each key: x += key.width
 * - At new row: y += 1, x resets to rx (or 0 if no rotation)
 * - x/y properties are OFFSETS from expected position
 * - r/rx/ry can only appear on first key of a row
 * - y offset only needs to be specified once per row (first key)
 */
export function exportToKLE(nodes: Node[]): KLERow[] {
  if (nodes.length === 0) return []

  // Sort nodes by Y position (row), then X position
  // Keep rotated and non-rotated keys separate (non-rotated first)
  const sortedNodes = [...nodes].sort((a, b) => {
    const aData = a.data as KeyData
    const bData = b.data as KeyData
    const aRotation = aData.rotation ?? 0
    const bRotation = bData.rotation ?? 0

    // Non-rotated keys come first
    if (aRotation === 0 && bRotation !== 0) return -1
    if (aRotation !== 0 && bRotation === 0) return 1

    // Then by Y position (with tolerance for row grouping)
    const yDiff = a.position.y - b.position.y
    if (Math.abs(yDiff) > UNIT_SIZE * 0.4) return yDiff

    // Then by X position
    return a.position.x - b.position.x
  })

  const rows: KLERow[] = []
  let currentRow: (KLEProperties | string)[] = []

  // KLE tracking state
  let cluster = {
    r: 0,    // current rotation angle
    rx: 0,   // rotation origin x
    ry: 0,   // rotation origin y
  }
  let current = {
    x: 0,       // expected x position for next key
    y: 0,       // expected y position for next row (increments by 1 from actual)
    rowY: 0,    // actual Y of current row (for within-row comparison)
    a: 0,       // alignment (0 = top-left default)
    c: "#cccccc",
    t: "#000000",
  }
  let isFirstKey = true
  let isFirstInRow = true

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i]
    const data = node.data as KeyData
    const keyX = node.position.x / UNIT_SIZE
    const keyY = node.position.y / UNIT_SIZE
    const keyW = data.widthU ?? 1
    const keyH = data.heightU ?? 1
    const keyR = data.rotation ?? 0

    // First key - initialize row tracking
    if (isFirstKey) {
      current.rowY = keyY
      current.y = keyY  // Expected y starts at first key's actual position
    }

    // Determine if we need a new row
    const rotationChanged = keyR !== cluster.r
    // New row if Y changed significantly from current row's Y
    const rowChanged = !isFirstKey && !rotationChanged && Math.abs(keyY - current.rowY) >= 0.4

    if (!isFirstKey && (rotationChanged || rowChanged)) {
      // Push current row
      if (currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = []
      }
      isFirstInRow = true

      if (rotationChanged) {
        cluster.r = keyR
        if (keyR !== 0) {
          cluster.rx = keyX
          cluster.ry = keyY
        } else {
          cluster.rx = 0
          cluster.ry = 0
        }
        current.x = cluster.rx
        current.y = cluster.ry
        current.rowY = keyY
      } else {
        // Normal row change - expected y is previous actual y + 1
        current.y = current.rowY + 1
        current.x = cluster.rx
        current.rowY = keyY
      }
    }

    // Build properties object
    const props: KLEProperties = {}

    // Alignment - set to 7 (center) on first key if not already set
    if (isFirstKey && current.a !== 7) {
      props.a = 7
      current.a = 7
    }

    // Rotation (only on first key of row)
    if (isFirstInRow && cluster.r !== 0) {
      props.r = cluster.r
      props.rx = round(cluster.rx)
      props.ry = round(cluster.ry)
    }

    // Y offset - only on first key of row
    if (isFirstInRow) {
      const yOffset = keyY - current.y
      if (Math.abs(yOffset) > 0.001) {
        props.y = round(yOffset)
      }
    }

    // X offset from expected position
    const xOffset = keyX - current.x
    if (Math.abs(xOffset) > 0.001) {
      props.x = round(xOffset)
    }

    // Width (if not default 1)
    if (Math.abs(keyW - 1) > 0.001) {
      props.w = keyW
    }

    // Height (if not default 1)
    if (Math.abs(keyH - 1) > 0.001) {
      props.h = keyH
    }

    // Color (if changed from default)
    const color = data.color ?? "#cccccc"
    if (color.toLowerCase() !== current.c.toLowerCase()) {
      props.c = color
      current.c = color
    }

    // Text color (if changed from default)
    const textColor = data.textColor ?? "#000000"
    if (textColor.toLowerCase() !== current.t.toLowerCase()) {
      props.t = textColor
      current.t = textColor
    }

    // Add properties if any
    if (Object.keys(props).length > 0) {
      currentRow.push(props)
    }

    // Add label (formatted with newlines for center position)
    const rawLabel = data.label ?? ""
    const label = formatLabel(rawLabel, 4)
    currentRow.push(label)

    // Advance x position by key width
    current.x = keyX + keyW
    isFirstKey = false
    isFirstInRow = false
  }

  // Push final row
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

/**
 * Round a number to avoid floating point precision issues.
 */
function round(num: number, precision: number = 4): number {
  const factor = Math.pow(10, precision)
  return Math.round(num * factor) / factor
}

/**
 * Serialize a properties object with unquoted keys (KLE raw format style).
 */
function serializeProps(props: KLEProperties): string {
  const parts = Object.entries(props).map(([key, value]) => {
    if (typeof value === "string") {
      return `${key}:${JSON.stringify(value)}`
    }
    return `${key}:${value}`
  })
  return `{${parts.join(",")}}`
}

/**
 * Serialize KLE data to a string.
 * This outputs KLE raw format with unquoted keys.
 */
export function serializeKLE(kleData: KLERow[]): string {
  const lines = kleData.map(row => {
    const items = row.map(item => {
      if (typeof item === "string") {
        return JSON.stringify(item)
      } else {
        return serializeProps(item)
      }
    })
    return `[${items.join(",")}]`
  })

  return lines.join(",\n")
}

/**
 * Export nodes to KLE format string.
 * This is the main entry point for exporting.
 */
export function exportKLE(nodes: Node[]): string {
  const kleData = exportToKLE(nodes)
  return serializeKLE(kleData)
}
