import React, { useEffect } from "react"
import { CssBaseline, Box, Button, Paper, IconButton } from "@mui/material"
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridToolbar,
} from "@mui/x-data-grid"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { useAppSelector } from "../app/hooks.ts"
import type { RootState } from "../app/store.ts"
import WelcomePage from "./WelcomePage.tsx"
import { supabase } from "../app/supabaseClient.ts"
import { useNavigate } from "react-router-dom"

const Keyboards: React.FC = () => {
  const session = useAppSelector((state: RootState) => state.auth.session)
  const user = useAppSelector((state: RootState) => state.auth.user)
  const [keyboards, setKeyboards] = React.useState<any[]>(null)
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
        setKeyboards(data || [])
      }
    }
    void fetchKeyboards()
  }, [user, session])

  if (!session) return <WelcomePage />

  const handleAddKeyboard = async () => {
    const { data, error } = await supabase
      .from("keyboards")
      .insert({
        name: "New Keyboard",
        reactflow: {
          nodes: [
            {
              id: "1",
              type: "default",
              position: { x: 100, y: 100 },
              data: { label: "Key: A" },
            },
            {
              id: "2",
              type: "default",
              position: { x: 250, y: 100 },
              data: { label: "Key: B" },
            },
            {
              id: "3",
              type: "default",
              position: { x: 400, y: 100 },
              data: { label: "Key: C" },
            },
          ],
          edges: [
            {
              id: "e1-2",
              source: "1",
              target: "2",
              type: "smoothstep",
            },
            {
              id: "e2-3",
              source: "2",
              target: "3",
              type: "smoothstep",
            },
          ],
        },
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

  const handleDeleteKeyboard = async (keyboardId: string) => {
    if (!window.confirm("Are you sure you want to delete this keyboard?"))
      return

    const { error } = await supabase
      .from("keyboards")
      .delete()
      .eq("id", keyboardId)

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
            onClick={() => navigate("/keyboards/" + params.row.id)}
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

  const paginationModel = { page: 0, pageSize: 5 }

  return (
    <Box>
      <CssBaseline />
      <Paper sx={{ height: 400, flexGrow: 1, flexDirection: "row", m: 3 }}>
        <DataGrid
          searchable
          rows={keyboards}
          loading={keyboards === null}
          columns={columns}
          showToolbar={true}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
          disableColumnFilter={true}
          disableColumnSelector={true}
          processRowUpdate={handleRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
          onProcessRowUpdateError={error =>
            console.error("Row update error", error)
          }
          flex={1}
        />
      </Paper>
      <Button onClick={handleAddKeyboard}>Add Keyboard</Button>
    </Box>
  )
}

export default Keyboards
