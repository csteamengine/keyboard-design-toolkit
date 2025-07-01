import type React from "react"
import { useEffect, useState } from "react"
import { CssBaseline, Box, Button, Paper, IconButton } from "@mui/material"
import type { GridColDef, GridRowModel } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { supabase } from "../app/supabaseClient.ts"
import { useNavigate } from "react-router-dom"
import {
  useCreateKeyboard,
  useDeleteKeyboard,
  useFetchKeyboards,
} from "../context/EditorContext.tsx"
import type { Keyboard } from "../types/KeyboardTypes.ts"
import { useSession } from "../context/SessionContext.tsx"

const Keyboards: React.FC = () => {
  const navigate = useNavigate()
  const fetchKeyboards = useFetchKeyboards()
  const [keyboards, setKeyboards] = useState<Keyboard[]>([])
  const deleteKeyboard = useDeleteKeyboard()
  const createKeyboard = useCreateKeyboard()
  const [loading, setLoading] = useState(true)
  const { session, user } = useSession()

  useEffect(() => {
    const loadKeyboards = async () => {
      const { data, error } = await fetchKeyboards()

      if (error) {
        // TODO better error messaging to user
        console.error("Error fetching keyboards:", error.message)
        return
      }

      setKeyboards(data ?? [])
      setLoading(false)
    }

    setLoading(true)
    void loadKeyboards()
  }, [fetchKeyboards])

  const handleAddKeyboard = async () => {
    if (!session || !user) {
      void navigate("/editor", { replace: true })
      return
    }

    const { data, error } = await createKeyboard({
      name: "New Keyboard",
      description: "Description of the new keyboard",
    })

    if (error) {
      console.error("Error adding keyboard:", error)
    } else {
      console.log("Keyboard added successfully:", data)
      void navigate("/keyboards/" + data?.id)
    }
  }

  const handleDeleteKeyboard = async (keyboardId: string) => {
    if (!window.confirm("Are you sure you want to delete this keyboard?"))
      return

    const { success, error } = await deleteKeyboard(keyboardId)

    if (error) {
      console.error("Error deleting keyboard:", error)
    } else {
      setKeyboards(prev => prev.filter(k => k.id !== keyboardId))
      console.log("Keyboard deleted successfully")
    }
  }

  async function handleRowUpdate(newRow: GridRowModel, oldRow: GridRowModel) {
    if (
      newRow.name === oldRow.name &&
      newRow.description === oldRow.description
    ) {
      return oldRow // No change
    }

    const { error } = await supabase
      .from("keyboards")
      .update({
        name: newRow.name,
        description: newRow.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", newRow.id)

    if (error) {
      console.error("Supabase update error:", error.message)
      throw new Error("Failed to update row")
    }

    return { ...newRow, updated_at: new Date().toISOString() }
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 130,
      editable: true,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      editable: true,
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      minWidth: 180,
      valueFormatter: value => {
        return new Date(value).toLocaleString()
      },
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      flex: 1,
      minWidth: 180,
      valueFormatter: value => new Date(value).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              void navigate("/keyboards/" + params.row.id)
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={event => {
              event.stopPropagation()
              event.preventDefault()
              void handleDeleteKeyboard(params.row.id)
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ]

  const paginationModel = { page: 0, pageSize: 10 }

  return (
    <Box>
      <CssBaseline />
      <Paper sx={{ flexGrow: 1, flexDirection: "row", m: 3 }}>
        <DataGrid
          searchable
          rows={keyboards}
          loading={loading}
          columns={columns}
          showToolbar={true}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20]}
          checkboxSelection
          sx={{ border: 0 }}
          disableColumnFilter={true}
          disableColumnSelector={true}
          processRowUpdate={handleRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
          onProcessRowUpdateError={error => {
            console.error("Row update error", error)
          }}
          flex={1}
        />
      </Paper>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            void handleAddKeyboard()
          }}
        >
          Add Keyboard
        </Button>
      </Box>{" "}
    </Box>
  )
}

export default Keyboards
