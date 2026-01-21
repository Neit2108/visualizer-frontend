/**
 * Main Layout Component with Navigation
 */

import { motion } from 'motion/react';
import { FileText, Database, Search, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, type AppView } from '@/store';
import { useHealthCheck } from '@/hooks/useApi';
import { FeedbackFAB } from '@/components/FeedbackFAB';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentView, setCurrentView, tables, visualization, isSessionLoading, sessionError } = useAppStore();
  const healthCheck = useHealthCheck();

  const navItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }[] = [
    { id: 'setup', label: 'Cài đặt', icon: FileText },
    { id: 'schema', label: 'Biểu đồ', icon: Database, disabled: tables.length === 0 },
    { id: 'query', label: 'Truy vấn', icon: Search, disabled: tables.length === 0 },
    { id: 'visualization', label: 'Hiểu rõ', icon: BarChart3, disabled: !visualization },
  ];

  return (
    <div className="min-h-screen w-full flex-1 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNzI3MmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWMThoMnY0em0tNiA2aC00djJoNHYtMnptLTYgMGgtNHYyaDR2LTJ6bTAgNmgtNHYyaDR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  SQL Visualizer
                </h1>
                <p className="text-xs text-zinc-500 hidden sm:block">Hiểu rõ truy vấn của bạn</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => !item.disabled && setCurrentView(item.id)}
                  disabled={item.disabled}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950',
                    currentView === item.id
                      ? 'text-white'
                      : item.disabled
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  )}
                >
                  {currentView === item.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-linear-to-r from-violet-600/80 to-fuchsia-600/80 rounded-lg"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </motion.button>
              ))}
            </nav>

            {/* Status */}
            <div className="flex items-center gap-3">
              {/* Health Status */}
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    healthCheck.data ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  )}
                />
                <span className={cn(
                  'hidden sm:inline',
                  healthCheck.data ? 'text-zinc-400' : 'text-red-400'
                )}>
                  {healthCheck.data ? 'Đang kết nối' : 'Mất kết nối'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Loading State */}
        {isSessionLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p className="text-zinc-400">Khởi tạo phiên...</p>
          </motion.div>
        )}

        {/* Session Error */}
        {sessionError && !isSessionLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-red-900/30 border border-red-500/30 rounded-xl mb-6"
          >
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-300">Lỗi kết nối</h3>
                <p className="text-sm text-red-200/80 mt-1">{sessionError}</p>
                <p className="text-xs text-red-300/60 mt-2">
                  Server không phản hồi. Vui lòng kiểm tra lại kết nối.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {!isSessionLoading && children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <p>SQL Visualization Tool</p>
            <p>Bấm <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">Ctrl+Enter</kbd> để chạy SQL</p>
          </div>
        </div>
      </footer>

      {/* Feedback FAB */}
      <FeedbackFAB />
    </div>
  );
}
