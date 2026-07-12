import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { SpeedInsights } from '@vercel/speed-insights/react';

import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import VaultPage from './pages/VaultPage';
import AddProjectPage from './pages/AddProjectPage';
import ProjectViewPage from './pages/ProjectViewPage';
import PublicProfilePage from './pages/PublicProfilePage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (window.location.pathname === '/auth') {
          navigate('/vault')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/vault" element={
          <ProtectedRoute>
            <VaultPage />
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <AddProjectPage />
          </ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <ProjectViewPage />
          </ProtectedRoute>
        } />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Routes>
      <SpeedInsights />
    </>
  );
}

export default App;
