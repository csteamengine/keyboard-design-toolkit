import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useReactFlow } from "@xyflow/react"
import { useSession } from "../context/SessionContext.tsx"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { selectKeyboard, setKeyboard } from "../app/editorSlice.tsx"
import { HistoryContext } from "../context/HistoryContext.tsx"
import { useCreateKeyboard } from "../context/EditorContext.tsx"
import type { Keyboard } from "../types/KeyboardTypes.ts"

type KeyboardMetadata = {
  name: string
  description: string
  notes: string
}

export default function KeyboardSettingsForm() {
  const { scheduleSave, saveFlow } = useContext(HistoryContext)
  const { user } = useSession()
  const keyboard = useAppSelector(selectKeyboard)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const createKeyboard = useCreateKeyboard()
  const reactFlowInstance = useReactFlow()
  const [name, setName] = useState(keyboard?.name ?? "")
  const [description, setDescription] = useState(keyboard?.description ?? "")
  const [notes, setNotes] = useState(
    (keyboard?.settings?.notes as string) ?? ""
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleChange =
    (field: keyof KeyboardMetadata) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!keyboard) return

      const value = event.target.value

      if (field === "name") {
        setName(value)
      }
      if (field === "description") {
        setDescription(value)
      }
      if (field === "notes") {
        setNotes(value)
      }

      const updated: Keyboard = {
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

  if (!user) {
    return (
      <Box sx={{ justifyContent: "center", textAlign: "center", mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Not Logged In
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please log in to access keyboard settings.
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          color="primary"
          href="/auth/login"
        >
          Log In
        </Button>
      </Box>
    )
  }

  const handleCreateKeyboard = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    try {
      const flowData = reactFlowInstance.toObject()
      const { data, error } = await createKeyboard({
        name: name.trim(),
        description: description.trim(),
        reactflow: flowData,
        settings: { notes },
      })
      if (data && !error) {
        dispatch(setKeyboard(data))
        navigate(`/keyboards/${data.id}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!keyboard) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Save your layout as a new keyboard
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Keyboard Name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            size="small"
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            size="small"
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            size="small"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateKeyboard}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Create Keyboard"}
          </Button>
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          label="Keyboard Name"
          value={name}
          onChange={handleChange("name")}
          fullWidth
          size="small"
        />

        <TextField
          label="Description"
          value={description}
          onChange={handleChange("description")}
          fullWidth
          multiline
          minRows={2}
          size="small"
        />

        <TextField
          label="Notes"
          value={notes}
          onChange={handleChange("notes")}
          fullWidth
          multiline
          minRows={4}
          size="small"
        />

        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Stack>
    </Box>
  )
}
