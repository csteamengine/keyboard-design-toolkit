import React, { useEffect, useState } from "react"
import { Plus, Upload, Settings } from "lucide-react"
import { useSession } from "../context/SessionContext.tsx"
import type { Keyboard } from "../types/KeyboardTypes.ts"
import { useNavigate } from "react-router-dom"
import { supabase } from "../app/supabaseClient.ts"
import { Button, Card, CardContent, CardActions } from "../components/ui"

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })

const HomePage: React.FC = () => {
  const { user, session } = useSession()
  const [keyboards, setKeyboards] = useState<Keyboard[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchKeyboards = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("keyboards")
        .select("*")
        .order("updated_at", { ascending: false })
        .eq("user_id", user.id)

      if (error) {
        console.error("Error fetching keyboards:", error)
      } else {
        console.log("Fetched keyboards:", data)
        setKeyboards(data)
      }
    }
    void fetchKeyboards()
  }, [user, session])

  const handleNewProject = async () => {
    if (!user || !session) {
      void navigate("editor", { replace: true })
      return
    }
    const { data, error } = await supabase
      .from("keyboards")
      .insert({
        name: "New Keyboard",
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding keyboard:", error)
    } else {
      console.log("Keyboard added successfully:", data)
      void navigate("/keyboards/" + data?.id)
    }
  }

  return (
    <div className="p-6 min-h-full bg-bg-base">
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        Welcome to the Keyboard Design Toolkit
      </h1>
      <p className="text-text-secondary text-lg mb-8">
        Build, edit, and export your custom keyboard layouts.
      </p>

      {/* Recently Edited Section */}
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        Recently Edited Keyboards
      </h2>
      {/* Gradient divider */}
      <div
        className="h-0.5 w-28 mb-6 rounded"
        style={{
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* New Project Card with gradient border */}
        <div
          onClick={handleNewProject}
          className="h-[120px] cursor-pointer rounded-xl flex flex-col items-center justify-center
                     bg-bg-surface border border-border-accent transition-all duration-200
                     hover:shadow-[0_0_24px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
        >
          <Plus className="w-12 h-12 gradient-text mb-2" />
          <span className="text-text-primary font-medium">New Project</span>
        </div>

        {keyboards.map(project => (
          <Card
            key={project.id}
            hoverable
            className="h-[120px] cursor-pointer flex flex-col items-center justify-center"
            onClick={() => navigate(`/keyboards/${project.id}`)}
          >
            <h3 className="text-lg font-semibold text-text-primary">{project.name}</h3>
            <p className="text-sm text-text-muted">
              Last edited: {formatDate(project.updated_at)}
            </p>
          </Card>
        ))}
      </div>

      {/* Other Actions Section */}
      <h2 className="text-xl font-semibold text-text-primary mt-10 mb-2">
        Other Actions
      </h2>
      {/* Gradient divider */}
      <div
        className="h-0.5 w-20 mb-6 rounded"
        style={{
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
        }}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card hoverable>
          <CardContent>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Import Layout
            </h3>
            <p className="text-sm text-text-muted">
              Upload an existing layout (JSON, KLE, etc).
            </p>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Upload className="w-4 h-4" />}
            >
              Import
            </Button>
          </CardActions>
        </Card>

        <Card hoverable>
          <CardContent>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Plate Generator
            </h3>
            <p className="text-sm text-text-muted">
              Auto-generate switch plate DXFs from your layout.
            </p>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Settings className="w-4 h-4" />}
            >
              Open Tool
            </Button>
          </CardActions>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
