/**
 * Zustand Store for SQL Visualization App
 */

import { create } from 'zustand';
import type {
  TableSchema,
  TableData,
  ERDiagram,
  QueryVisualization,
  ExecutionStep,
  DataFlowStep,
} from '@/api/types';

// ============================================
// App View State
// ============================================

export type AppView = 'setup' | 'schema' | 'query' | 'visualization';

interface AppState {
  // Session
  sessionId: string | null;
  isSessionLoading: boolean;
  sessionError: string | null;

  // View
  currentView: AppView;

  // SQL Editor
  setupSQL: string;
  querySQL: string;

  // Tables & Schema
  tables: TableSchema[];
  tableData: TableData[];
  erDiagram: ERDiagram | null;

  // Visualization
  visualization: QueryVisualization | null;
  currentStepIndex: number;

  // UI State
  isExecuting: boolean;
  executionError: string | null;
  executionMessage: string | null;

  // Actions
  setSessionId: (id: string | null) => void;
  setSessionLoading: (loading: boolean) => void;
  setSessionError: (error: string | null) => void;
  
  setCurrentView: (view: AppView) => void;
  
  setSetupSQL: (sql: string) => void;
  setQuerySQL: (sql: string) => void;
  
  setTables: (tables: TableSchema[]) => void;
  setTableData: (data: TableData[]) => void;
  setERDiagram: (diagram: ERDiagram | null) => void;
  
  setVisualization: (vis: QueryVisualization | null) => void;
  setCurrentStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setIsExecuting: (executing: boolean) => void;
  setExecutionError: (error: string | null) => void;
  setExecutionMessage: (message: string | null) => void;
  
  reset: () => void;
}

const initialSetupSQL = `-- Tạo bảng và thêm dữ liệu tại đây
-- Ví dụ:

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  department_id INTEGER
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  budget REAL
);

INSERT INTO users (id, name, age, department_id) VALUES
  (1, 'Alice', 30, 1),
  (2, 'Bob', 25, 1),
  (3, 'Charlie', 35, 2),
  (4, 'Diana', 28, 2),
  (5, 'Eve', 22, 1);

INSERT INTO departments (id, name, budget) VALUES
  (1, 'Engineering', 500000),
  (2, 'Marketing', 300000);
`;

const initialQuerySQL = `-- Viết query của bạn để hiển thị luồng thực thi của nó
-- Ví dụ:

SELECT u.name, u.age, d.name as department
FROM users u
JOIN departments d ON u.department_id = d.id
WHERE u.age > 25
ORDER BY u.age DESC;
`;

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial State
  sessionId: null,
  isSessionLoading: true,
  sessionError: null,
  
  currentView: 'setup',
  
  setupSQL: initialSetupSQL,
  querySQL: initialQuerySQL,
  
  tables: [],
  tableData: [],
  erDiagram: null,
  
  visualization: null,
  currentStepIndex: 0,
  
  isExecuting: false,
  executionError: null,
  executionMessage: null,

  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setSessionLoading: (loading) => set({ isSessionLoading: loading }),
  setSessionError: (error) => set({ sessionError: error }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  setSetupSQL: (sql) => set({ setupSQL: sql }),
  setQuerySQL: (sql) => set({ querySQL: sql }),
  
  setTables: (tables) => set({ tables }),
  setTableData: (data) => set({ tableData: data }),
  setERDiagram: (diagram) => set({ erDiagram: diagram }),
  
  setVisualization: (vis) => set({ 
    visualization: vis, 
    currentStepIndex: 0,
    currentView: vis ? 'visualization' : get().currentView
  }),
  
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
  
  nextStep: () => {
    const { visualization, currentStepIndex } = get();
    if (visualization && currentStepIndex < visualization.dataFlow.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },
  
  setIsExecuting: (executing) => set({ isExecuting: executing }),
  setExecutionError: (error) => set({ executionError: error }),
  setExecutionMessage: (message) => set({ executionMessage: message }),
  
  reset: () => set({
    tables: [],
    tableData: [],
    erDiagram: null,
    visualization: null,
    currentStepIndex: 0,
    executionError: null,
    executionMessage: null,
    currentView: 'setup',
  }),
}));

// ============================================
// Selectors
// ============================================

export const selectCurrentDataFlow = (state: AppState): DataFlowStep | null => {
  if (!state.visualization) return null;
  return state.visualization.dataFlow[state.currentStepIndex] || null;
};

export const selectCurrentExecutionStep = (state: AppState): ExecutionStep | null => {
  if (!state.visualization) return null;
  const dataFlow = state.visualization.dataFlow[state.currentStepIndex];
  if (!dataFlow) return null;
  return state.visualization.executionSteps.find(
    (step) => step.order === dataFlow.stepOrder
  ) || null;
};

export const selectIsFirstStep = (state: AppState): boolean => {
  return state.currentStepIndex === 0;
};

export const selectIsLastStep = (state: AppState): boolean => {
  if (!state.visualization) return true;
  return state.currentStepIndex >= state.visualization.dataFlow.length - 1;
};

export const selectTotalSteps = (state: AppState): number => {
  return state.visualization?.dataFlow.length || 0;
};
