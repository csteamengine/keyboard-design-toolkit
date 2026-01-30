import { useState, useMemo } from "react"
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
import { Checkbox } from "./Checkbox"

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  loading?: boolean
  enableRowSelection?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onRowSelectionChange?: (rows: T[]) => void
  onRowClick?: (row: T) => void
  getRowId?: (row: T) => string
}

export function DataTable<T>({
  data,
  columns: userColumns,
  loading = false,
  enableRowSelection = false,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  onRowSelectionChange,
  onRowClick,
  getRowId,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  })

  // Add selection column if enabled
  const columns = useMemo(() => {
    if (!enableRowSelection) return userColumns

    const selectionColumn: ColumnDef<T, unknown> = {
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
    }

    return [selectionColumn, ...userColumns]
  }, [userColumns, enableRowSelection])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      if (onRowSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => data[parseInt(key)])
          .filter(Boolean)
        onRowSelectionChange(selectedRows)
      }
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getRowId: getRowId as ((row: T) => string) | undefined,
    enableRowSelection,
    enableSorting,
  })

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-bg-subtle">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`
                      px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider
                      ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-text-primary" : ""}
                    `}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
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
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-border transition-colors
                    ${row.getIsSelected() ? "bg-indigo-500/15" : "hover:bg-bg-muted/50"}
                    ${onRowClick ? "cursor-pointer" : ""}
                  `}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-text-secondary"
                    >
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
      {enablePagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-subtle">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="bg-bg-surface border border-border rounded px-2 py-1 text-text-secondary focus:outline-none focus:border-indigo-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">
              {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                data.length
              )}{" "}
              of {data.length}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
