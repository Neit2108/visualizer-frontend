/**
 * SQL Visualization App
 */

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { SetupView, SchemaView, QueryView, VisualizationView, MonitoringView } from '@/components/views';
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

function MainApp() {
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

function MonitorPage() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNzI3MmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWMThoMnY0em0tNiA2aC00djJoNHYtMnptLTYgMGgtNHYyaDR2LTJ6bTAgNmgtNHYyaDR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <MonitoringView />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/monitor" element={<MonitorPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
