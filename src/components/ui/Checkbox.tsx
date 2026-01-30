import type { InputHTMLAttributes, ReactNode } from "react"
import { forwardRef } from "react"
import { Check } from "lucide-react"

type CheckboxProps = {
  label?: ReactNode
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", checked, onChange, disabled, ...props }, ref) => {
    return (
      <label
        className={`
          inline-flex items-center gap-2 cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `.trim()}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-colors
              flex items-center justify-center
              ${checked
                ? "bg-indigo-500 border-indigo-500"
                : "bg-transparent border-border peer-hover:border-border-hover"}
              ${disabled ? "" : "peer-focus:ring-2 peer-focus:ring-indigo-500/30"}
            `}
          >
            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && (
          <span className="text-sm text-text-secondary select-none">{label}</span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = "Checkbox"

export default Checkbox
