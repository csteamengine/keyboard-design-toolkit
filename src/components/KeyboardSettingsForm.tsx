import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { selectKeyboard, setKeyboard } from "../app/editorSlice.tsx"
import { HistoryContext } from "../context/HistoryContext.tsx"

type KeyboardMetadata = {
  name: string
  description: string
  notes: string
}

export default function KeyboardSettingsForm() {
  const { scheduleSave, saveFlow } = useContext(HistoryContext)
  const keyboard = useAppSelector(selectKeyboard)
  const dispatch = useAppDispatch()
  const [name, setName] = useState(keyboard?.name ?? "")
  const [description, setDescription] = useState(keyboard?.description ?? "")
  const [notes, setNotes] = useState(keyboard?.settings?.notes ?? "")

  const handleChange =
    (field: keyof KeyboardMetadata) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value

      if (field == "name") {
        setName(value)
      }
      if (field == "description") {
        setDescription(value)
      }
      if (field == "notes") {
        setNotes(value)
      }

      const updated = {
        ...keyboard,
        name: field === "name" ? value : keyboard.name,
        description: field === "description" ? value : keyboard.description,
        settings: {
          ...keyboard.settings,
          notes: field === "notes" ? value : keyboard.settings?.notes,
        },
      }

      dispatch(setKeyboard(updated))

      scheduleSave()
    }

  const handleSave = () => {
    void saveFlow()
  }

  if (!keyboard) {
    return (
      <Box sx={{ justifyContent: "center", textAlign: "center", mt: 4 }}>
        <h3>Not Logged In</h3>
        <Typography>Please log in to access keyboard settings.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" color="primary">
          <a
            href="/auth/login"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Log In
          </a>
        </Button>
      </Box>
    )
  }

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Keyboard Settings
      </Typography>

      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid item xs={12} style={{ width: "100%" }}>
          <TextField
            label="Keyboard Name"
            value={name}
            onChange={handleChange("name")}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} style={{ width: "100%" }}>
          <TextField
            label="Description"
            value={description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>

        <Grid item xs={12} style={{ width: "100%" }}>
          <TextField
            label="Notes"
            value={notes}
            onChange={handleChange("notes")}
            fullWidth
            multiline
            minRows={8}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
