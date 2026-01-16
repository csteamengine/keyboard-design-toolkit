// Rotation utilities for keyboard key positioning

/**
 * Calculate the bounding box dimensions for a rotated rectangle.
 * When a rectangle is rotated, it needs a larger bounding box to contain it.
 */
export function getRotatedBoundingBox(
  width: number,
  height: number,
  rotationDeg: number
): { width: number; height: number } {
  if (rotationDeg === 0) {
    return { width, height }
  }

  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))

  return {
    width: Math.ceil(width * cos + height * sin),
    height: Math.ceil(width * sin + height * cos),
  }
}

/**
 * Calculate the offset needed to center content within a bounding box.
 */
export function getRotationOffset(
  contentWidth: number,
  contentHeight: number,
  boundingWidth: number,
  boundingHeight: number
): { x: number; y: number } {
  return {
    x: (boundingWidth - contentWidth) / 2,
    y: (boundingHeight - contentHeight) / 2,
  }
}

/**
 * Convert KLE rotation origin (in units) to pixel coordinates.
 */
export function kleRotationToPixels(
  rx: number,
  ry: number,
  unitSize: number
): { x: number; y: number } {
  return {
    x: rx * unitSize,
    y: ry * unitSize,
  }
}

/**
 * Apply rotation around a point to get new coordinates.
 * Used for calculating key positions when rotation origin is not at key center.
 */
export function rotatePoint(
  x: number,
  y: number,
  originX: number,
  originY: number,
  rotationDeg: number
): { x: number; y: number } {
  if (rotationDeg === 0) {
    return { x, y }
  }

  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // Translate point to origin
  const relX = x - originX
  const relY = y - originY

  // Rotate
  const rotatedX = relX * cos - relY * sin
  const rotatedY = relX * sin + relY * cos

  // Translate back
  return {
    x: rotatedX + originX,
    y: rotatedY + originY,
  }
}

/**
 * Calculate position adjustment needed when rotation changes.
 * This keeps the visual center of the key stable.
 */
export function getPositionAdjustmentForRotation(
  actualWidth: number,
  actualHeight: number,
  oldRotation: number,
  newRotation: number
): { dx: number; dy: number } {
  const oldBounds = getRotatedBoundingBox(actualWidth, actualHeight, oldRotation)
  const newBounds = getRotatedBoundingBox(actualWidth, actualHeight, newRotation)

  return {
    dx: (oldBounds.width - newBounds.width) / 2,
    dy: (oldBounds.height - newBounds.height) / 2,
  }
}

/**
 * Get the four corners of a rotated rectangle.
 * The rectangle is centered at (centerX, centerY).
 */
export function getRotatedCorners(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  rotationDeg: number
): {
  topLeft: { x: number; y: number }
  topRight: { x: number; y: number }
  bottomLeft: { x: number; y: number }
  bottomRight: { x: number; y: number }
} {
  const halfW = width / 2
  const halfH = height / 2

  // Unrotated corners relative to center
  const corners = {
    topLeft: { x: -halfW, y: -halfH },
    topRight: { x: halfW, y: -halfH },
    bottomLeft: { x: -halfW, y: halfH },
    bottomRight: { x: halfW, y: halfH },
  }

  if (rotationDeg === 0) {
    return {
      topLeft: { x: centerX + corners.topLeft.x, y: centerY + corners.topLeft.y },
      topRight: { x: centerX + corners.topRight.x, y: centerY + corners.topRight.y },
      bottomLeft: { x: centerX + corners.bottomLeft.x, y: centerY + corners.bottomLeft.y },
      bottomRight: { x: centerX + corners.bottomRight.x, y: centerY + corners.bottomRight.y },
    }
  }

  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const rotate = (pt: { x: number; y: number }) => ({
    x: centerX + pt.x * cos - pt.y * sin,
    y: centerY + pt.x * sin + pt.y * cos,
  })

  return {
    topLeft: rotate(corners.topLeft),
    topRight: rotate(corners.topRight),
    bottomLeft: rotate(corners.bottomLeft),
    bottomRight: rotate(corners.bottomRight),
  }
}
