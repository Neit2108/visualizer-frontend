/**
 * Monitoring View - System Monitoring Dashboard
 */

import { motion } from 'motion/react';
import { 
  Activity, 
  Database, 
  MessageSquare, 
  Server, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { 
  useDatabaseMonitoring, 
  useFeedbackMonitoring, 
  useSystemStatus 
} from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import type { DatabaseStatus } from '@/api/types';

// ============================================
// Helper Functions
// ============================================

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTime(timestamp: string | null): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('vi-VN');
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: DatabaseStatus | 'available' }) {
  const config = {
    healthy: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Healthy' },
    degraded: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Degraded' },
    unhealthy: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Unhealthy' },
    available: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Available' },
  };
  
  const { bg, text, label } = config[status] || config.healthy;
  
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', bg, text)}>
      {label.toUpperCase()}
    </span>
  );
}

// ============================================
// Metric Card Component
// ============================================

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'violet' | 'emerald' | 'amber' | 'red' | 'blue';
}

function MetricCard({ icon: Icon, label, value, subtext, color = 'violet' }: MetricCardProps) {
  const colorClasses = {
    violet: 'from-violet-500 to-fuchsia-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    blue: 'from-blue-500 to-cyan-500',
  };
  
  return (
    <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl bg-linear-to-br flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      {subtext && <div className="text-xs text-zinc-500 mt-1">{subtext}</div>}
    </div>
  );
}

// ============================================
// Progress Bar Component
// ============================================

function ProgressBar({ value, max, color = 'violet' }: { value: number; max: number; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClass = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-amber-500' : 'bg-violet-500';
  
  return (
    <div className="w-full bg-zinc-800 rounded-full h-2.5">
      <div
        className={cn('h-2.5 rounded-full transition-all duration-500', colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ============================================
// Database Status Panel
// ============================================

function DatabaseStatusPanel() {
  const { data, isLoading, error, refetch } = useDatabaseMonitoring(5000);
  
  if (isLoading) {
    return (
      <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="p-6 bg-red-900/20 rounded-2xl border border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Không thể tải dữ liệu Database</span>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Database</h3>
            <p className="text-sm text-zinc-400">Connection Pool Status</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-3 h-3 rounded-full',
            data.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          )} />
          <span className={cn(
            'text-sm',
            data.connected ? 'text-emerald-400' : 'text-red-400'
          )}>
            {data.connected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Response Time */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Response Time</span>
          <span className={cn(
            'text-sm font-medium',
            data.responseTime < 50 ? 'text-emerald-400' : data.responseTime < 200 ? 'text-amber-400' : 'text-red-400'
          )}>
            {data.responseTime}ms
          </span>
        </div>
        
        {/* Pool Utilization */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Pool Utilization</span>
            <span className="text-sm font-medium text-zinc-200">{data.pool.utilization.toFixed(1)}%</span>
          </div>
          <ProgressBar value={data.pool.utilization} max={100} />
        </div>
        
        {/* Connection Details */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="text-center">
            <div className="text-xl font-bold text-violet-400">{data.pool.active}</div>
            <div className="text-xs text-zinc-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-400">{data.pool.idle}</div>
            <div className="text-xs text-zinc-500">Idle</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-400">{data.pool.waiting}</div>
            <div className="text-xs text-zinc-500">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-zinc-300">{data.pool.total}/{data.pool.limit}</div>
            <div className="text-xs text-zinc-500">Total/Limit</div>
          </div>
        </div>
        
        {data.error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{data.error}</span>
            </div>
          </div>
        )}
        
        <div className="text-xs text-zinc-600 mt-4">
          Last checked: {formatTime(data.lastChecked)}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Feedback Metrics Panel
// ============================================

function FeedbackMetricsPanel() {
  const { data, isLoading, error, refetch } = useFeedbackMonitoring(30000);
  
  if (isLoading) {
    return (
      <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="p-6 bg-red-900/20 rounded-2xl border border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Không thể tải dữ liệu Feedback</span>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Feedback</h3>
            <p className="text-sm text-zinc-400">User Submissions</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-zinc-800/50 rounded-xl">
          <div className="text-2xl font-bold text-zinc-100">{data.total}</div>
          <div className="text-xs text-zinc-500">Total Submissions</div>
        </div>
        <div className="p-4 bg-zinc-800/50 rounded-xl">
          <div className="text-2xl font-bold text-amber-400">
            {data.averageRating.toFixed(1)} ★
          </div>
          <div className="text-xs text-zinc-500">Average Rating</div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Recent Activity</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
            <div className="text-lg font-bold text-emerald-400">{data.recent.last24h}</div>
            <div className="text-xs text-zinc-500">24h</div>
          </div>
          <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{data.recent.last7d}</div>
            <div className="text-xs text-zinc-500">7 days</div>
          </div>
          <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
            <div className="text-lg font-bold text-violet-400">{data.recent.last30d}</div>
            <div className="text-xs text-zinc-500">30 days</div>
          </div>
        </div>
      </div>
      
      {/* By Category */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">By Category</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Bug</span>
            <span className="text-sm font-medium text-red-400">{data.byCategory.bug}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Feature</span>
            <span className="text-sm font-medium text-emerald-400">{data.byCategory.feature}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Improvement</span>
            <span className="text-sm font-medium text-blue-400">{data.byCategory.improvement}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Other</span>
            <span className="text-sm font-medium text-zinc-400">{data.byCategory.other}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-400">{data.uniqueContacts} unique contacts</span>
        </div>
      </div>
      
      {data.lastSubmission && (
        <div className="text-xs text-zinc-600 mt-3">
          Last submission: {formatTime(data.lastSubmission)}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// System Status Panel
// ============================================

function SystemStatusPanel() {
  const { data, isLoading, error, refetch } = useSystemStatus(10000);
  
  if (isLoading) {
    return (
      <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 animate-pulse col-span-full">
        <div className="h-6 bg-zinc-800 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="p-6 bg-red-900/20 rounded-2xl border border-red-500/30 col-span-full">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Không thể tải dữ liệu System Status</span>
        </div>
      </div>
    );
  }
  
  const getStatusIcon = (status: DatabaseStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 col-span-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">System Overview</h3>
            <p className="text-sm text-zinc-400">Combined Health Status</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Status */}
        <div className="p-5 bg-zinc-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-zinc-200">Database</span>
            </div>
            {getStatusIcon(data.database.status)}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Status</span>
              <StatusBadge status={data.database.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Connected</span>
              <span className={cn(
                'text-sm font-medium',
                data.database.connected ? 'text-emerald-400' : 'text-red-400'
              )}>
                {data.database.connected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Pool Usage</span>
              <span className="text-sm font-medium text-zinc-200">
                {data.database.poolUtilization.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* API Status */}
        <div className="p-5 bg-zinc-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-zinc-200">API</span>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Status</span>
              <StatusBadge status={data.api.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Uptime</span>
              <span className="text-sm font-medium text-emerald-400">
                {formatUptime(data.api.uptime)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Feedback Status */}
        <div className="p-5 bg-zinc-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <span className="font-medium text-zinc-200">Feedback</span>
            </div>
            {data.feedback.recentActivity ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <Clock className="w-5 h-5 text-zinc-500" />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="text-sm font-medium text-zinc-200">
                {data.feedback.totalSubmissions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Recent Activity</span>
              <span className={cn(
                'text-sm font-medium',
                data.feedback.recentActivity ? 'text-emerald-400' : 'text-zinc-500'
              )}>
                {data.feedback.recentActivity ? 'Active' : 'Quiet'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-zinc-600 mt-6 text-right">
        Last updated: {formatTime(data.timestamp)}
      </div>
    </motion.div>
  );
}

// ============================================
// Main Monitoring View
// ============================================

export function MonitoringView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="pb-2">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-4">
          <span className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6" />
          </span>
          System Monitoring
        </h2>
        <p className="text-zinc-400 mt-3 ml-16">
          Monitor database health, feedback metrics, and overall system status in real-time.
        </p>
      </div>

      {/* System Status Overview */}
      <SystemStatusPanel />
      
      {/* Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatabaseStatusPanel />
        <FeedbackMetricsPanel />
      </div>
    </motion.div>
  );
}
