import {
  NodeProps,
  NodeResizer,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react"
import { memo, useCallback, useEffect, useRef } from "react"
import { setSelection } from "@testing-library/user-event/dist/cjs/event/selection.js"
import { useSelection } from "../../context/EditorContext.tsx"
import { Box } from "@mui/material"

const unitSize = 60 // px per 1u

function KeyboardKey({ id, data, selected }: NodeProps) {
  const updateNodeInternals = useUpdateNodeInternals()
  const [_, setSelection] = useSelection()
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const handleResize = useCallback(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id])

  const handleResizeEnd = useCallback(() => {
    updateNodeInternals(id)
  }, [id, updateNodeInternals])

  useEffect(() => {
    // Reactflow doesnt support rotation officially, and while this works, its far too buggy to use reliably.
    // // Wait for the outer wrapper to mount
    // const wrapper = wrapperRef.current?.closest(".react-flow__node")
    // if (wrapper) {
    //   wrapper.style.transform = `rotate(${data.rotation ?? 0}deg)`
    //   wrapper.style.transformOrigin = "center center"
    // }
    //
    // return () => {
    //   // Cleanup if needed
    //   if (wrapper) {
    //     wrapper.style.transform = ""
    //   }
    // }
  }, [data.rotation])

  return (
    <Box
      ref={wrapperRef}
      sx={{
        transformOrigin: "center center",
        boxSizing: "border-box",
        display: "inline-block",
        // This rotates the inner content, not the node itself.
        transform: `rotate(${data.rotation ?? 0}deg)`,
        height: "100%",
        width: "100%",
        // margin: "10px",
      }}
      // className="react-flow__node"
    >
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={unitSize}
        minHeight={unitSize}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        handleStyle={{
          width: 2,
          height: 2,
          border: "none",
        }}
        lineStyle={{
          borderWidth: 1,
        }}
      />
      <div>{String(data.label)}</div>
      <div>{String(data.label)}</div>
      <div>{String(data.label)}</div>
    </Box>
  )
}

export default memo(KeyboardKey)
