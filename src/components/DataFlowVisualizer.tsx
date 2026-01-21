/**
 * Data Flow Visualizer Component - Shows data transformation at each step
 */

import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { DataTable } from './DataTable';
import { ExecutionStepper, StepNavigation } from './ExecutionStepper';
import type { QueryVisualization } from '@/api/types';
import { STEP_COLORS } from '@/api/types';
import { XIcon } from 'lucide-react';

interface DataFlowVisualizerProps {
  visualization: QueryVisualization;
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function DataFlowVisualizer({
  visualization,
  currentStepIndex,
  onStepClick,
  onPrev,
  onNext,
  onReset,
}: DataFlowVisualizerProps) {
  const { executionSteps, dataFlow, originalQuery, finalResult } = visualization;
  const currentDataFlow = dataFlow[currentStepIndex];
  const isLastStep = currentStepIndex === dataFlow.length - 1;

  return (
    <div className="space-y-8">
      {/* Original Query Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold text-zinc-200">Truy vấn</h3>
        </div>
        <pre className="text-sm font-mono text-zinc-300 bg-zinc-800/50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
          {originalQuery}
        </pre>
      </motion.div>

      {/* Execution Stepper */}
      <ExecutionStepper
        steps={executionSteps}
        dataFlow={dataFlow}
        currentStepIndex={currentStepIndex}
        onStepClick={onStepClick}
      />

      {/* Data Flow Table */}
      <AnimatePresence mode="wait">
        {currentDataFlow && (
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <DataFlowStepCard
              dataFlow={currentDataFlow}
              stepType={currentDataFlow.stepType}
              isLastStep={isLastStep}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Result Preview (when on last step) */}
      {isLastStep && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-linear-to-r from-emerald-900/20 to-teal-900/20 rounded-2xl border border-emerald-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-emerald-200 text-lg">Kết Quả</h3>
            <span className="text-sm text-emerald-400 ml-2 px-2 py-0.5 bg-emerald-500/20 rounded-full">
              {finalResult.rows.length} dòng
            </span>
          </div>
          <DataTable
            columns={finalResult.columns}
            rows={finalResult.rows.map((row) => ({ data: row, included: true }))}
            highlightIncluded={false}
          />
        </motion.div>
      )}

      {/* Navigation Controls */}
      <StepNavigation
        currentStepIndex={currentStepIndex}
        totalSteps={dataFlow.length}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
      />
    </div>
  );
}

// ============================================
// Data Flow Step Card
// ============================================

interface DataFlowStepCardProps {
  dataFlow: QueryVisualization['dataFlow'][number];
  stepType: string;
  isLastStep: boolean;
}

function DataFlowStepCard({ dataFlow, stepType, isLastStep }: DataFlowStepCardProps) {
  const stepColor = STEP_COLORS[stepType as keyof typeof STEP_COLORS] || '#6366F1';

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-white/10"
        style={{ backgroundColor: `${stepColor}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: stepColor, boxShadow: `0 4px 14px ${stepColor}40` }}
            >
              {dataFlow.stepOrder}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 text-lg">{stepType}</h3>
              <p className="text-sm text-zinc-400 mt-0.5">{dataFlow.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <StatBadge
              label="Tổng"
              value={dataFlow.stats.totalRows}
              color="zinc"
            />
            <StatBadge
              label="Đúng yêu cầu"
              value={dataFlow.stats.includedRows}
              color="emerald"
            />
            {dataFlow.stats.excludedRows > 0 && (
              <StatBadge
                label="Không đúng yêu cầu"
                value={dataFlow.stats.excludedRows}
                color="red"
              />
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-6">
        <DataTable
          columns={dataFlow.columns}
          rows={dataFlow.rows}
          showExcludedRows={true}
          highlightIncluded={!isLastStep}
        />

        {/* Excluded Rows Reasons */}
        {dataFlow.stats.excludedRows > 0 && !isLastStep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}
            className="mt-5 p-4 bg-red-900/20 rounded-xl border border-red-500/20"
          >
            <h4 className="text-sm font-medium text-red-300 mb-3">
              Số Dòng Không Đúng Yêu Cầu ({dataFlow.stats.excludedRows})
            </h4>
            <div className="space-y-2">
              {dataFlow.rows
                .filter((row) => !row.included && row.excludedReason)
                .slice(0, 5)
                .map((row, index) => (
                  <div key={index} className="text-xs text-red-400/80 flex items-center gap-3">
                    <span className="text-red-500"><XIcon className="w-4 h-4" /></span>
                    <span className="font-mono">{JSON.stringify(row.data)}</span>
                    <span className="text-red-400/60">— {row.excludedReason}</span>
                  </div>
                ))}
              {dataFlow.rows.filter((r) => !r.included).length > 5 && (
                <div className="text-xs text-red-400/60 mt-2">
                  ...và {dataFlow.rows.filter((r) => !r.included).length - 5} dòng khác
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Stat Badge Component
// ============================================

interface StatBadgeProps {
  label: string;
  value: number;
  color: 'zinc' | 'emerald' | 'red';
}

function StatBadge({ label, value, color }: StatBadgeProps) {
  const colorClasses = {
    zinc: 'bg-zinc-800 text-zinc-300',
    emerald: 'bg-emerald-900/50 text-emerald-300',
    red: 'bg-red-900/50 text-red-300',
  };

  return (
    <div className={cn('px-4 py-1.5 rounded-lg', colorClasses[color])}>
      <span className="font-mono font-bold">{value}</span>
      <span className="text-xs opacity-70 ml-1.5">{label}</span>
    </div>
  );
}
