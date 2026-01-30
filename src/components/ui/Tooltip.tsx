import type { ReactNode, HTMLAttributes } from "react"
import { useState } from "react"

type TooltipPlacement = "top" | "bottom" | "left" | "right"

type TooltipProps = {
  content: ReactNode
  placement?: TooltipPlacement
  children: ReactNode
  className?: string
} & Omit<HTMLAttributes<HTMLDivElement>, "content">

const placementStyles: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

const arrowStyles: Record<TooltipPlacement, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-bg-surface border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-bg-surface border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-bg-surface border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-bg-surface border-y-transparent border-l-transparent",
}

export function Tooltip({
  content,
  placement = "top",
  children,
  className = "",
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 ${placementStyles[placement]}
            px-3 py-1.5 text-xs font-medium text-text-primary
            bg-bg-surface border border-border rounded
            whitespace-nowrap pointer-events-none
            animate-in fade-in duration-150
          `}
          role="tooltip"
        >
          {content}
          <span
            className={`
              absolute w-0 h-0 border-4
              ${arrowStyles[placement]}
            `}
          />
        </div>
      )}
    </div>
  )
}

export default Tooltip
