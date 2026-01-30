import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "primary" | "outlined" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "btn-gradient text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5",
  outlined:
    "border border-border text-text-secondary hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-text-primary bg-transparent",
  ghost:
    "text-text-secondary hover:bg-indigo-500/10 hover:text-text-primary bg-transparent",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
    </button>
  )
}

export default Button
