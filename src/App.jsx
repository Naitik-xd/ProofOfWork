import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import VaultPage from './pages/VaultPage';
import AddProjectPage from './pages/AddProjectPage';
import ProjectViewPage from './pages/ProjectViewPage';
import PublicProfilePage from './pages/PublicProfilePage';

function App() {
  return (
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
    </Routes>
  );
}

export default App;
