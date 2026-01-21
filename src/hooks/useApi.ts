/**
 * React Query hooks for SQL Visualization API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, initSession } from '@/api/client';
import { useAppStore } from '@/store';
import type { 
  GetTablesResponse, 
  VisualizeQueryResponse,
  DatabaseMonitoringData,
  FeedbackMonitoringData,
  SystemStatusData,
} from '@/api/types';

// ============================================
// Query Keys
// ============================================

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const queryKeys = {
  session: (id: string | null) => ['session', id] as const,
  tables: (sessionId: string | null) => ['tables', sessionId] as const,
  health: ['health'] as const,
  monitoring: {
    database: ['monitoring', 'database'] as const,
    feedback: ['monitoring', 'feedback'] as const,
    status: ['monitoring', 'status'] as const,
  },
};

// ============================================
// Session Hooks
// ============================================

export function useInitSession() {
  const { setSessionId, setSessionLoading, setSessionError } = useAppStore();

  return useMutation({
    mutationFn: initSession,
    onSuccess: (sessionId) => {
      setSessionId(sessionId);
      setSessionLoading(false);
      setSessionError(null);
    },
    onError: (error) => {
      setSessionLoading(false);
      setSessionError(error instanceof Error ? error.message : 'Lỗi khi khởi tạo session');
    },
  });
}

// ============================================
// Tables Hooks
// ============================================

export function useTables(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.tables(sessionId),
    queryFn: () => api.getTables(sessionId!),
    enabled: !!sessionId,
    staleTime: 0,
  });
}

// ============================================
// SQL Execution Hooks
// ============================================

export function useExecuteSQL() {
  const queryClient = useQueryClient();
  const { 
    sessionId, 
    setIsExecuting, 
    setExecutionError, 
    setExecutionMessage,
    setTables,
    setTableData,
    setERDiagram,
    setCurrentView
  } = useAppStore();

  return useMutation({
    mutationFn: async (sql: string) => {
      if (!sessionId) throw new Error('No session');
      return api.executeMultipleSQL(sessionId, sql);
    },
    onMutate: () => {
      setIsExecuting(true);
      setExecutionError(null);
      setExecutionMessage(null);
    },
    onSuccess: async (results) => {
      // Show success messages
      const messages = results.map((r) => r.message).join('\n');
      setExecutionMessage(messages);

      // Refresh tables data
      if (sessionId) {
        try {
          const tablesResponse: GetTablesResponse = await api.getTables(sessionId);
          setTables(tablesResponse.tables);
          setTableData(tablesResponse.tableData);
          setERDiagram(tablesResponse.erDiagram || null);
          
          // Move to schema view if we have tables
          if (tablesResponse.tables.length > 0) {
            setCurrentView('schema');
          }
          
          // Invalidate cache
          queryClient.invalidateQueries({ queryKey: queryKeys.tables(sessionId) });
        } catch (error) {
          console.error('Lỗi khi làm mới bảng dữ liệu:', error);
        }
      }
    },
    onError: (error) => {
      setExecutionError(error instanceof Error ? error.message : 'Lỗi khi thực thi các query');
    },
    onSettled: () => {
      setIsExecuting(false);
    },
  });
}

// ============================================
// Query Visualization Hooks
// ============================================

export function useVisualizeQuery() {
  const { 
    sessionId, 
    setIsExecuting, 
    setExecutionError,
    setVisualization,
    setCurrentView
  } = useAppStore();

  return useMutation({
    mutationFn: async (query: string) => {
      if (!sessionId) throw new Error('No session');
      return api.visualizeQuery(sessionId, query);
    },
    onMutate: () => {
      setIsExecuting(true);
      setExecutionError(null);
    },
    onSuccess: (response: VisualizeQueryResponse) => {
      setVisualization(response.visualization);
      setCurrentView('visualization');
    },
    onError: (error) => {
      setExecutionError(error instanceof Error ? error.message : 'Lỗi khi hiển thị luồng thực thi query');
    },
    onSettled: () => {
      setIsExecuting(false);
    },
  });
}

// ============================================
// Health Check Hook
// ============================================

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.healthCheck,
    refetchInterval: 30000,
    retry: 3,
  });
}

// ============================================
// Session Cleanup Hook
// ============================================

export function useCleanupSession() {
  const { sessionId } = useAppStore();

  return () => {
    if (sessionId) {
      // Use navigator.sendBeacon for unload events to ensure request completes
      const sessionToDelete = sessionId;
      try {
        navigator.sendBeacon(
          `${DEFAULT_BASE_URL}/api/sessions/${sessionToDelete}`,
          JSON.stringify({ method: 'DELETE' })
        );
      } catch (error) {
        console.error('Lỗi khi xóa session:', error);
      }
    }
  };
}

// ============================================
// Monitoring Hooks
// ============================================

export function useDatabaseMonitoring(refetchInterval = 5000) {
  return useQuery<DatabaseMonitoringData>({
    queryKey: queryKeys.monitoring.database,
    queryFn: () => api.getDatabaseStatus(),
    refetchInterval,
    staleTime: 2000,
  });
}

export function useFeedbackMonitoring(refetchInterval = 30000) {
  return useQuery<FeedbackMonitoringData>({
    queryKey: queryKeys.monitoring.feedback,
    queryFn: () => api.getFeedbackStatus(),
    refetchInterval,
    staleTime: 10000,
  });
}

export function useSystemStatus(refetchInterval = 10000) {
  return useQuery<SystemStatusData>({
    queryKey: queryKeys.monitoring.status,
    queryFn: () => api.getSystemStatus(),
    refetchInterval,
    staleTime: 5000,
  });
}