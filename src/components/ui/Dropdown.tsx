import type { ReactNode, MouseEvent } from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"

type DropdownProps = {
  trigger: ReactNode
  children: ReactNode
  align?: "left" | "right"
  className?: string
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: align === "right" ? rect.right : rect.left,
      })
    }
  }, [align])

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition()
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  return (
    <>
      <div ref={triggerRef} onClick={handleToggle} className="inline-block">
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`
              fixed z-50 min-w-[160px]
              bg-bg-surface border border-border rounded-lg
              shadow-[0_8px_24px_rgba(0,0,0,0.5)]
              py-1
              animate-in fade-in slide-in-from-top-2 duration-150
              ${className}
            `.trim()}
            style={{
              top: position.top,
              left: align === "right" ? "auto" : position.left,
              right: align === "right" ? `calc(100vw - ${position.left}px)` : "auto",
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  )
}

type DropdownItemProps = {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
  href?: string
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  className = "",
  href,
}: DropdownItemProps) {
  const baseClasses = `
    w-full px-4 py-2 text-sm text-left
    text-text-secondary hover:text-text-primary hover:bg-bg-muted
    transition-colors
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${className}
  `.trim()

  if (href) {
    return (
      <a href={href} className={`block ${baseClasses}`}>
        {children}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-border" />
}

export default Dropdown
