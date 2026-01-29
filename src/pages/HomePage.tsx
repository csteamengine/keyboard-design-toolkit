import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Grid,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent"
import { useSession } from "../context/SessionContext.tsx"
import type { Keyboard } from "../types/KeyboardTypes.ts"
import { useNavigate } from "react-router-dom"
import { supabase } from "../app/supabaseClient.ts"

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
    <Box
      sx={{
        p: 3,
        minHeight: "100%",
        background: "linear-gradient(180deg, #0a0a0b 0%, #111113 100%)",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "#fafafa" }}>
        Welcome to the Keyboard Design Toolkit
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "#a1a1aa" }}>
        Build, edit, and export your custom keyboard layouts.
      </Typography>

      {/* Recently Edited Section */}
      <Typography variant="h5" mt={5} mb={2} sx={{ color: "#fafafa" }}>
        Recently Edited Keyboards
      </Typography>
      {/* Gradient divider */}
      <Box
        sx={{
          height: 2,
          width: 120,
          mb: 3,
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
          borderRadius: 1,
        }}
      />

      <Grid container spacing={2}>
        {/* New Project Card with gradient border */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={9999}>
          <Card
            onClick={handleNewProject}
            sx={{
              height: 120,
              cursor: "pointer",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#18181b",
              border: "1px solid transparent",
              backgroundImage: `
                linear-gradient(#18181b, #18181b),
                linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 0 24px rgba(99, 102, 241, 0.3)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <AddIcon
                  sx={{
                    fontSize: 48,
                    background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                <Typography variant="subtitle1" mt={1} sx={{ color: "#fafafa" }}>
                  New Project
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {keyboards.map(project => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
            <Card
              onClick={() => navigate(`/keyboards/${project.id}`)}
              sx={{
                height: 120,
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#3f3f46",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: "#fafafa" }}>
                  {project.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#71717a" }}>
                  Last edited: {formatDate(project.updated_at)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Other Actions Section */}
      <Typography variant="h5" mt={5} mb={2} sx={{ color: "#fafafa" }}>
        Other Actions
      </Typography>
      {/* Gradient divider */}
      <Box
        sx={{
          height: 2,
          width: 80,
          mb: 3,
          background: "linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6)",
          borderRadius: 1,
        }}
      />

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#3f3f46",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: "#fafafa" }}>
                Import Layout
              </Typography>
              <Typography variant="body2" sx={{ color: "#71717a" }}>
                Upload an existing layout (JSON, KLE, etc).
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth startIcon={<UploadFileIcon />} variant="outlined">
                Import
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#3f3f46",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: "#fafafa" }}>
                Plate Generator
              </Typography>
              <Typography variant="body2" sx={{ color: "#71717a" }}>
                Auto-generate switch plate DXFs from your layout.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                startIcon={<SettingsInputComponentIcon />}
                variant="outlined"
              >
                Open Tool
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default HomePage
