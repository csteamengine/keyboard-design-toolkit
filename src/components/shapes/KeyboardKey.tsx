import {
  NodeProps,
  NodeResizer,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react"
import { memo, useCallback, useEffect, useState } from "react"

const unitSize = 60 // px per 1u

function KeyboardKey({ id, data, selected }: NodeProps) {
  const [label, setLabel] = useState(data.label)
  const updateNodeInternals = useUpdateNodeInternals()

  const keyWidth =
    data.width ?? (data.widthU ? data.widthU * unitSize : unitSize)
  const keyHeight =
    data.height ?? (data.heightU ? data.heightU * unitSize : unitSize)

  const handleResize = useCallback(
    (_: any, { width, height }: { width: number; height: number }) => {
      const widthU = width / unitSize
      const heightU = height / unitSize
      const maxU = Math.max(widthU, heightU)
      setLabel(`${String(maxU)}U`)
      data.label = `${String(maxU)}U`
      updateNodeInternals(id)
    },
    [updateNodeInternals, id],
  )

  const handleResizeEnd = useCallback(() => {
    updateNodeInternals(id)
  }, [id, updateNodeInternals])

  const shouldResize = useCallback(
    (_: any, { width, height }: { width: number; height: number }) => {
      const keyHeight = height / unitSize
      const keyWidth = width / unitSize

      return (
        (keyHeight == 1 && keyWidth == 1) ||
        (keyHeight > 1 && keyWidth == 1) ||
        (keyWidth > 1 && keyHeight == 1)
      )
    },
    [],
  )

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={unitSize}
        minHeight={unitSize}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        shouldResize={shouldResize}
      />
      <div>{String(label)}</div>
    </>
  )
}

export default memo(KeyboardKey)
