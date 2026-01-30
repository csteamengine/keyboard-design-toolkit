import type { ReactNode } from "react"
import { createContext, useContext } from "react"

type TabsContextValue = {
  value: string
  onChange: (value: string) => void
  orientation: "horizontal" | "vertical"
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tab components must be used within a Tabs component")
  }
  return context
}

type TabsProps = {
  value: string
  onChange: (value: string) => void
  orientation?: "horizontal" | "vertical"
  children: ReactNode
  className?: string
}

export function Tabs({
  value,
  onChange,
  orientation = "horizontal",
  children,
  className = "",
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange, orientation }}>
      <div
        className={`
          ${orientation === "vertical" ? "flex" : ""}
          ${className}
        `.trim()}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

type TabListProps = {
  children: ReactNode
  className?: string
}

export function TabList({ children, className = "" }: TabListProps) {
  const { orientation } = useTabsContext()

  return (
    <div
      className={`
        ${orientation === "horizontal"
          ? "flex border-b border-border"
          : "flex flex-col border-r border-border"}
        ${className}
      `.trim()}
      role="tablist"
    >
      {children}
    </div>
  )
}

type TabProps = {
  value: string
  icon?: ReactNode
  label?: string
  children?: ReactNode
  className?: string
  onClick?: () => void
}

export function Tab({
  value: tabValue,
  icon,
  label,
  children,
  className = "",
  onClick,
}: TabProps) {
  const { value, onChange, orientation } = useTabsContext()
  const isSelected = value === tabValue

  const handleClick = () => {
    onChange(tabValue)
    onClick?.()
  }

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={handleClick}
      className={`
        relative flex items-center justify-center gap-2
        font-medium text-sm transition-colors
        ${orientation === "horizontal"
          ? "px-4 py-3 min-w-[120px]"
          : "px-4 py-3 min-h-[56px] w-full"}
        ${isSelected
          ? "text-text-primary"
          : "text-text-muted hover:text-text-secondary hover:bg-bg-muted/50"}
        ${className}
      `.trim()}
    >
      {icon}
      {label || children}
      {/* Gradient indicator */}
      {isSelected && (
        <span
          className={`
            absolute bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500
            ${orientation === "horizontal"
              ? "bottom-0 left-0 right-0 h-0.5"
              : "left-0 top-0 bottom-0 w-0.5"}
          `}
        />
      )}
    </button>
  )
}

type TabPanelProps = {
  value: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value: panelValue, children, className = "" }: TabPanelProps) {
  const { value } = useTabsContext()

  if (value !== panelValue) return null

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  )
}

export default Tabs
