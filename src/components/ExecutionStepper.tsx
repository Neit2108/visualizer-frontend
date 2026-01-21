/**
 * Execution Stepper Component - Shows SQL execution order
 */

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ExecutionStep, DataFlowStep } from '@/api/types';
import { STEP_COLORS } from '@/api/types';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, RefreshCcwIcon, XIcon } from 'lucide-react';

interface ExecutionStepperProps {
  steps: ExecutionStep[];
  dataFlow: DataFlowStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export function ExecutionStepper({
  steps,
  dataFlow,
  currentStepIndex,
  onStepClick,
}: ExecutionStepperProps) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-5">
        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="font-semibold text-zinc-200">Thứ Tự Thực Thi</h3>
      </div>

      {/* Steps */}
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => {
          const dataFlowIndex = dataFlow.findIndex((df) => df.stepOrder === step.order);
          const isActive = dataFlowIndex === currentStepIndex;
          const isPast = dataFlowIndex < currentStepIndex;
          const stepColor = STEP_COLORS[step.type];
          const stats = dataFlow[dataFlowIndex]?.stats;

          return (
            <div key={step.order} className="flex items-center gap-3">
              <motion.button
                onClick={() => onStepClick(dataFlowIndex)}
                disabled={dataFlowIndex === -1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900',
                  isActive
                    ? 'text-white shadow-lg'
                    : isPast
                    ? 'text-white/80'
                    : 'text-zinc-400 hover:text-zinc-200',
                  dataFlowIndex === -1 && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  backgroundColor: isActive ? stepColor : isPast ? `${stepColor}80` : 'transparent',
                  borderColor: stepColor,
                  borderWidth: '2px',
                  boxShadow: isActive ? `0 0 20px ${stepColor}40` : 'none',
                }}
              >
                <span className="flex items-center gap-2.5">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    isActive || isPast ? 'bg-white/20' : 'bg-zinc-700'
                  )}>
                    {step.order}
                  </span>
                  <span>{step.type}</span>
                </span>

                {/* Stats Badge */}
                {stats && isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2.5 -right-2.5 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-bold shadow-lg"
                  >
                    {stats.includedRows}/{stats.totalRows}
                  </motion.span>
                )}
              </motion.button>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <motion.svg
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'w-5 h-5 mx-1',
                    isPast ? 'text-zinc-500' : 'text-zinc-700'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      {dataFlow[currentStepIndex] && (
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 bg-zinc-800/50 rounded-xl border border-white/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 font-mono">
                {steps.find((s) => s.order === dataFlow[currentStepIndex].stepOrder)?.clause}
              </p>
              <p className="text-xs text-zinc-500 mt-1.5">
                {dataFlow[currentStepIndex].description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-5 text-sm">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span><CheckIcon className="w-4 h-4" /></span> {dataFlow[currentStepIndex].stats.includedRows} đúng yêu cầu
                </span>
                {dataFlow[currentStepIndex].stats.excludedRows > 0 && (
                  <span className="text-red-400 flex items-center gap-1.5">
                    <span><XIcon className="w-4 h-4" /></span> {dataFlow[currentStepIndex].stats.excludedRows} không đúng yêu cầu
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Step Navigation Controls
// ============================================

interface StepNavigationProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function StepNavigation({
  currentStepIndex,
  totalSteps,
  onPrev,
  onNext,
  onReset,
}: StepNavigationProps) {
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex >= totalSteps - 1;

  return (
    <div className="flex items-center justify-between bg-zinc-900/50 rounded-2xl border border-white/10 p-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800/50"
        >
          <RefreshCcwIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-5">
        <motion.button
          onClick={onPrev}
          disabled={isFirst}
          whileHover={{ scale: isFirst ? 1 : 1.05 }}
          whileTap={{ scale: isFirst ? 1 : 0.95 }}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
            isFirst
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
          )}
        >
          <ChevronLeftIcon className="w-4 h-4" /> Trước
        </motion.button>

        <div className="px-5 py-2.5 bg-zinc-800 rounded-xl text-zinc-300 font-mono text-sm min-w-[120px] text-center">
          {currentStepIndex + 1} / {totalSteps}
        </div>

        <motion.button
          onClick={onNext}
          disabled={isLast}
          whileHover={{ scale: isLast ? 1 : 1.05 }}
          whileTap={{ scale: isLast ? 1 : 0.95 }}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
            isLast
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/25'
          )}
        >
          Tiếp <ChevronRightIcon className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="w-24" /> {/* Spacer for balance */}
    </div>
  );
}
