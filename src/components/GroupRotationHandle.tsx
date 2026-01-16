import { useRef, useContext, useState } from "react"
import { Node, useReactFlow, useStore } from "@xyflow/react"
import { ROTATION_STEP, UNIT_SIZE } from "../constants/editor"
import {
  getRotatedBoundingBox,
  rotatePoint,
} from "../utils/rotation"
import { HistoryContext } from "../context/HistoryContext"

type KeyData = {
  widthU?: number
  heightU?: number
  rotation?: number
}


type StoreState = {
  nodes: Node[]
  transform: [number, number, number] // [x, y, zoom]
}

// Get selected nodes and viewport transform from ReactFlow store
const selector = (state: StoreState) => ({
  selectedNodes: state.nodes.filter((n) => n.selected),
  transform: state.transform,
})

export default function GroupRotationHandle() {
  const { setNodes, getNodes } = useReactFlow()
  const { selectedNodes, transform } = useStore(selector)
  const [viewportX, viewportY, zoom] = transform
  const { recordHistory, scheduleSave } = useContext(HistoryContext)
  const handleRef = useRef<HTMLDivElement>(null)

  // Track current rotation delta for smooth handle positioning during drag
  const [rotationDelta, setRotationDelta] = useState(0)
  const [isRotating, setIsRotating] = useState(false)

  const rotationStateRef = useRef<{
    isRotating: boolean
    startAngle: number
    initialPositions: Map<string, { x: number; y: number; rotation: number }>
    centerX: number
    centerY: number
    centerScreenX: number
    centerScreenY: number
    handleOffsetFromCenterX: number
    handleOffsetFromCenterY: number
  }>({
    isRotating: false,
    startAngle: 0,
    initialPositions: new Map(),
    centerX: 0,
    centerY: 0,
    centerScreenX: 0,
    centerScreenY: 0,
    handleOffsetFromCenterX: 0,
    handleOffsetFromCenterY: 0,
  })

  // Only show for multi-selection
  if (selectedNodes.length <= 1) {
    return null
  }

  // Calculate center based on node positions
  // Use the center of all node centers for a stable rotation point
  let sumX = 0
  let sumY = 0
  const nodeCenters: { x: number; y: number }[] = []

  for (const node of selectedNodes) {
    const data = node.data as KeyData
    const actualWidth = (data.widthU ?? 1) * UNIT_SIZE
    const actualHeight = (data.heightU ?? 1) * UNIT_SIZE
    const rotation = data.rotation ?? 0
    const bbox = getRotatedBoundingBox(actualWidth, actualHeight, rotation)
    const nodeCenterX = node.position.x + bbox.width / 2
    const nodeCenterY = node.position.y + bbox.height / 2
    sumX += nodeCenterX
    sumY += nodeCenterY
    nodeCenters.push({ x: nodeCenterX, y: nodeCenterY })
  }
  const centerX = sumX / selectedNodes.length
  const centerY = sumY / selectedNodes.length

  // Calculate handle distance based on max distance from center to any node center
  // This is stable because as nodes rotate around center, their distance to center stays constant
  let maxDistFromCenter = 0
  for (const nc of nodeCenters) {
    const dist = Math.sqrt((nc.x - centerX) ** 2 + (nc.y - centerY) ** 2)
    maxDistFromCenter = Math.max(maxDistFromCenter, dist)
  }
  // Add padding for key size and handle offset
  const handleDistance = maxDistFromCenter + 60

  // Handle position: fixed angle (up-right at 45 degrees) from center
  const handleAngle = -Math.PI / 4 // -45 degrees (up and right)
  const handleFlowX = centerX + handleDistance * Math.cos(handleAngle)
  const handleFlowY = centerY + handleDistance * Math.sin(handleAngle)

  const handleRotationStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!handleRef.current) return

    // Record history for undo/redo
    recordHistory()

    // Get handle's screen position from DOM (reliable window coordinates)
    const handleRect = handleRef.current.getBoundingClientRect()
    const handleScreenCenterX = handleRect.left + handleRect.width / 2
    const handleScreenCenterY = handleRect.top + handleRect.height / 2

    // Calculate center screen position by going back from handle position
    // Handle is at (centerX + offsetX, centerY + offsetY) in flow coords
    // So center screen = handle screen - offset * zoom
    const offsetX = handleFlowX - centerX
    const offsetY = handleFlowY - centerY
    const centerScreenX = handleScreenCenterX - offsetX * zoom
    const centerScreenY = handleScreenCenterY - offsetY * zoom

    const angle = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX) * (180 / Math.PI)

    // Store initial positions and rotations of all selected nodes
    const initialPositions = new Map<string, { x: number; y: number; rotation: number }>()
    const currentNodes = getNodes()

    for (const node of selectedNodes) {
      const currentNode = currentNodes.find((n) => n.id === node.id)
      if (currentNode) {
        const data = currentNode.data as KeyData
        initialPositions.set(node.id, {
          x: currentNode.position.x,
          y: currentNode.position.y,
          rotation: data.rotation ?? 0,
        })
      }
    }

    rotationStateRef.current = {
      isRotating: true,
      startAngle: angle,
      initialPositions,
      centerX, // Store flow coordinates for rotation
      centerY,
      centerScreenX, // Store screen coordinates for consistent angle calculation
      centerScreenY,
      handleOffsetFromCenterX: offsetX,
      handleOffsetFromCenterY: offsetY,
    }

    setIsRotating(true)
    setRotationDelta(0)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!rotationStateRef.current.isRotating) return

      const { startAngle, initialPositions, centerX: cx, centerY: cy, centerScreenX: csx, centerScreenY: csy } = rotationStateRef.current

      // Use stored screen coordinates for consistent angle calculation
      const currentAngle = Math.atan2(
        moveEvent.clientY - csy,
        moveEvent.clientX - csx
      ) * (180 / Math.PI)

      let deltaAngle = currentAngle - startAngle

      // Normalize to [-180, 180] to handle atan2 discontinuity at ±180°
      // This prevents jumps when dragging across the discontinuity boundary
      while (deltaAngle > 180) deltaAngle -= 360
      while (deltaAngle < -180) deltaAngle += 360

      // Snap to rotation step
      deltaAngle = Math.round(deltaAngle / ROTATION_STEP) * ROTATION_STEP

      // Update rotation delta state for handle positioning
      setRotationDelta(deltaAngle)

      if (deltaAngle === 0) return

      setNodes((nodes) =>
        nodes.map((n) => {
          const initial = initialPositions.get(n.id)
          if (!initial) return n

          const data = n.data as KeyData
          const actualWidth = (data.widthU ?? 1) * UNIT_SIZE
          const actualHeight = (data.heightU ?? 1) * UNIT_SIZE

          // Calculate node center in flow coordinates
          const oldBounds = getRotatedBoundingBox(actualWidth, actualHeight, initial.rotation)
          const nodeCenterX = initial.x + oldBounds.width / 2
          const nodeCenterY = initial.y + oldBounds.height / 2

          // Rotate the node center around the group center (in flow coordinates)
          const rotatedCenter = rotatePoint(nodeCenterX, nodeCenterY, cx, cy, deltaAngle)

          // Calculate new rotation for the node
          let newRotation = initial.rotation + deltaAngle
          newRotation = ((newRotation % 360) + 360) % 360
          if (newRotation >= 360) newRotation = 0

          // Calculate new bounding box
          const newBounds = getRotatedBoundingBox(actualWidth, actualHeight, newRotation)

          // New position is rotated center minus half the new bounding box
          const newX = rotatedCenter.x - newBounds.width / 2
          const newY = rotatedCenter.y - newBounds.height / 2

          return {
            ...n,
            position: { x: newX, y: newY },
            width: newBounds.width,
            height: newBounds.height,
            data: {
              ...n.data,
              rotation: newRotation === 0 ? undefined : newRotation,
            },
          }
        })
      )
    }

    const handleMouseUp = () => {
      rotationStateRef.current.isRotating = false
      setIsRotating(false)
      setRotationDelta(0)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      scheduleSave()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  // Calculate handle position in flow coordinates
  // During rotation, orbit the handle around the center
  let finalHandleFlowX = handleFlowX
  let finalHandleFlowY = handleFlowY

  if (isRotating && rotationDelta !== 0) {
    const { centerX: cx, centerY: cy, handleOffsetFromCenterX, handleOffsetFromCenterY } = rotationStateRef.current
    // Rotate the initial handle offset by the current delta angle
    const rotatedHandle = rotatePoint(
      cx + handleOffsetFromCenterX,
      cy + handleOffsetFromCenterY,
      cx,
      cy,
      rotationDelta
    )
    finalHandleFlowX = rotatedHandle.x
    finalHandleFlowY = rotatedHandle.y
  }

  // Convert handle position to screen coordinates for rendering
  const handleScreenX = finalHandleFlowX * zoom + viewportX
  const handleScreenY = finalHandleFlowY * zoom + viewportY

  // Render handle at screen coordinates (not affected by zoom scaling)
  // Use a rotation cursor - we'll use a custom SVG data URL for a rotate cursor
  const rotateCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3C/svg%3E") 12 12, grab`

  return (
    <div
      ref={handleRef}
      className="nodrag nopan"
      style={{
        position: "absolute",
        left: handleScreenX - 6,
        top: handleScreenY - 6,
        width: 12,
        height: 12,
        cursor: rotateCursor,
        zIndex: 1000,
        borderRadius: "50%",
        backgroundColor: "white",
        border: "1.5px solid var(--color-primary, #4f46e5)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        pointerEvents: "auto",
      }}
      onMouseDown={handleRotationStart}
    />
  )
}
