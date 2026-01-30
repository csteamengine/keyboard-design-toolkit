import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "../app/supabaseClient.ts"
import {
  useCreateKeyboard,
  useDeleteKeyboard,
  useFetchKeyboards,
} from "../context/EditorContext.tsx"
import type { Keyboard } from "../types/KeyboardTypes.ts"
import { useSession } from "../context/SessionContext.tsx"
import { Button, Checkbox, Card, Input } from "../components/ui"

const Keyboards: React.FC = () => {
  const navigate = useNavigate()
  const fetchKeyboards = useFetchKeyboards()
  const [keyboards, setKeyboards] = useState<Keyboard[]>([])
  const deleteKeyboard = useDeleteKeyboard()
  const createKeyboard = useCreateKeyboard()
  const [loading, setLoading] = useState(true)
  const { session, user } = useSession()

  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Editable cell state
  const [editingCell, setEditingCell] = useState<{
    id: string
    field: "name" | "description"
  } | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    const loadKeyboards = async () => {
      const { data, error } = await fetchKeyboards()

      if (error) {
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

  const startEditing = (id: string, field: "name" | "description", value: string) => {
    setEditingCell({ id, field })
    setEditValue(value)
  }

  const handleSaveEdit = useCallback(async () => {
    if (!editingCell) return

    const keyboard = keyboards.find(k => k.id === editingCell.id)
    if (!keyboard) return

    // Only save if the value changed
    if (
      (editingCell.field === "name" && editValue === keyboard.name) ||
      (editingCell.field === "description" && editValue === keyboard.description)
    ) {
      setEditingCell(null)
      return
    }

    const { error } = await supabase
      .from("keyboards")
      .update({
        [editingCell.field]: editValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingCell.id)

    if (error) {
      console.error("Supabase update error:", error.message)
    } else {
      setKeyboards(prev =>
        prev.map(k =>
          k.id === editingCell.id
            ? { ...k, [editingCell.field]: editValue, updated_at: new Date().toISOString() }
            : k
        )
      )
    }

    setEditingCell(null)
  }, [editingCell, editValue, keyboards])

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const columns = useMemo<ColumnDef<Keyboard>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const isEditing =
            editingCell?.id === row.original.id && editingCell?.field === "name"
          if (isEditing) {
            return (
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") void handleSaveEdit()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                onBlur={() => void handleSaveEdit()}
                autoFocus
                className="py-0 text-sm"
              />
            )
          }
          return (
            <span
              onClick={() => startEditing(row.original.id, "name", row.original.name)}
              className="cursor-pointer hover:text-text-primary transition-colors"
            >
              {row.original.name}
            </span>
          )
        },
        minSize: 130,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const isEditing =
            editingCell?.id === row.original.id && editingCell?.field === "description"
          if (isEditing) {
            return (
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") void handleSaveEdit()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                onBlur={() => void handleSaveEdit()}
                autoFocus
                className="py-0 text-sm"
              />
            )
          }
          return (
            <span
              onClick={() =>
                startEditing(row.original.id, "description", row.original.description ?? "")
              }
              className="cursor-pointer hover:text-text-primary transition-colors"
            >
              {row.original.description ?? "—"}
            </span>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
        minSize: 180,
      },
      {
        accessorKey: "updated_at",
        header: "Updated At",
        cell: ({ row }) => new Date(row.original.updated_at).toLocaleString(),
        minSize: 180,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              onClick={() => navigate("/keyboards/" + row.original.id)}
              className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={event => {
                event.stopPropagation()
                void handleDeleteKeyboard(row.original.id)
              }}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        size: 100,
        enableSorting: false,
      },
    ],
    [editingCell, editValue, handleSaveEdit, navigate]
  )

  const table = useReactTable({
    data: keyboards,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: row => row.id,
    enableRowSelection: true,
  })

  return (
    <div className="bg-bg-base min-h-full p-6">
      <Card variant="default" className="overflow-hidden p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-border bg-bg-subtle">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`
                        px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider
                        ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-text-primary" : ""}
                      `}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                        minWidth: header.column.columnDef.minSize,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4 opacity-30">
                                <ChevronUp className="w-4 h-2" />
                                <ChevronDown className="w-4 h-2 -mt-1" />
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                    Loading...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                    No keyboards found. Create one to get started!
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className={`
                      border-b border-border transition-colors
                      ${row.getIsSelected() ? "bg-indigo-500/15" : "hover:bg-bg-muted/50"}
                    `}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-text-secondary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-subtle">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="bg-bg-surface border border-border rounded px-2 py-1 text-text-secondary focus:outline-none focus:border-indigo-500"
            >
              {[10, 20, 50].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">
              {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, keyboards.length)} of{" "}
              {keyboards.length}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center mt-6">
        <Button variant="primary" onClick={() => void handleAddKeyboard()}>
          Add Keyboard
        </Button>
      </div>
    </div>
  )
}

export default Keyboards
