import type { ReactNode, MouseEvent } from "react"
import { useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

type DialogProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

const maxWidthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
}

export function Dialog({
  open,
  onClose,
  children,
  maxWidth = "md",
}: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, handleEscape])

  if (!open) return null

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={`
          relative w-full ${maxWidthStyles[maxWidth]}
          bg-bg-surface border border-border rounded-xl
          shadow-[0_16px_48px_rgba(0,0,0,0.6)]
          animate-in fade-in zoom-in-95 duration-200
        `}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogTitle({
  children,
  onClose,
  className = "",
}: {
  children: ReactNode
  onClose?: () => void
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between px-6 pt-6 pb-2 ${className}`}>
      <h2 className="text-lg font-semibold text-text-primary">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export function DialogContent({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`px-6 py-4 text-text-secondary ${className}`}>{children}</div>
  )
}

export function DialogActions({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex justify-end gap-2 px-6 pb-6 ${className}`}>
      {children}
    </div>
  )
}

export default Dialog
