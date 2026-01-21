/**
 * Setup View - SQL Editor for creating tables and inserting data
 */

import { motion } from 'motion/react';
import { Code, Plus, Link as LinkIcon, PlayIcon } from 'lucide-react';
import { SqlEditor } from '../SqlEditor';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { useExecuteSQL } from '@/hooks/useApi';

export function SetupView() {
  const { setupSQL, setSetupSQL, isExecuting, executionError, executionMessage } = useAppStore();
  const executeSQL = useExecuteSQL();

  const handleExecute = () => {
    if (setupSQL.trim()) {
      executeSQL.mutate(setupSQL);
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
            <span className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-lg shadow-lg shadow-violet-500/20">
              1
            </span>
            Tạo Cơ Sở Dữ Liệu Của Riêng Bạn
          </h2>
          <p className="text-zinc-400 mt-3 ml-16">
            Viết SQL để tạo bảng và thêm dữ liệu mẫu. Điều này sẽ thiết lập cơ sở dữ liệu trong bộ nhớ.
          </p>
        </div>
        <Button
          onClick={handleExecute}
          disabled={isExecuting || !setupSQL.trim()}
          size="lg"
          className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-6"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang thực thi...
            </>
          ) : (
            <>
              {/* <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg> */}
              <PlayIcon className="w-5 h-5" />
              Chạy SQL
            </>
          )}
        </Button>
      </div>

      {/* Editor */}
      <SqlEditor
        value={setupSQL}
        onChange={setSetupSQL}
        onExecute={handleExecute}
        height="400px"
      />

      {/* Messages */}
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
              <h4 className="font-semibold text-red-300">Lỗi Thực Thi</h4>
              <pre className="text-sm text-red-200/80 mt-1 whitespace-pre-wrap font-mono">{executionError}</pre>
            </div>
          </div>
        </motion.div>
      )}

      {executionMessage && !executionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-emerald-300">Thành Công</h4>
              <pre className="text-sm text-emerald-200/80 mt-1 whitespace-pre-wrap font-mono">{executionMessage}</pre>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <HelpCard
          icon={Code}
          title="Tạo Bảng"
          description="Định nghĩa cấu trúc bảng với các cột và ràng buộc"
          example="CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);"
        />
        <HelpCard
          icon={Plus}
          title="Thêm Dữ Liệu"
          description="Thêm dữ liệu vào bảng với dữ liệu mẫu"
          example="INSERT INTO users VALUES (1, 'Alice');"
        />
        <HelpCard
          icon={LinkIcon}
          title="Quan Hệ Giữa Các Bảng"
          description="Tạo quan hệ giữa các bảng"
          example="FOREIGN KEY (user_id) REFERENCES users(id)"
        />
      </div>
    </motion.div>
  );
}

interface HelpCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  example: string;
}

function HelpCard({ icon: Icon, title, description, example }: HelpCardProps) {
  return (
    <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6 text-violet-400" />
        <h4 className="font-semibold text-zinc-200">{title}</h4>
      </div>
      <p className="text-sm text-zinc-400 mb-4">{description}</p>
      <code className="text-xs font-mono text-violet-300 bg-zinc-800/50 px-3 py-2 rounded-lg block overflow-x-auto">
        {example}
      </code>
    </div>
  );
}
