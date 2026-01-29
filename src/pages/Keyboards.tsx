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

    const { error } = await deleteKeyboard(keyboardId)

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
            sx={{
              color: "#6366f1",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              },
            }}
            onClick={() => {
              void navigate("/keyboards/" + params.row.id)
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: "#ef4444",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              },
            }}
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
    <Box sx={{ backgroundColor: "#0a0a0b", minHeight: "100%" }}>
      <CssBaseline />
      <Paper
        sx={{
          flexGrow: 1,
          flexDirection: "row",
          m: 3,
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
        }}
      >
        <DataGrid
          rows={keyboards}
          loading={loading}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20]}
          checkboxSelection
          disableColumnFilter={true}
          disableColumnSelector={true}
          processRowUpdate={handleRowUpdate}
          onProcessRowUpdateError={error => {
            console.error("Row update error", error)
          }}
          sx={{
            border: 0,
            backgroundColor: "#18181b",
            color: "#fafafa",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#111113",
              borderBottom: "1px solid #27272a",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "#a1a1aa",
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #27272a",
              color: "#a1a1aa",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#1f1f23",
            },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.2)",
              },
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#111113",
              borderTop: "1px solid #27272a",
            },
            "& .MuiTablePagination-root": {
              color: "#a1a1aa",
            },
            "& .MuiCheckbox-root": {
              color: "#3f3f46",
              "&.Mui-checked": {
                color: "#6366f1",
              },
            },
            "& .MuiDataGrid-columnSeparator": {
              color: "#27272a",
            },
            "& .MuiDataGrid-menuIcon": {
              color: "#a1a1aa",
            },
            "& .MuiDataGrid-sortIcon": {
              color: "#a1a1aa",
            },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
              {
                outline: "none",
              },
          }}
        />
      </Paper>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          onClick={() => {
            void handleAddKeyboard()
          }}
          sx={{
            background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)",
            },
          }}
        >
          Add Keyboard
        </Button>
      </Box>
    </Box>
  )
}

export default Keyboards
