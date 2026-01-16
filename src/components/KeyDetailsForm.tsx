import {
  Box,
  Typography,
  TextField,
  Slider,
  InputAdornment,
  Stack,
  Collapse,
  Alert,
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { useReactFlow, useStore, type Node } from "@xyflow/react"
import { useCallback, useEffect, useState } from "react"
import {
  UNIT_SIZE,
  ROTATION_MIN,
  ROTATION_MAX,
  ROTATION_STEP,
} from "../constants/editor"
import {
  getRotatedBoundingBox,
  getPositionAdjustmentForRotation,
  getRotatedCorners,
  rotatePoint,
} from "../utils/rotation"

export default function KeyDetailsForm() {
  const nodes = useStore(state => state.nodes)
  const { getNodes, setNodes } = useReactFlow()

  const currentNodes = getNodes().filter(n => n.selected)
  const [firstNode, setFirstNode] = useState<Node | null>(
    currentNodes[0] ?? null
  )
  const [height, setHeight] = useState<number>(
    (firstNode?.data?.heightU as number | undefined) ?? 1
  )
  const [width, setWidth] = useState<number>(
    (firstNode?.data?.widthU as number | undefined) ?? 1
  )
  const [rotation, setRotation] = useState<number>(
    (firstNode?.data?.rotation as number | undefined) ?? 0
  )

  useEffect(() => {
    const selected = nodes.filter((n: Node) => n.selected)
    const realNode = getNodes().find(n => n.id === selected[0]?.id)

    setFirstNode(realNode ?? null)
    if (realNode) {
      const h = (realNode.data?.heightU as number | undefined) ?? (realNode.height ?? UNIT_SIZE) / UNIT_SIZE
      const w = (realNode.data?.widthU as number | undefined) ?? (realNode.width ?? UNIT_SIZE) / UNIT_SIZE
      const r = (realNode.data?.rotation as number | undefined) ?? 0
      setHeight(h)
      setWidth(w)
      setRotation(r)
    }
  }, [nodes, getNodes])

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const label = e.target.value
      setNodes(nodes =>
        nodes.map(n =>
          currentNodes.some(s => s.id === n.id)
            ? { ...n, data: { ...n.data, label } }
            : n
        )
      )
    },
    [currentNodes, setNodes]
  )

  const handleRotationChange = useCallback(
    (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
      const newRotation = typeof newValue === "number" ? newValue : newValue[0]
      setRotation(newRotation)

      // For multiple selections, rotate around collective center
      if (currentNodes.length > 1) {
        // Calculate collective center by finding bounding box of all selected nodes
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

        for (const node of currentNodes) {
          const widthU = (node.data?.widthU as number) ?? 1
          const heightU = (node.data?.heightU as number) ?? 1
          const nodeRotation = (node.data?.rotation as number) ?? 0
          const actualWidth = widthU * UNIT_SIZE
          const actualHeight = heightU * UNIT_SIZE

          const bbox = getRotatedBoundingBox(actualWidth, actualHeight, nodeRotation)
          const nodeCenterX = node.position.x + bbox.width / 2
          const nodeCenterY = node.position.y + bbox.height / 2

          const corners = getRotatedCorners(nodeCenterX, nodeCenterY, actualWidth, actualHeight, nodeRotation)
          for (const corner of [corners.topLeft, corners.topRight, corners.bottomLeft, corners.bottomRight]) {
            minX = Math.min(minX, corner.x)
            minY = Math.min(minY, corner.y)
            maxX = Math.max(maxX, corner.x)
            maxY = Math.max(maxY, corner.y)
          }
        }

        const groupCenterX = (minX + maxX) / 2
        const groupCenterY = (minY + maxY) / 2

        // Calculate delta rotation from current first node rotation
        const firstNodeRotation = (currentNodes[0].data?.rotation as number) ?? 0
        const deltaRotation = newRotation - firstNodeRotation

        setNodes(nodes =>
          nodes.map(n => {
            if (!currentNodes.some(s => s.id === n.id)) return n

            const widthU = (n.data?.widthU as number) ?? 1
            const heightU = (n.data?.heightU as number) ?? 1
            const currentRotation = (n.data?.rotation as number) ?? 0

            const actualWidth = widthU * UNIT_SIZE
            const actualHeight = heightU * UNIT_SIZE

            // Calculate current node center
            const oldBounds = getRotatedBoundingBox(actualWidth, actualHeight, currentRotation)
            const nodeCenterX = n.position.x + oldBounds.width / 2
            const nodeCenterY = n.position.y + oldBounds.height / 2

            // Rotate the node center around the group center
            const rotatedCenter = rotatePoint(nodeCenterX, nodeCenterY, groupCenterX, groupCenterY, deltaRotation)

            // Calculate new rotation for this node
            let nodeNewRotation = currentRotation + deltaRotation
            nodeNewRotation = ((nodeNewRotation % 360) + 360) % 360
            if (nodeNewRotation >= 360) nodeNewRotation = 0

            // Calculate new bounding box
            const newBounds = getRotatedBoundingBox(actualWidth, actualHeight, nodeNewRotation)

            // New position is rotated center minus half the new bounding box
            const newX = rotatedCenter.x - newBounds.width / 2
            const newY = rotatedCenter.y - newBounds.height / 2

            return {
              ...n,
              width: newBounds.width,
              height: newBounds.height,
              position: { x: newX, y: newY },
              data: {
                ...n.data,
                rotation: nodeNewRotation === 0 ? undefined : nodeNewRotation,
              },
            }
          })
        )
      } else {
        // Single selection - rotate around its own center
        setNodes(nodes =>
          nodes.map(n => {
            if (!currentNodes.some(s => s.id === n.id)) return n

            const widthU = (n.data?.widthU as number) ?? 1
            const heightU = (n.data?.heightU as number) ?? 1
            const currentRotation = (n.data?.rotation as number) ?? 0

            const actualWidth = widthU * UNIT_SIZE
            const actualHeight = heightU * UNIT_SIZE

            // Calculate new bounding box
            const newBounds = getRotatedBoundingBox(
              actualWidth,
              actualHeight,
              newRotation
            )

            // Calculate position adjustment to keep center stable
            const adjustment = getPositionAdjustmentForRotation(
              actualWidth,
              actualHeight,
              currentRotation,
              newRotation
            )

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
      }
    },
    [currentNodes, setNodes]
  )

  const handleHeightChange = useCallback(
    (value: number) => {
      if (isNaN(value) || value < 1) return
      setHeight(value)

      setNodes(nodes =>
        nodes.map(n => {
          if (!currentNodes.some(s => s.id === n.id)) return n

          const rotation = (n.data?.rotation as number) ?? 0
          const widthU = (n.data?.widthU as number) ?? 1
          const actualWidth = widthU * UNIT_SIZE
          const actualHeight = value * UNIT_SIZE

          // Recalculate bounding box if rotated
          const bounds =
            rotation !== 0
              ? getRotatedBoundingBox(actualWidth, actualHeight, rotation)
              : { width: actualWidth, height: actualHeight }

          return {
            ...n,
            width: bounds.width,
            height: bounds.height,
            data: {
              ...n.data,
              heightU: value,
            },
          }
        })
      )
    },
    [currentNodes, setNodes]
  )

  const handleWidthChange = useCallback(
    (value: number) => {
      if (isNaN(value) || value < 1) return
      setWidth(value)

      setNodes(nodes =>
        nodes.map(n => {
          if (!currentNodes.some(s => s.id === n.id)) return n

          const rotation = (n.data?.rotation as number) ?? 0
          const heightU = (n.data?.heightU as number) ?? 1
          const actualWidth = value * UNIT_SIZE
          const actualHeight = heightU * UNIT_SIZE

          // Recalculate bounding box if rotated
          const bounds =
            rotation !== 0
              ? getRotatedBoundingBox(actualWidth, actualHeight, rotation)
              : { width: actualWidth, height: actualHeight }

          return {
            ...n,
            width: bounds.width,
            height: bounds.height,
            data: {
              ...n.data,
              widthU: value,
            },
          }
        })
      )
    },
    [currentNodes, setNodes]
  )

  if (!firstNode) {
    return (
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Select a key to edit its properties.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <TextField
        label="Label"
        fullWidth
        margin="normal"
        size="small"
        value={firstNode.data?.label ?? ""}
        onChange={handleLabelChange}
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
          Rotation
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ flexGrow: 1 }}>
            <Slider
              value={rotation}
              onChange={handleRotationChange}
              min={ROTATION_MIN}
              max={ROTATION_MAX}
              step={ROTATION_STEP}
              valueLabelDisplay="auto"
              valueLabelFormat={v => `${v}°`}
              marks={[
                { value: 0, label: "0°" },
                { value: 90, label: "90°" },
                { value: 180, label: "180°" },
                { value: 270, label: "270°" },
              ]}
            />
          </Box>
          <Box sx={{ width: 80 }}>
            <TextField
              type="number"
              size="small"
              value={rotation}
              onChange={e => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val)) {
                  const clamped = Math.min(
                    ROTATION_MAX,
                    Math.max(ROTATION_MIN, val)
                  )
                  handleRotationChange(e, clamped)
                }
              }}
              inputProps={{
                min: ROTATION_MIN,
                max: ROTATION_MAX,
                step: ROTATION_STEP,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">°</InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <TextField
          label="Width"
          type="number"
          size="small"
          inputProps={{ step: 0.25, min: 1 }}
          value={width}
          onChange={e => handleWidthChange(parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">U</InputAdornment>,
          }}
          fullWidth
        />
        <TextField
          label="Height"
          type="number"
          size="small"
          inputProps={{ step: 0.25, min: 1 }}
          value={height}
          onChange={e => handleHeightChange(parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">U</InputAdornment>,
          }}
          fullWidth
        />
      </Stack>

      {/* Tip for rotated keys */}
      <Collapse in={rotation !== 0}>
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="small" />}
          sx={{
            mt: 2,
            py: 0.5,
            '& .MuiAlert-message': {
              fontSize: '0.75rem',
            }
          }}
        >
          Drag-to-resize is not available for rotated keys. Use the width/height fields above, or rotate to 0° to use resize handles.
        </Alert>
      </Collapse>
    </Box>
  )
}
