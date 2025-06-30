import { NodeProps, NodeResizer, useUpdateNodeInternals } from "@xyflow/react"
import { memo, useEffect } from "react"

const unitSize = 60 // px per 1u

function KeyboardKey({ id, data, selected }: NodeProps) {
  const updateNodeInternals = useUpdateNodeInternals()

  const keyWidth =
    data.width ?? (data.widthU ? data.widthU * unitSize : unitSize)
  const keyHeight =
    data.height ?? (data.heightU ? data.heightU * unitSize : unitSize)
  //
  // useEffect(() => {
  //   updateNodeInternals(id)
  // }, [keyWidth, keyHeight, id, updateNodeInternals])

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={unitSize}
        minHeight={unitSize}
        handleStyle={{
          display: "none",
        }}
      />
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          border: "1px solid #555",
          borderRadius: 4,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontFamily: "monospace",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          padding: "2px 5px",
          boxSizing: "border-box",
        }}
      >
        {String(data.label)}
      </div>
    </>
  )
}

export default memo(KeyboardKey)
