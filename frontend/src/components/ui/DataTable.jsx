import { useTable, createCoreRowModel, flexRender } from '@tanstack/react-table'
import { cn } from '../../lib/utils'

export const DataTable = ({ data, columns, isLoading = false, emptyMessage = 'No data found', className }) => {
  const table = useTable({
    data: data || [],
    columns,
    getCoreRowModel: createCoreRowModel(),
  })

  const colCount = table.getAllLeafColumns().length

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="max-h-[calc(100vh-280px)] overflow-auto">
        <table className="w-full text-sm" aria-label="data table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-6">
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
                    ))}
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors last:border-0 hover:bg-muted/50"
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
