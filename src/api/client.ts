/**
 * SQL Visualization API Client
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiError,
  Session,
  CreateSessionResponse,
  SessionStatsResponse,
  ExecuteSQLResponse,
  GetTablesResponse,
  TableData,
  VisualizeQueryResponse,
  DatabaseMonitoringData,
  FeedbackMonitoringData,
  SystemStatusData,
} from './types';

// ============================================
// Configuration
// ============================================

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiClientConfig {
  baseUrl?: string;
  onError?: (error: ApiError) => void;
  onSessionExpired?: () => void;
}

let config: ApiClientConfig = {
  baseUrl: DEFAULT_BASE_URL,
};

export function configureApi(newConfig: ApiClientConfig): void {
  config = { ...config, ...newConfig };
}

// ============================================
// Axios Instance
// ============================================

const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: config.baseUrl || DEFAULT_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// ============================================
// Error Handling
// ============================================

export class ApiClientError extends Error {
  readonly code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

// ============================================
// Request Helper
// ============================================

async function request<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'DELETE';
    data?: unknown;
  }
): Promise<T> {
  const axiosInstance = createAxiosInstance();

  try {
    const response = await axiosInstance.request<ApiResponse<T>>({
      url: endpoint,
      method: options?.method || 'GET',
      data: options?.data,
    });

    const responseData = response.data;

    if (!responseData.success) {
      const error = responseData.error;
      const errorCode = error?.code ?? 'UNKNOWN_ERROR';
      const errorMessage = error?.message ?? 'Unknown error';
      const errorDetails = error?.details;

      if (errorCode === 'SESSION_NOT_FOUND' && config.onSessionExpired) {
        config.onSessionExpired();
      }

      if (config.onError && error) {
        config.onError(error);
      }

      throw new ApiClientError(errorCode, errorMessage, errorDetails);
    }

    return responseData.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    const axiosError = error as AxiosError<ApiResponse<T>>;
    
    if (axiosError.response?.data?.error) {
      const apiError = axiosError.response.data.error;
      if (config.onError) {
        config.onError(apiError as ApiError);
      }
      throw new ApiClientError(apiError.code, apiError.message, apiError.details);
    }

    const errorMessage = error instanceof Error ? error.message : 'Network request failed';
    const networkError = new ApiClientError('NETWORK_ERROR', errorMessage);

    if (config.onError) {
      config.onError({ code: 'NETWORK_ERROR', message: errorMessage });
    }

    throw networkError;
  }
}

// ============================================
// API Methods
// ============================================

export const api = {
  // Sessions
  createSession: (): Promise<CreateSessionResponse> =>
    request<CreateSessionResponse>('/api/sessions', { method: 'POST' }),

  getSession: (sessionId: string): Promise<Session> =>
    request<Session>(`/api/sessions/${sessionId}`),

  deleteSession: (sessionId: string): Promise<{ deleted: boolean }> =>
    request<{ deleted: boolean }>(`/api/sessions/${sessionId}`, { method: 'DELETE' }),

  listSessions: (): Promise<SessionStatsResponse> =>
    request<SessionStatsResponse>('/api/sessions'),

  // SQL Execution
  executeSQL: (sessionId: string, sql: string): Promise<ExecuteSQLResponse> =>
    request<ExecuteSQLResponse>('/api/sql/execute', {
      method: 'POST',
      data: { sessionId, sql },
    }),

  executeMultipleSQL: (sessionId: string, sql: string): Promise<ExecuteSQLResponse[]> =>
    request<ExecuteSQLResponse[]>('/api/sql/execute-multiple', {
      method: 'POST',
      data: { sessionId, sql },
    }),

  // Tables
  getTables: (sessionId: string): Promise<GetTablesResponse> =>
    request<GetTablesResponse>(`/api/sql/tables/${sessionId}`),

  getTableData: (sessionId: string, tableName: string): Promise<TableData> =>
    request<TableData>(`/api/sql/tables/${sessionId}/${tableName}`),

  // Visualization
  visualizeQuery: (sessionId: string, query: string): Promise<VisualizeQueryResponse> =>
    request<VisualizeQueryResponse>('/api/sql/visualize', {
      method: 'POST',
      data: { sessionId, query },
    }),

  // Health
  healthCheck: (): Promise<{ status: string; timestamp: string }> =>
    request<{ status: string; timestamp: string }>('/api/health'),

  // Monitoring
  getDatabaseStatus: (): Promise<DatabaseMonitoringData> =>
    request<DatabaseMonitoringData>('/api/monitoring/database'),

  getFeedbackStatus: (): Promise<FeedbackMonitoringData> =>
    request<FeedbackMonitoringData>('/api/monitoring/feedback'),

  getSystemStatus: (): Promise<SystemStatusData> =>
    request<SystemStatusData>('/api/monitoring/status'),
};

// ============================================
// Session Management Helpers
// ============================================

const SESSION_STORAGE_KEY = 'sql-viz-session-id';

export async function initSession(): Promise<string> {
  const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

  if (existingSessionId) {
    try {
      await api.getSession(existingSessionId);
      return existingSessionId;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  const { sessionId } = await api.createSession();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function getStoredSessionId(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export type {
  ApiResponse,
  ApiError,
  Session,
  CreateSessionResponse,
  SessionStatsResponse,
  ExecuteSQLResponse,
  GetTablesResponse,
  TableData,
  TableSchema,
  ColumnDefinition,
  ERDiagram,
  ERRelationship,
  VisualizeQueryResponse,
  QueryVisualization,
  ExecutionStep,
  ExecutionStepType,
  DataFlowStep,
  RowState,
  DatabaseMonitoringData,
  FeedbackMonitoringData,
  SystemStatusData,
  DatabasePoolStats,
  FeedbackCategoryBreakdown,
  RecentFeedbackActivity,
  DatabaseStatus,
} from './types';
