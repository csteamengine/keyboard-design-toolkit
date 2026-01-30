import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Home,
  CircleUser,
  Sun,
  Moon,
} from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../app/supabaseClient.ts"
import { useLogout, useSession } from "../context/SessionContext.tsx"
import { useTheme } from "../context/ThemeContext.tsx"
import { Dropdown, DropdownItem, DropdownDivider } from "./ui"

const drawerWidth = 240
const collapsedWidth = 57

type MenuItem = {
  label: string
  path: string
  icon: React.ReactNode
}

export default function Layout() {
  const logout = useLogout()
  const { user, session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems: MenuItem[] = [
    { label: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    {
      label: "Keyboard Editor",
      path: "/keyboards",
      icon: <Keyboard className="w-5 h-5" />,
    },
  ]

  const userEmail = user?.email
  const username = String(user?.user_metadata.full_name ?? userEmail)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    void logout()
    void navigate("/auth/login", { replace: true })
  }

  return (
    <div className="flex bg-bg-base">
      {/* AppBar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-border flex items-center px-4"
        style={{
          marginLeft: open ? drawerWidth : collapsedWidth,
          width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
          transition: "margin-left 0.2s ease, width 0.2s ease",
        }}
      >
        <h1 className="text-lg font-semibold gradient-text">
          Keyboard Design Toolkit
        </h1>

        {/* Right-aligned section */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-indigo-500/10 rounded transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {session && username && (
            <span className="text-sm text-text-secondary">{username}</span>
          )}

          <Dropdown
            trigger={
              <button className="p-2 text-text-muted hover:text-text-primary hover:bg-indigo-500/10 rounded transition-colors">
                <CircleUser className="w-5 h-5" />
              </button>
            }
          >
            {session ? (
              <>
                <DropdownItem onClick={() => {}}>Profile</DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={() => void handleLogout()}>
                  Logout
                </DropdownItem>
              </>
            ) : (
              <>
                <DropdownItem href="/auth/login">Login</DropdownItem>
                <DropdownItem href="/auth/signup">Sign Up</DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </header>

      {/* Drawer */}
      <aside
        className="fixed left-0 top-0 h-screen bg-bg-subtle border-r border-border z-40 transition-all duration-200 overflow-hidden"
        style={{ width: open ? drawerWidth : collapsedWidth }}
      >
        {/* Drawer Header */}
        <div className="h-14 flex items-center justify-end px-2 bg-bg-subtle">
          <button
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-indigo-500/10 rounded transition-colors"
          >
            {open ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="border-t border-border" />

        {/* Menu Items */}
        <nav className="py-2">
          {menuItems.map(item => {
            const isSelected = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center h-12 px-5 transition-colors
                  ${isSelected
                    ? "bg-indigo-500/15 text-text-primary"
                    : "text-text-muted hover:bg-bg-muted/50 hover:text-text-primary"}
                `}
              >
                <span
                  className={`flex-shrink-0 ${
                    open ? "mr-6" : "mr-0"
                  } transition-all`}
                  style={{ color: isSelected ? "#6366f1" : "inherit" }}
                >
                  {item.icon}
                </span>
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${
                    open ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="flex-grow h-screen overflow-hidden bg-bg-base transition-all duration-200"
        style={{
          marginLeft: open ? drawerWidth : collapsedWidth,
        }}
      >
        {/* Spacer for AppBar */}
        <div className="h-14" />
        <Outlet />
      </main>
    </div>
  )
}
