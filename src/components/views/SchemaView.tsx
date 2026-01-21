/**
 * Schema View - Displays tables and ER diagram
 */

import { motion } from 'motion/react';
import { SimpleTable } from '../DataTable';
import { ERDiagramView, SingleTableView } from '../ERDiagram';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';

export function SchemaView() {
  const { tables, tableData, erDiagram, setCurrentView } = useAppStore();

  if (tables.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">Không có bảng nào</h3>
        <p className="text-zinc-500 mb-6">Tạo một số bảng để xem cấu trúc</p>
        <Button onClick={() => setCurrentView('setup')} variant="outline">
          Đến Setup
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              2
            </span>
            Cấu Trúc Cơ Sở Dữ Liệu
          </h2>
          <p className="text-zinc-400 mt-2">
            {tables.length === 1
              ? 'Cấu trúc và dữ liệu của bảng'
              : `${tables.length} bảng với quan hệ giữa chúng`}
          </p>
        </div>
        <Button
          onClick={() => setCurrentView('query')}
          size="lg"
          className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Viết Query
        </Button>
      </div>

      {/* ER Diagram or Single Table */}
      <div className="bg-zinc-900/30 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="font-semibold text-zinc-200">
            {erDiagram ? 'Biểu Đồ Quan Hệ' : 'Cấu Trúc Bảng'}
          </h3>
        </div>

        {erDiagram ? (
          <ERDiagramView erDiagram={erDiagram} height="400px" />
        ) : tables.length === 1 ? (
          <SingleTableView table={tables[0]} />
        ) : null}
      </div>

      {/* Table Data */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <h3 className="font-semibold text-zinc-200">Dữ Liệu Bảng</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tableData.map((table, index) => (
            <motion.div
              key={table.tableName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SimpleTable
                columns={table.columns}
                rows={table.rows}
                tableName={table.tableName}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
