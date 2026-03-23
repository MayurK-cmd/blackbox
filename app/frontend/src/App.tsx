import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ExplorePage } from './pages/ExplorePage';
import { ModelDetailsPage } from './pages/ModelDetailsPage';

function App() {
  const { isConnected } = useAccount();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={isConnected ? <DashboardPage /> : <Navigate to="/" />}
        />
        <Route
          path="/upload"
          element={isConnected ? <UploadPage /> : <Navigate to="/" />}
        />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/model/:id" element={<ModelDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;