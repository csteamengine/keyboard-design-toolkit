// Editor constants for keyboard design toolkit

// Unit size: pixels per 1U (standard key unit)
export const UNIT_SIZE = 60

// Grid snapping
export const SNAP_DIVISIONS = 4 // divisions per unit
export const SNAP_SIZE = UNIT_SIZE / SNAP_DIVISIONS // 15px

// Fine grid snapping (Alt key held)
export const FINE_SNAP_DIVISIONS = 16 // 1/16u when Alt held
export const FINE_SNAP_SIZE = UNIT_SIZE / FINE_SNAP_DIVISIONS // 3.75px

// Standard key sizes in U (units)
export const HORIZONTAL_KEY_SIZES = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.75, 3, 6, 6.5]
export const VERTICAL_KEY_SIZES = [1.25, 1.5, 1.75, 2]

// Default key dimensions
export const DEFAULT_KEY_WIDTH_U = 1
export const DEFAULT_KEY_HEIGHT_U = 1

// Rotation constants
export const ROTATION_STEP = 15 // degrees
export const ROTATION_MIN = 0
export const ROTATION_MAX = 345

// Sidebar dimensions
export const SIDEBAR_WIDTH_COLLAPSED = 60
export const SIDEBAR_WIDTH_EXPANDED = 400

// Preview scale for sidebar key previews
export const PREVIEW_SCALE = 3 / 4
