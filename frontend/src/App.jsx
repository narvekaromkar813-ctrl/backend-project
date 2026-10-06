import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Protected Route
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Panels } from './pages/Panels';
import { Generation } from './pages/Generation';
import { Consumption } from './pages/Consumption';
import { Grid } from './pages/Grid';
import { Bills } from './pages/Bills';
import { Alerts } from './pages/Alerts';
import { ROI } from './pages/ROI';
import { Weather } from './pages/Weather';
import { Compare } from './pages/Compare';
import { Advanced } from './pages/Advanced';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Application Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="panels" element={<Panels />} />
                  <Route path="generation" element={<Generation />} />
                  <Route path="consumption" element={<Consumption />} />
                  <Route path="grid" element={<Grid />} />
                  <Route path="bills" element={<Bills />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="roi" element={<ROI />} />
                  <Route path="weather" element={<Weather />} />
                  <Route path="compare" element={<Compare />} />
                  <Route path="advanced" element={<Advanced />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Global Notifications Toaster */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: '!rounded-xl !bg-white dark:!bg-navy-900 !text-slate-800 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-800 !shadow-xl !text-xs !font-medium',
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#F43F5E',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
