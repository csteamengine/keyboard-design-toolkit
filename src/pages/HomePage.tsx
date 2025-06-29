import React, { useEffect, useState } from "react"
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent"
import EditIcon from "@mui/icons-material/Edit"
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

  const handleAddKeyboard = async () => {
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Keyboard Design Toolkit
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Build, edit, and export your custom keyboard layouts.
      </Typography>

      {/* Recent Projects */}
      <Typography variant="h5" mt={5} mb={2}>
        Recently Edited Keyboards
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} key={9999}>
          <Card
            elevation={4}
            onClick={handleAddKeyboard}
            sx={{
              height: 120,
              cursor: "pointer",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <AddIcon sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography variant="subtitle1" mt={1}>
                  New Project
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {keyboards.map(project => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card
              elevation={4}
              onClick={() => navigate(`/keyboards/${project.id}`)}
              sx={{
                height: 120,
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Last edited: {formatDate(project.updated_at)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Projects */}
      <Typography variant="h5" mt={5} mb={2}>
        Other Actions
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Quick Actions */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h6">Import Layout</Typography>
              <Typography variant="body2">
                Upload an existing layout (JSON, KLE, etc).
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                startIcon={<UploadFileIcon />}
                variant="outlined"
              >
                Import
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h6">Plate Generator</Typography>
              <Typography variant="body2">
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
