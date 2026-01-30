import type { InputHTMLAttributes } from "react"
import { forwardRef } from "react"

type SliderProps = {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  marks?: { value: number; label: string }[]
  valueLabelDisplay?: "auto" | "on" | "off"
  valueLabelFormat?: (value: number) => string
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type">

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      marks,
      valueLabelDisplay = "off",
      valueLabelFormat = (v) => String(v),
      className = "",
      ...props
    },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative pt-1">
          {/* Value label */}
          {valueLabelDisplay !== "off" && (
            <div
              className="absolute -top-6 px-2 py-0.5 text-xs font-medium text-white bg-indigo-500 rounded transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${percentage}%` }}
            >
              {valueLabelFormat(value)}
            </div>
          )}

          {/* Track container */}
          <div className="relative h-2">
            {/* Background track */}
            <div className="absolute inset-0 bg-bg-muted rounded-full" />

            {/* Filled track with gradient */}
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-indigo-500"
              style={{ width: `${percentage}%` }}
            />

            {/* Native range input */}
            <input
              ref={ref}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              {...props}
            />

            {/* Custom thumb */}
            <div
              className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 bg-white rounded-full shadow-md border-2 border-indigo-500 pointer-events-none transition-shadow hover:shadow-[0_0_0_8px_rgba(99,102,241,0.2)]"
              style={{ left: `${percentage}%` }}
            />
          </div>

          {/* Marks */}
          {marks && marks.length > 0 && (
            <div className="relative mt-2">
              {marks.map((mark) => {
                const markPercentage = ((mark.value - min) / (max - min)) * 100
                return (
                  <div
                    key={mark.value}
                    className="absolute text-xs text-text-muted transform -translate-x-1/2"
                    style={{ left: `${markPercentage}%` }}
                  >
                    {mark.label}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Slider.displayName = "Slider"

export default Slider
