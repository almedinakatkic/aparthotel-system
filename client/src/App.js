import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginForm from './pages/LoginForm';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import FinancialReports from './pages/FinancialReports';
import GeneralReports from './pages/GeneralReports';
import OwnerReport from './pages/OwnerReport';
import CreateBooking from './pages/CreateBooking';
import BookingManagement from './pages/BookingManagemen';
import RegisterUser from './pages/RegisterUser';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePropertyGroup from './pages/CreatePropertyGroup';
import PropertyGroupManagement from './pages/PropertyGroupManagement';
import CreateUnit from './pages/CreateUnit';
import UnitManagement from './pages/UnitManagement';
import Reports from './pages/Reports';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/change-password';

  return (
    <div className="app">
      {!isAuthPage && <Navbar />}

      <div className="main-content-wrapper">
        {!isAuthPage && <Sidebar />}

        <main className={`content-area ${!isAuthPage ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial-reports"
              element={
                <ProtectedRoute>
                  <FinancialReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/general-reports"
              element={
                <ProtectedRoute>
                  <GeneralReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner-reports"
              element={
                <ProtectedRoute>
                  <OwnerReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-booking"
              element={
                <ProtectedRoute>
                  <CreateBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-user"
              element={
                <ProtectedRoute>
                  <RegisterUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-property-group"
              element={
                <ProtectedRoute>
                  <CreatePropertyGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-unit"
              element={
                <ProtectedRoute>
                  <CreateUnit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/units/manage"
              element={
                <ProtectedRoute>
                  <UnitManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-properties"
              element={
                <ProtectedRoute>
                  <PropertyGroupManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-management"
              element={
                <ProtectedRoute>
                  <BookingManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;