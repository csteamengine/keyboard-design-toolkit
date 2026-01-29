import {
  NodeProps,
  NodeResizer,
  useUpdateNodeInternals,
  useReactFlow,
  useStore,
  type ResizeParams,
} from "@xyflow/react"
import { memo, useCallback, useRef, useContext } from "react"
import { Box, Typography } from "@mui/material"
import { UNIT_SIZE, SNAP_SIZE, ROTATION_STEP } from "../../constants/editor"
import {
  getRotatedBoundingBox,
  getRotatedCorners,
  getPositionAdjustmentForRotation,
} from "../../utils/rotation"
import { HistoryContext } from "../../context/HistoryContext"

type KeyData = {
  label: string
  widthU: number
  heightU: number
  rotation?: number
  color?: string
  textColor?: string
}

// Selector to count selected nodes
const selectedCountSelector = (state: { nodes: { selected?: boolean }[] }) =>
  state.nodes.filter((n) => n.selected).length

function KeyboardKey({ id, data, selected }: NodeProps) {
  const selectedCount = useStore(selectedCountSelector)
  const updateNodeInternals = useUpdateNodeInternals()
  const { setNodes, getNodes } = useReactFlow()
  const { recordHistory, scheduleSave } = useContext(HistoryContext)
  const keyData = data as KeyData
  const rotation = keyData.rotation ?? 0
  const actualWidth = (keyData.widthU ?? 1) * UNIT_SIZE
  const actualHeight = (keyData.heightU ?? 1) * UNIT_SIZE

  const containerRef = useRef<HTMLDivElement>(null)
  const rotationStateRef = useRef<{
    isRotating: boolean
    startAngle: number
    startRotation: number
  }>({ isRotating: false, startAngle: 0, startRotation: 0 })

  // Record history when resize starts
  const handleResizeStart = useCallback(() => {
    recordHistory()
  }, [recordHistory])

  // Live resize handler - updates as user drags with 0.25u snapping
  const handleResize = useCallback(
    (_: unknown, params: ResizeParams) => {
      const snapToQuarter = (val: number) => Math.round(val * 4) / 4

      let newWidthU: number
      let newHeightU: number

      if (rotation !== 0) {
        // For rotated keys, scale uniformly based on the resize
        const currentBbox = getRotatedBoundingBox(actualWidth, actualHeight, rotation)
        const scaleX = params.width / currentBbox.width
        const scaleY = params.height / currentBbox.height
        const scale = Math.min(scaleX, scaleY)

        newWidthU = snapToQuarter((actualWidth * scale) / UNIT_SIZE)
        newHeightU = snapToQuarter((actualHeight * scale) / UNIT_SIZE)
      } else {
        newWidthU = snapToQuarter(params.width / UNIT_SIZE)
        newHeightU = snapToQuarter(params.height / UNIT_SIZE)
      }

      newWidthU = Math.max(1, newWidthU)
      newHeightU = Math.max(1, newHeightU)

      const newActualWidth = newWidthU * UNIT_SIZE
      const newActualHeight = newHeightU * UNIT_SIZE

      const newBounds =
        rotation !== 0
          ? getRotatedBoundingBox(newActualWidth, newActualHeight, rotation)
          : { width: newActualWidth, height: newActualHeight }

      setNodes(nodes =>
        nodes.map(n => {
          if (n.id !== id) return n
          return {
            ...n,
            width: newBounds.width,
            height: newBounds.height,
            data: {
              ...n.data,
              widthU: newWidthU,
              heightU: newHeightU,
            },
          }
        })
      )
    },
    [id, setNodes, rotation, actualWidth, actualHeight]
  )

  // Resize end handler - finalize and update internals
  const handleResizeEnd = useCallback(
    () => {
      updateNodeInternals(id)
      scheduleSave()
    },
    [id, updateNodeInternals, scheduleSave]
  )

  const handleRotationStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!containerRef.current) return

      // Record history for undo/redo
      recordHistory()

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

      // Store rotation state in ref (synchronous)
      rotationStateRef.current = {
        isRotating: true,
        startAngle: angle,
        startRotation: rotation,
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!rotationStateRef.current.isRotating || !containerRef.current) return

        const moveRect = containerRef.current.getBoundingClientRect()
        const moveCenterX = moveRect.left + moveRect.width / 2
        const moveCenterY = moveRect.top + moveRect.height / 2

        const currentAngle = Math.atan2(moveEvent.clientY - moveCenterY, moveEvent.clientX - moveCenterX) * (180 / Math.PI)
        const deltaAngle = currentAngle - rotationStateRef.current.startAngle

        let newRotation = rotationStateRef.current.startRotation + deltaAngle

        // Normalize to 0-360
        newRotation = ((newRotation % 360) + 360) % 360

        // Snap to ROTATION_STEP (15 degrees)
        newRotation = Math.round(newRotation / ROTATION_STEP) * ROTATION_STEP

        // Normalize again after snapping
        if (newRotation >= 360) newRotation = 0

        const currentNode = getNodes().find(n => n.id === id)
        if (!currentNode) return

        const oldRotation = (currentNode.data as KeyData).rotation ?? 0
        if (newRotation === oldRotation) return

        const adjustment = getPositionAdjustmentForRotation(
          actualWidth,
          actualHeight,
          oldRotation,
          newRotation
        )

        const newBounds = getRotatedBoundingBox(actualWidth, actualHeight, newRotation)

        setNodes(nodes =>
          nodes.map(n => {
            if (n.id !== id) return n
            return {
              ...n,
              width: newBounds.width,
              height: newBounds.height,
              position: {
                x: n.position.x + adjustment.dx,
                y: n.position.y + adjustment.dy,
              },
              data: {
                ...n.data,
                rotation: newRotation === 0 ? undefined : newRotation,
              },
            }
          })
        )

        updateNodeInternals(id)
      }

      const handleMouseUp = () => {
        rotationStateRef.current.isRotating = false
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
        scheduleSave()
      }

      // Add listeners immediately (synchronously)
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [rotation, id, setNodes, getNodes, updateNodeInternals, actualWidth, actualHeight, recordHistory, scheduleSave]
  )

  // Calculate bounding box for positioning custom selection
  const boundingBox = getRotatedBoundingBox(actualWidth, actualHeight, rotation)

  // Calculate rotated corners for the selection outline (relative to bounding box center)
  const corners = getRotatedCorners(
    boundingBox.width / 2,
    boundingBox.height / 2,
    actualWidth,
    actualHeight,
    rotation
  )

  // Rotation handle position - offset from top-right corner
  const handleOffset = 12
  const rotationHandleX = corners.topRight.x + handleOffset * Math.cos(((rotation - 45) * Math.PI) / 180)
  const rotationHandleY = corners.topRight.y + handleOffset * Math.sin(((rotation - 45) * Math.PI) / 180)

  // Default dark keycap color
  const keyColor = keyData.color ?? "#27272a"
  const textColor = keyData.textColor ?? "#a1a1aa"

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* NodeResizer - only for non-rotated keys (rotated keys use custom selection) */}
      {rotation === 0 && (
        <NodeResizer
          color="#6366f1"
          isVisible={selected}
          minWidth={SNAP_SIZE}
          minHeight={SNAP_SIZE}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          handleStyle={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#18181b",
            border: "1.5px solid #6366f1",
          }}
          lineStyle={{
            borderWidth: 1,
            borderColor: "#6366f1",
          }}
        />
      )}

      {/* Custom rotated selection for rotated keys */}
      {rotation !== 0 && selected && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {/* Selection outline following rotated shape */}
          <polygon
            points={`${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1"
          />
          {/* Corner handles */}
          {[corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft].map(
            (corner, i) => (
              <circle
                key={i}
                cx={corner.x}
                cy={corner.y}
                r="3"
                fill="#6366f1"
              />
            )
          )}
        </svg>
      )}

      {/* Rotation handle - small refined dot (only for single selection) */}
      {selected && selectedCount === 1 && (
        <div
          className="nodrag nopan"
          data-rotation-handle={id}
          style={{
            position: "absolute",
            left: rotationHandleX - 4,
            top: rotationHandleY - 4,
            width: 8,
            height: 8,
            cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3C/svg%3E") 12 12, grab`,
            zIndex: 1000,
            borderRadius: "50%",
            backgroundColor: "#18181b",
            border: "1.5px solid #6366f1",
            boxShadow: "0 0 8px rgba(99, 102, 241, 0.4)",
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            handleRotationStart(e)
          }}
        />
      )}

      {/* The actual key visual */}
      <Box
        sx={{
          width: `${actualWidth}px`,
          height: `${actualHeight}px`,
          minWidth: `${actualWidth}px`,
          minHeight: `${actualHeight}px`,
          flexShrink: 0,
          transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: "center center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: keyColor,
          borderRadius: "6px",
          border: "1px solid",
          borderColor: selected ? "#6366f1" : "#3f3f46",
          boxShadow: selected
            ? `
              0 0 12px rgba(99, 102, 241, 0.4),
              0 2px 4px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2)
            `
            : `
              0 2px 4px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2)
            `,
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            borderColor: selected ? "#6366f1" : "#52525b",
            boxShadow: selected
              ? `
                0 0 16px rgba(99, 102, 241, 0.5),
                0 4px 8px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05),
                inset 0 -2px 0 rgba(0, 0, 0, 0.2)
              `
              : `
                0 4px 8px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05),
                inset 0 -2px 0 rgba(0, 0, 0, 0.2)
              `,
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            userSelect: "none",
            fontWeight: 500,
            fontSize: actualWidth < 50 ? "0.65rem" : "0.75rem",
            color: textColor,
            textAlign: "center",
            lineHeight: 1.2,
            padding: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {String(keyData.label ?? "")}
        </Typography>
      </Box>
    </Box>
  )
}

export default memo(KeyboardKey)
