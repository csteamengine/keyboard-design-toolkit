import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
} from "@mui/material"
import {
  useEdgesState,
  useNodes,
  useNodesState,
  useReactFlow,
  useStore,
} from "@xyflow/react"
import { useCallback, useEffect, useState } from "react"

export default function KeyDetailsForm({ selectedNodes, updateNodes }) {
  // const [selection, _] = useSelection()
  const nodes = useStore(state => state.nodes)
  const { getNodes } = useReactFlow()

  const [firstNode, setFirstNode] = useState(
    selectedNodes ? (selectedNodes[0] ?? null) : null,
  )
  const [height, setHeight] = useState(firstNode?.data.heightU ?? 1)
  const [width, setWidth] = useState(firstNode?.data.widthU ?? 1)
  const [rotation, setRotation] = useState(firstNode?.data.rotation ?? 0)

  useEffect(() => {
    const selected = nodes.filter((n: Node) => n.selected)

    const realNode = getNodes().find(n => n.id === selected[0]?.id)

    setFirstNode(realNode)
    setHeight(realNode?.height / 60)
    setWidth(realNode?.width / 60)
    setRotation(realNode?.data.rotation ?? 0)
  }, [nodes])

  const handleLabelChange = e => {
    const label = e.target.value
    updateNodes(nodes =>
      nodes.map(n =>
        selectedNodes.some(s => s.id === n.id)
          ? { ...n, data: { ...n.data, label } }
          : n,
      ),
    )
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRotationChange = useCallback(
    (_, newValue) => {
      updateNodes(nodes =>
        nodes.map(n =>
          selectedNodes.some(s => s.id === n.id)
            ? {
                ...n,
                data: { ...n.data, rotation: newValue },
              }
            : n,
        ),
      )
    },
    [selectedNodes, updateNodes],
  )

  const handleHeightChange = useCallback(
    (value: number) => {
      setHeight(value)
      updateNodes(nodes => {
        const toReturn = nodes.map(n =>
          selectedNodes.some(s => s.id === n.id)
            ? {
                ...n,
                height: value * 60, // Convert U to pixels
                data: {
                  ...n.data,
                  heightU: value, // Convert U to pixels
                },
              }
            : n,
        )
        return toReturn
      })
    },
    [selectedNodes, updateNodes],
  )

  const handleWidthChange = useCallback(
    (value: number) => {
      updateNodes(nodes => {
        const toReturn = nodes.map(n =>
          selectedNodes.some(s => s.id === n.id)
            ? {
                ...n,
                width: value * 60, // Convert U to pixels
                data: {
                  ...n.data,
                  widthU: value, // Convert U to pixels
                },
              }
            : n,
        )

        return toReturn
      })

      setWidth(value)
    },
    [selectedNodes, updateNodes],
  )

  if (!firstNode) {
    return (
      <Box mt={2}>
        <Typography variant="body1" color="textSecondary">
          Select a key to edit its details.
        </Typography>
      </Box>
    )
  }

  return (
    <Box mt={2}>
      <TextField
        label="Label"
        fullWidth
        margin="normal"
        value={firstNode.data.label}
        onChange={handleLabelChange}
      />

      <Typography gutterBottom>Rotation</Typography>
      <Slider
        value={rotation}
        onChange={handleRotationChange}
        min={0}
        max={345}
        step={15}
        valueLabelDisplay="auto"
        marks
      />

      <Grid container spacing={2} mt={1}>
        <Grid xs={6}>
          <TextField
            label="Width (U)"
            type="number"
            inputProps={{ step: 0.25, min: 1 }}
            value={width}
            onChange={e => handleWidthChange(parseFloat(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">U</InputAdornment>,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Height (U)"
            type="number"
            inputProps={{ step: 0.25, min: 1 }}
            value={height}
            onChange={e => handleHeightChange(parseFloat(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">U</InputAdornment>,
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  )
}
