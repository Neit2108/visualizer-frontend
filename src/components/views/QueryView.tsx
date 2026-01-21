/**
 * Query View - SQL Query editor for SELECT queries
 */

import { motion } from 'motion/react';
import { SqlEditor } from '../SqlEditor';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { useVisualizeQuery } from '@/hooks/useApi';

export function QueryView() {
  const { querySQL, setQuerySQL, isExecuting, executionError, tables } = useAppStore();
  const visualizeQuery = useVisualizeQuery();

  const handleVisualize = () => {
    if (querySQL.trim()) {
      visualizeQuery.mutate(querySQL);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/20">
              3
            </span>
            Viết Query Của Bạn
          </h2>
          <p className="text-zinc-400 mt-3 ml-16">
            Viết một query để hiển thị luồng thực thi của nó
          </p>
        </div>
        <Button
          onClick={handleVisualize}
          disabled={isExecuting || !querySQL.trim()}
          size="lg"
          className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang thực thi...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Hiển thị
            </>
          )}
        </Button>
      </div>

      {/* Available Tables */}
      {tables.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-zinc-500">Bảng có sẵn:</span>
          {tables.map((table) => (
            <span
              key={table.name}
              className="px-2 py-1 bg-zinc-800/50 text-zinc-300 text-sm rounded-lg border border-white/10 font-mono"
            >
              {table.name}
            </span>
          ))}
        </div>
      )}

      {/* Editor */}
      <SqlEditor
        value={querySQL}
        onChange={setQuerySQL}
        onExecute={handleVisualize}
        height="300px"
      />

      {/* Error */}
      {executionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-300">Lỗi Query</h4>
              <pre className="text-sm text-red-200/80 mt-1 whitespace-pre-wrap font-mono">{executionError}</pre>
            </div>
          </div>
        </motion.div>
      )}

      {/* SQL Execution Order Info */}
      <div className="bg-zinc-900/30 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-zinc-200">Thứ Tự Thực Thi SQL</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[
            { order: 1, name: 'FROM', color: '#3B82F6' },
            { order: 2, name: 'JOIN', color: '#8B5CF6' },
            { order: 3, name: 'WHERE', color: '#EF4444' },
            { order: 4, name: 'GROUP BY', color: '#F59E0B' },
            { order: 5, name: 'HAVING', color: '#F97316' },
            { order: 6, name: 'SELECT', color: '#10B981' },
            { order: 7, name: 'DISTINCT', color: '#06B6D4' },
            { order: 8, name: 'ORDER BY', color: '#6366F1' },
            { order: 9, name: 'LIMIT', color: '#EC4899' },
          ].map((step, index, arr) => (
            <div key={step.name} className="flex items-center gap-3">
              <span
                className="px-4 py-1.5 rounded-xl text-sm font-medium text-white shadow-sm"
                style={{ backgroundColor: step.color }}
              >
                {step.order}. {step.name}
              </span>
              {index < arr.length - 1 && (
                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-500 mt-5">
          Đây là thứ tự logic trong đó các câu lệnh SQL được xử lý, không phải là thứ tự xuất hiện trong query của bạn.
        </p>
      </div>

      {/* Example Queries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ExampleCard
          title="Lọc dữ liệu"
          query="SELECT * FROM users WHERE age > 25;"
          description="Lọc dữ liệu dựa trên điều kiện"
          onClick={(q) => setQuerySQL(q)}
        />
        <ExampleCard
          title="Kết nối bảng"
          query="SELECT u.name, d.name as dept FROM users u JOIN departments d ON u.department_id = d.id;"
          description="Kết nối dữ liệu từ nhiều bảng"
          onClick={(q) => setQuerySQL(q)}
        />
        <ExampleCard
          title="Tổng hợp dữ liệu"
          query="SELECT department_id, COUNT(*) as count FROM users GROUP BY department_id;"
          description="Nhóm và đếm dữ liệu"
          onClick={(q) => setQuerySQL(q)}
        />
        <ExampleCard
          title="Sắp xếp kết quả"
          query="SELECT * FROM users ORDER BY age DESC LIMIT 3;"
          description="Sắp xếp và giới hạn kết quả"
          onClick={(q) => setQuerySQL(q)}
        />
      </div>
    </motion.div>
  );
}

interface ExampleCardProps {
  title: string;
  query: string;
  description: string;
  onClick: (query: string) => void;
}

function ExampleCard({ title, query, description, onClick }: ExampleCardProps) {
  return (
    <button
      onClick={() => onClick(query)}
      className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-violet-500/30 hover:bg-zinc-900/70 transition-all text-left group"
    >
      <h4 className="font-semibold text-zinc-200 group-hover:text-violet-300 transition-colors">
        {title}
      </h4>
      <p className="text-sm text-zinc-500 mt-2">{description}</p>
      <code className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-3 py-2 rounded-lg block mt-3 overflow-x-auto">
        {query}
      </code>
    </button>
  );
}
