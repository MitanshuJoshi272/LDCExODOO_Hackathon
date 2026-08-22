import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TripProvider } from './contexts/TripContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './components/AppShell';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { CreateTrip } from './pages/CreateTrip';
import { TripDetail } from './pages/TripDetail';
import { SharedTrip } from './pages/SharedTrip';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/share/:tripId" element={<SharedTrip />} />

            <Route
              path="/dashboard"
              element={
                <AppShell>
                  <Dashboard />
                </AppShell>
              }
            />

            <Route
              path="/explore"
              element={
                <AppShell>
                  <Explore />
                </AppShell>
              }
            />

            <Route
              path="/trips/new"
              element={
                <AppShell>
                  <CreateTrip />
                </AppShell>
              }
            />

            <Route
              path="/trips/:tripId"
              element={
                <AppShell>
                  <TripDetail />
                </AppShell>
              }
            />

            <Route
              path="/settings"
              element={
                <AppShell>
                  <Settings />
                </AppShell>
              }
            />

            <Route
              path="/admin"
              element={
                <AppShell>
                  <AdminDashboard />
                </AppShell>
              }
            />

            <Route
              path="*"
              element={
                <AppShell>
                  <Dashboard />
                </AppShell>
              }
            />
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}