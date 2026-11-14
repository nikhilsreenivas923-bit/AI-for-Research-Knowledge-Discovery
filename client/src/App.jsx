import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkspaceHubPage from './pages/WorkspaceHubPage';
import WorkspaceAskPage from './pages/WorkspaceAskPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-mono">Authenticating session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workspace/:id" 
        element={
          <ProtectedRoute>
            <WorkspaceHubPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workspace/:id/ask" 
        element={
          <ProtectedRoute>
            <WorkspaceAskPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workspace/:id/document/:docId" 
        element={
          <ProtectedRoute>
            <DocumentViewerPage />
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
