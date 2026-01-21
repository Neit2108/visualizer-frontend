/**
 * SQL Visualization API - Frontend TypeScript Types
 */

// ============================================
// Base API Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'SQL_EXECUTION_ERROR'
  | 'SQL_PARSE_ERROR'
  | 'SESSION_NOT_FOUND'
  | 'INVALID_SESSION'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================
// Session Types
// ============================================

export interface Session {
  id: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface SessionStatsResponse {
  activeSessionCount: number;
  sessions: Session[];
}

// ============================================
// Table Schema Types
// ============================================

export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  defaultValue?: string;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
}

export interface TableData {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

// ============================================
// ER Diagram Types
// ============================================

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

export interface ERRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: RelationshipType;
}

export interface ERDiagram {
  tables: TableSchema[];
  relationships: ERRelationship[];
}

export interface GetTablesResponse {
  tables: TableSchema[];
  tableData: TableData[];
  erDiagram?: ERDiagram;
}

// ============================================
// SQL Execution Types
// ============================================

export interface ExecuteSQLRequest {
  sessionId: string;
  sql: string;
}

export interface ExecuteSQLResponse {
  success: boolean;
  message: string;
  affectedTables?: string[];
  data?: TableData;
}

// ============================================
// Query Visualization Types
// ============================================

export type ExecutionStepType =
  | 'FROM'
  | 'JOIN'
  | 'WHERE'
  | 'GROUP BY'
  | 'HAVING'
  | 'SELECT'
  | 'DISTINCT'
  | 'ORDER BY'
  | 'LIMIT'
  | 'OFFSET';

export interface ExecutionStep {
  order: number;
  type: ExecutionStepType;
  clause: string;
  description: string;
}

export interface RowState {
  data: Record<string, unknown>;
  included: boolean;
  excludedReason?: string;
}

export interface DataFlowStep {
  stepOrder: number;
  stepType: ExecutionStepType;
  rows: RowState[];
  columns: string[];
  description: string;
  stats: {
    totalRows: number;
    includedRows: number;
    excludedRows: number;
  };
}

export interface QueryVisualization {
  originalQuery: string;
  executionSteps: ExecutionStep[];
  dataFlow: DataFlowStep[];
  finalResult: TableData;
}

export interface VisualizeQueryRequest {
  sessionId: string;
  query: string;
}

export interface VisualizeQueryResponse {
  visualization: QueryVisualization;
}

// ============================================
// Utility Types
// ============================================

export type RowData = Record<string, unknown>;

// ============================================
// Constants
// ============================================

export const EXECUTION_ORDER: ExecutionStepType[] = [
  'FROM',
  'JOIN',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'SELECT',
  'DISTINCT',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
];

export const STEP_DESCRIPTIONS: Record<ExecutionStepType, string> = {
  FROM: 'Load data from table(s)',
  JOIN: 'Combine rows from joined tables',
  WHERE: 'Filter rows based on conditions',
  'GROUP BY': 'Group rows by specified columns',
  HAVING: 'Filter groups based on aggregate conditions',
  SELECT: 'Choose which columns to include',
  DISTINCT: 'Remove duplicate rows',
  'ORDER BY': 'Sort the result set',
  LIMIT: 'Restrict the number of rows',
  OFFSET: 'Skip specified number of rows',
};

export const STEP_COLORS: Record<ExecutionStepType, string> = {
  FROM: '#3B82F6',
  JOIN: '#8B5CF6',
  WHERE: '#EF4444',
  'GROUP BY': '#F59E0B',
  HAVING: '#F97316',
  SELECT: '#10B981',
  DISTINCT: '#06B6D4',
  'ORDER BY': '#6366F1',
  LIMIT: '#EC4899',
  OFFSET: '#84CC16',
};

// ============================================
// Monitoring Types
// ============================================

export interface DatabasePoolStats {
  active: number;
  idle: number;
  waiting: number;
  total: number;
  limit: number;
  utilization: number;
}

export interface DatabaseMonitoringData {
  connected: boolean;
  pool: DatabasePoolStats;
  responseTime: number;
  lastChecked: string;
  error?: string;
}

export interface FeedbackCategoryBreakdown {
  bug: number;
  feature: number;
  improvement: number;
  other: number;
}

export interface RecentFeedbackActivity {
  last24h: number;
  last7d: number;
  last30d: number;
}

export interface FeedbackMonitoringData {
  total: number;
  recent: RecentFeedbackActivity;
  byCategory: FeedbackCategoryBreakdown;
  averageRating: number;
  uniqueContacts: number;
  lastSubmission: string | null;
}

export type DatabaseStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface SystemStatusData {
  database: {
    status: DatabaseStatus;
    connected: boolean;
    poolUtilization: number;
  };
  api: {
    status: 'available';
    uptime: number;
  };
  feedback: {
    totalSubmissions: number;
    recentActivity: boolean;
  };
  timestamp: string;
}
