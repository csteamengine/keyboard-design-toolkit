import {
  NodeProps,
  NodeResizer,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react"
import { memo, useCallback } from "react"
import { setSelection } from "@testing-library/user-event/dist/cjs/event/selection.js"
import { useSelection } from "../../context/EditorContext.tsx"

const unitSize = 60 // px per 1u

function KeyboardKey({ id, data, selected }: NodeProps) {
  const updateNodeInternals = useUpdateNodeInternals()
  const [_, setSelection] = useSelection()

  const handleResize = useCallback(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id])

  const handleResizeEnd = useCallback(() => {
    updateNodeInternals(id)
  }, [id, updateNodeInternals])

  return (
    <>
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
    </>
  )
}

export default memo(KeyboardKey)
