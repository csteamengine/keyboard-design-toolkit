import type { HTMLAttributes, ReactNode } from "react"

type CardVariant = "default" | "glass" | "gradient-border"

type CardProps = {
  variant?: CardVariant
  children: ReactNode
  hoverable?: boolean
} & HTMLAttributes<HTMLDivElement>

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-bg-surface border border-border",
  glass:
    "glass",
  "gradient-border":
    "gradient-border",
}

export function Card({
  variant = "default",
  children,
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl p-4
        ${variantStyles[variant]}
        ${hoverable ? "transition-all duration-200 hover:border-border-hover hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

export function CardActions({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mt-4 flex gap-2 ${className}`}>
      {children}
    </div>
  )
}

export default Card
