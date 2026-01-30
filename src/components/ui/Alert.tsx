import type { ReactNode } from "react"
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react"

type AlertSeverity = "error" | "success" | "warning" | "info"

type AlertProps = {
  severity?: AlertSeverity
  children: ReactNode
  onClose?: () => void
  icon?: ReactNode
  className?: string
}

const severityStyles: Record<AlertSeverity, string> = {
  error:
    "bg-red-500/15 border-red-500/30 text-red-300",
  success:
    "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  warning:
    "bg-amber-500/15 border-amber-500/30 text-amber-300",
  info:
    "bg-blue-500/15 border-blue-500/30 text-blue-300",
}

const severityIcons: Record<AlertSeverity, ReactNode> = {
  error: <AlertCircle className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
}

export function Alert({
  severity = "info",
  children,
  onClose,
  icon,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg border
        ${severityStyles[severity]}
        ${className}
      `.trim()}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">
        {icon ?? severityIcons[severity]}
      </span>
      <div className="flex-1 text-sm">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
