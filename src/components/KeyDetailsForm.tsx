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
  useNodesState,
  useReactFlow,
  useStore,
} from "@xyflow/react"
import { useCallback, useState } from "react"
import { useAppSelector } from "../app/hooks.ts"
import { selectSelectedNodes } from "../app/editorSlice.tsx"

export default function KeyDetailsForm() {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()
  const selectedNodes = useAppSelector(selectSelectedNodes)

  const firstNode = selectedNodes ? (selectedNodes[0] ?? null) : null
  const [height, setHeight] = useState(firstNode?.data.heightU ?? 1)
  const [width, setWidth] = useState(firstNode?.data.widthU ?? 1)

  const handleLabelChange = e => {
    const label = e.target.value
    setNodes(nodes =>
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
      setNodes(nodes =>
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
    [selectedNodes, setNodes],
  )

  const handleHeightChange = useCallback(
    (value: number) => {
      setHeight(value)
      setNodes(nodes => {
        const toReturn = nodes.map(n =>
          selectedNodes.some(s => s.id === n.id)
            ? {
                ...n,
                height: `${value * 60}px`, // Convert U to pixels
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
    [selectedNodes, setNodes],
  )

  const handleWidthChange = useCallback(
    (value: number) => {
      setWidth(value)
      setNodes(nodes => {
        const toReturn = nodes.map(n =>
          selectedNodes.some(s => s.id === n.id)
            ? {
                ...n,
                width: `${value * 60}px`, // Convert U to pixels
                data: {
                  ...n.data,
                  widthU: value, // Convert U to pixels
                },
              }
            : n,
        )
        return toReturn
      })
    },
    [selectedNodes, setNodes],
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
        defaultValue={firstNode.data.label}
        onChange={handleLabelChange}
      />

      <Typography gutterBottom>Rotation</Typography>
      <Slider
        value={firstNode.data.rotation as number}
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
            defaultValue={width}
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
            defaultValue={height}
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
