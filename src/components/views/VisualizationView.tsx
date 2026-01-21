/**
 * Visualization View - Shows query execution flow and data transformations
 */

import { motion } from 'motion/react';
import { DataFlowVisualizer } from '../DataFlowVisualizer';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { RefreshCcwIcon } from 'lucide-react';

export function VisualizationView() {
  const {
    visualization,
    currentStepIndex,
    setCurrentStepIndex,
    nextStep,
    prevStep,
    setCurrentView,
    setVisualization,
  } = useAppStore();

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  const handleNewQuery = () => {
    setVisualization(null);
    setCurrentView('query');
  };

  if (!visualization) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">Không có luồng thực thi</h3>
        <p className="text-zinc-500 mb-6">Chạy một query để xem luồng thực thi</p>
        <Button onClick={() => setCurrentView('query')} variant="outline">
          Đến Query
        </Button>
      </motion.div>
    );
  }

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
            <span className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg shadow-lg shadow-amber-500/20">
              4
            </span>
            Luồng Thực Thi
          </h2>
          <p className="text-zinc-400 mt-3 ml-16">
            Xem qua luồng thực thi của query để xem dữ liệu biến đổi ở từng bước
          </p>
        </div>
        <Button
          onClick={handleNewQuery}
          variant="outline"
          className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 px-5 py-2.5"
        >
          {/* <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg> */}
          <RefreshCcwIcon className="w-5 h-5 mr-2" />
          Query Mới
        </Button>
      </div>

      {/* Data Flow Visualizer */}
      <DataFlowVisualizer
        visualization={visualization}
        currentStepIndex={currentStepIndex}
        onStepClick={setCurrentStepIndex}
        onPrev={prevStep}
        onNext={nextStep}
        onReset={handleReset}
      />
    </motion.div>
  );
}
