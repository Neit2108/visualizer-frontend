/**
 * SQL Visualization App
 */

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { SetupView, SchemaView, QueryView, VisualizationView } from '@/components/views';
import { useAppStore } from '@/store';
import { useInitSession, useCleanupSession } from '@/hooks/useApi';
import './App.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { currentView, sessionId } = useAppStore();
  const initSession = useInitSession();
  const cleanupSession = useCleanupSession();

  // Initialize session on mount
  useEffect(() => {
    if (!sessionId) {
      initSession.mutate();
    }
  }, []);

  // Cleanup session on unmount (when user closes the app/tab)
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  const renderView = () => {
    switch (currentView) {
      case 'setup':
        return <SetupView />;
      case 'schema':
        return <SchemaView />;
      case 'query':
        return <QueryView />;
      case 'visualization':
        return <VisualizationView />;
      default:
        return <SetupView />;
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
