import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useReactFlow } from "@xyflow/react"
import { useSession } from "../context/SessionContext.tsx"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { selectKeyboard, setKeyboard } from "../app/editorSlice.tsx"
import { HistoryContext } from "../context/HistoryContext.tsx"
import { useCreateKeyboard } from "../context/EditorContext.tsx"
import type { Keyboard } from "../types/KeyboardTypes.ts"
import { Button, Input, Alert } from "./ui"

type KeyboardMetadata = {
  name: string
  description: string
  notes: string
}

export default function KeyboardSettingsForm() {
  const { scheduleSave, saveFlow, isDirty, setIsDirty } = useContext(HistoryContext)
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

  // Sync local state when keyboard changes (e.g., loading a different keyboard)
  useEffect(() => {
    setName(keyboard?.name ?? "")
    setDescription(keyboard?.description ?? "")
    setNotes((keyboard?.settings?.notes as string) ?? "")
  }, [keyboard?.id])

  const nodes = reactFlowInstance.getNodes()
  const hasUnsavedNewKeyboard = !keyboard && nodes.length > 0

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
      <div className="text-center mt-8">
        <h3 className="text-lg font-semibold text-white mb-2">
          Not Logged In
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Please log in to access keyboard settings.
        </p>
        <Button variant="primary" onClick={() => navigate("/auth/login")}>
          Log In
        </Button>
      </div>
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
        setIsDirty(false)
        dispatch(setKeyboard(data))
        navigate(`/keyboards/${data.id}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!keyboard) {
    return (
      <div className="space-y-4">
        {hasUnsavedNewKeyboard && (
          <Alert severity="warning">
            You have unsaved changes. Create a keyboard to save your layout.
          </Alert>
        )}
        <p className="text-sm text-text-muted">
          Save your layout as a new keyboard
        </p>
        <Input
          label="Keyboard Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          required
        />

        <Input
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        <Input
          label="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />

        <Button
          variant="primary"
          fullWidth
          onClick={() => void handleCreateKeyboard()}
          disabled={!name.trim() || isSaving}
        >
          {isSaving ? "Saving..." : "Create Keyboard"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isDirty && (
        <Alert severity="warning">
          You have unsaved changes.
        </Alert>
      )}
      <Input
        label="Keyboard Name"
        value={name}
        onChange={handleChange("name")}
        fullWidth
      />

      <Input
        label="Description"
        value={description}
        onChange={handleChange("description")}
        fullWidth
        multiline
        rows={2}
      />

      <Input
        label="Notes"
        value={notes}
        onChange={handleChange("notes")}
        fullWidth
        multiline
        rows={4}
      />

      <Button variant="primary" fullWidth onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}
