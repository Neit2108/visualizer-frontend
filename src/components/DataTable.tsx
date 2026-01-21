/**
 * Data Table Component using TanStack Table
 */

import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { RowState } from '@/api/types';

interface DataTableProps {
  columns: string[];
  rows: RowState[];
  tableName?: string;
  showExcludedRows?: boolean;
  highlightIncluded?: boolean;
}

export function DataTable({
  columns,
  rows,
  tableName,
  showExcludedRows = true,
  highlightIncluded = false,
}: DataTableProps) {
  const columnHelper = createColumnHelper<RowState>();

  const tableColumns = useMemo<ColumnDef<RowState, unknown>[]>(() => {
    return columns.map((col) =>
      columnHelper.accessor((row) => row.data[col], {
        id: col,
        header: () => (
          <span className="font-semibold text-zinc-200">{col}</span>
        ),
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;
          return (
            <span
              className={cn(
                'transition-colors duration-300',
                !row.included && highlightIncluded && 'text-zinc-600'
              )}
            >
              {value === null ? (
                <span className="text-zinc-500 italic">NULL</span>
              ) : (
                String(value)
              )}
            </span>
          );
        },
      })
    );
  }, [columns, columnHelper, highlightIncluded]);

  const filteredRows = useMemo(() => {
    if (showExcludedRows) return rows;
    return rows.filter((row) => row.included);
  }, [rows, showExcludedRows]);

  const table = useReactTable({
    data: filteredRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50">
      {tableName && (
        <div className="px-5 py-3 bg-zinc-800/50 border-b border-white/10">
          <h3 className="font-semibold text-zinc-200 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {tableName}
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/10 bg-zinc-800/30">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-4 text-left text-sm font-medium text-zinc-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ 
                    opacity: row.original.included || !highlightIncluded ? 1 : 0.4,
                    y: 0,
                    backgroundColor: row.original.included && highlightIncluded 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'transparent'
                  }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.03,
                    ease: 'easeOut'
                  }}
                  className={cn(
                    'border-b border-white/5 hover:bg-white/5 transition-colors',
                    !row.original.included && highlightIncluded && 'line-through decoration-zinc-600'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4 text-sm text-zinc-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {rows.length > 0 && (
        <div className="px-5 py-3 bg-zinc-800/30 border-t border-white/10 text-xs text-zinc-500">
          {highlightIncluded ? (
            <span>
              Hiển thị {rows.filter((r) => r.included).length} trên {rows.length} dòng
            </span>
          ) : (
            <span>{filteredRows.length} dòng</span>
          )}
        </div>
      )}
    </div>
  );
}

// Simple table for displaying TableData without RowState
interface SimpleTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  tableName?: string;
}

export function SimpleTable({ columns, rows, tableName }: SimpleTableProps) {
  const rowStates: RowState[] = rows.map((row) => ({
    data: row,
    included: true,
  }));

  return (
    <DataTable
      columns={columns}
      rows={rowStates}
      tableName={tableName}
      showExcludedRows={true}
      highlightIncluded={false}
    />
  );
}
