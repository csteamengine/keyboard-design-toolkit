import { Node, NodePositionChange, XYPosition } from "@xyflow/react"
import { getRotatedCorners } from "./rotation"
import { UNIT_SIZE } from "../constants/editor"

type GetHelperLinesResult = {
  horizontal?: number
  vertical?: number
  snapPosition: Partial<XYPosition>
}

type KeyData = {
  widthU?: number
  heightU?: number
  rotation?: number
}

// Get the actual dimensions of a key node
function getKeyDimensions(node: Node): { width: number; height: number; rotation: number } {
  const data = node.data as KeyData
  return {
    width: (data.widthU ?? 1) * UNIT_SIZE,
    height: (data.heightU ?? 1) * UNIT_SIZE,
    rotation: data.rotation ?? 0,
  }
}

// this utility function can be called with a position change (inside onNodesChange)
// it checks all other nodes and calculated the helper line positions and the position where the current node should snap to
export function getHelperLines(
  change: NodePositionChange,
  nodes: Node[],
  distance = 5,
): GetHelperLinesResult {
  const defaultResult = {
    horizontal: undefined,
    vertical: undefined,
    snapPosition: { x: undefined, y: undefined },
  }
  const nodeA = nodes.find(node => node.id === change.id)

  if (!nodeA || !change.position) {
    return defaultResult
  }

  const position = change.position

  const nodeABounds = {
    left: position.x,
    right: position.x + (nodeA.measured?.width ?? 0),
    top: position.y,
    bottom: position.y + (nodeA.measured?.height ?? 0),
    width: nodeA.measured?.width ?? 0,
    height: nodeA.measured?.height ?? 0,
  }

  // Get key data for rotated snapping
  const nodeAKey = getKeyDimensions(nodeA)
  const nodeACenterX = position.x + nodeABounds.width / 2
  const nodeACenterY = position.y + nodeABounds.height / 2

  let horizontalDistance = distance
  let verticalDistance = distance

  return nodes
    .filter(node => node.id !== nodeA.id)
    .reduce<GetHelperLinesResult>((result, nodeB) => {
      const nodeBBounds = {
        left: nodeB.position.x,
        right: nodeB.position.x + (nodeB.measured?.width ?? 0),
        top: nodeB.position.y,
        bottom: nodeB.position.y + (nodeB.measured?.height ?? 0),
        width: nodeB.measured?.width ?? 0,
        height: nodeB.measured?.height ?? 0,
      }

      // Standard bounding box alignment (for non-rotated or different-rotation keys)
      const distanceLeftLeft = Math.abs(nodeABounds.left - nodeBBounds.left)
      if (distanceLeftLeft < verticalDistance) {
        result.snapPosition.x = nodeBBounds.left
        result.vertical = nodeBBounds.left
        verticalDistance = distanceLeftLeft
      }

      const distanceRightRight = Math.abs(nodeABounds.right - nodeBBounds.right)
      if (distanceRightRight < verticalDistance) {
        result.snapPosition.x = nodeBBounds.right - nodeABounds.width
        result.vertical = nodeBBounds.right
        verticalDistance = distanceRightRight
      }

      const distanceLeftRight = Math.abs(nodeABounds.left - nodeBBounds.right)
      if (distanceLeftRight < verticalDistance) {
        result.snapPosition.x = nodeBBounds.right
        result.vertical = nodeBBounds.right
        verticalDistance = distanceLeftRight
      }

      const distanceRightLeft = Math.abs(nodeABounds.right - nodeBBounds.left)
      if (distanceRightLeft < verticalDistance) {
        result.snapPosition.x = nodeBBounds.left - nodeABounds.width
        result.vertical = nodeBBounds.left
        verticalDistance = distanceRightLeft
      }

      const distanceTopTop = Math.abs(nodeABounds.top - nodeBBounds.top)
      if (distanceTopTop < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.top
        result.horizontal = nodeBBounds.top
        horizontalDistance = distanceTopTop
      }

      const distanceBottomTop = Math.abs(nodeABounds.bottom - nodeBBounds.top)
      if (distanceBottomTop < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.top - nodeABounds.height
        result.horizontal = nodeBBounds.top
        horizontalDistance = distanceBottomTop
      }

      const distanceBottomBottom = Math.abs(nodeABounds.bottom - nodeBBounds.bottom)
      if (distanceBottomBottom < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.bottom - nodeABounds.height
        result.horizontal = nodeBBounds.bottom
        horizontalDistance = distanceBottomBottom
      }

      const distanceTopBottom = Math.abs(nodeABounds.top - nodeBBounds.bottom)
      if (distanceTopBottom < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.bottom
        result.horizontal = nodeBBounds.bottom
        horizontalDistance = distanceTopBottom
      }

      // Rotated corner snapping - only for keys with matching rotation
      const nodeBKey = getKeyDimensions(nodeB)

      if (nodeAKey.rotation !== 0 && nodeAKey.rotation === nodeBKey.rotation) {
        // Both keys have the same non-zero rotation
        const nodeBCenterX = nodeB.position.x + nodeBBounds.width / 2
        const nodeBCenterY = nodeB.position.y + nodeBBounds.height / 2

        const cornersA = getRotatedCorners(
          nodeACenterX,
          nodeACenterY,
          nodeAKey.width,
          nodeAKey.height,
          nodeAKey.rotation
        )

        const cornersB = getRotatedCorners(
          nodeBCenterX,
          nodeBCenterY,
          nodeBKey.width,
          nodeBKey.height,
          nodeBKey.rotation
        )

        // Check if any corner of A aligns with any corner of B
        const cornerPairsA = [cornersA.topLeft, cornersA.topRight, cornersA.bottomLeft, cornersA.bottomRight]
        const cornerPairsB = [cornersB.topLeft, cornersB.topRight, cornersB.bottomLeft, cornersB.bottomRight]

        for (const cornerA of cornerPairsA) {
          for (const cornerB of cornerPairsB) {
            const dx = cornerA.x - cornerB.x
            const dy = cornerA.y - cornerB.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < distance * 2) {
              // Snap to align the corners
              const snapDx = cornerB.x - cornerA.x
              const snapDy = cornerB.y - cornerA.y

              // Check if this is closer than current best
              if (Math.abs(snapDx) < Math.abs(result.snapPosition.x ?? Infinity) ||
                  Math.abs(snapDy) < Math.abs(result.snapPosition.y ?? Infinity)) {
                result.snapPosition.x = position.x + snapDx
                result.snapPosition.y = position.y + snapDy
                // Use corner position for helper lines
                result.vertical = cornerB.x
                result.horizontal = cornerB.y
              }
            }
          }
        }

        // Also check edge alignment for same-rotation keys
        // Top edge of A to bottom edge of B (they should touch)
        const topEdgeAMidY = (cornersA.topLeft.y + cornersA.topRight.y) / 2
        const bottomEdgeBMidY = (cornersB.bottomLeft.y + cornersB.bottomRight.y) / 2
        const edgeDistTopBottom = Math.abs(topEdgeAMidY - bottomEdgeBMidY)

        if (edgeDistTopBottom < distance) {
          const snapDy = bottomEdgeBMidY - topEdgeAMidY
          if (Math.abs(snapDy) < Math.abs((result.snapPosition.y ?? position.y) - position.y)) {
            result.snapPosition.y = position.y + snapDy
            result.horizontal = bottomEdgeBMidY
          }
        }

        // Bottom edge of A to top edge of B
        const bottomEdgeAMidY = (cornersA.bottomLeft.y + cornersA.bottomRight.y) / 2
        const topEdgeBMidY = (cornersB.topLeft.y + cornersB.topRight.y) / 2
        const edgeDistBottomTop = Math.abs(bottomEdgeAMidY - topEdgeBMidY)

        if (edgeDistBottomTop < distance) {
          const snapDy = topEdgeBMidY - bottomEdgeAMidY
          if (Math.abs(snapDy) < Math.abs((result.snapPosition.y ?? position.y) - position.y)) {
            result.snapPosition.y = position.y + snapDy
            result.horizontal = topEdgeBMidY
          }
        }

        // Left edge of A to right edge of B
        const leftEdgeAMidX = (cornersA.topLeft.x + cornersA.bottomLeft.x) / 2
        const rightEdgeBMidX = (cornersB.topRight.x + cornersB.bottomRight.x) / 2
        const edgeDistLeftRight = Math.abs(leftEdgeAMidX - rightEdgeBMidX)

        if (edgeDistLeftRight < distance) {
          const snapDx = rightEdgeBMidX - leftEdgeAMidX
          if (Math.abs(snapDx) < Math.abs((result.snapPosition.x ?? position.x) - position.x)) {
            result.snapPosition.x = position.x + snapDx
            result.vertical = rightEdgeBMidX
          }
        }

        // Right edge of A to left edge of B
        const rightEdgeAMidX = (cornersA.topRight.x + cornersA.bottomRight.x) / 2
        const leftEdgeBMidX = (cornersB.topLeft.x + cornersB.bottomLeft.x) / 2
        const edgeDistRightLeft = Math.abs(rightEdgeAMidX - leftEdgeBMidX)

        if (edgeDistRightLeft < distance) {
          const snapDx = leftEdgeBMidX - rightEdgeAMidX
          if (Math.abs(snapDx) < Math.abs((result.snapPosition.x ?? position.x) - position.x)) {
            result.snapPosition.x = position.x + snapDx
            result.vertical = leftEdgeBMidX
          }
        }
      }

      return result
    }, defaultResult)
}
