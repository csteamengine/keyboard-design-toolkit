import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react"
import { forwardRef } from "react"

type InputBaseProps = {
  label?: string
  error?: boolean
  helperText?: string
  fullWidth?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
}

type SingleLineInputProps = InputBaseProps & {
  multiline?: false
  rows?: never
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">

type MultiLineInputProps = InputBaseProps & {
  multiline: true
  rows?: number
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">

type InputProps = SingleLineInputProps | MultiLineInputProps

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error = false,
      helperText,
      fullWidth = false,
      multiline = false,
      rows = 3,
      startAdornment,
      endAdornment,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    const baseInputClasses = `
      bg-bg-surface border rounded-md text-text-primary
      placeholder:text-text-muted
      focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
      focus:outline-none transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-border"}
      ${startAdornment ? "pl-9" : "px-3"}
      ${endAdornment ? "pr-9" : "px-3"}
      py-2
    `.trim()

    const containerClasses = `
      ${fullWidth ? "w-full" : ""}
      ${className}
    `.trim()

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {startAdornment}
            </div>
          )}
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              rows={rows}
              className={`${baseInputClasses} w-full resize-none`}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className={`${baseInputClasses} w-full`}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {endAdornment}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={`mt-1 text-xs ${error ? "text-red-400" : "text-text-muted"}`}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
