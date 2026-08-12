import { cn } from '@/lib/utils'
import type { Column } from '@/types'

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'Tidak ada data',
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200 bg-white', className)}>
      <table className="data-table w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
