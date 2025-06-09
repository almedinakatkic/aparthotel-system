import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import HousekeepingDashboard from './components/HousekeepingDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import ApartmentDetails from './pages/ApartmentDetails';
import BookingManagement from './pages/BookingManagement';
import Calendar from './pages/Calendar';
import ChangePassword from './pages/ChangePassword';
import CleanerDashboard from './pages/CleanerDashboard';
import CreateBooking from './pages/CreateBooking';
import CreatePropertyGroup from './pages/CreatePropertyGroup';
import CreateUnit from './pages/CreateUnit';
import Dashboard from './pages/Dashboard';
import FinancialReports from './pages/FinancialReports';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import GeneralReports from './pages/GeneralReports';
import GuestList from './pages/GuestList';
import LoginForm from './pages/LoginForm';
import OwnerApartmentList from './pages/OwnerApartmentList';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerReport from './pages/OwnerReport';
import PropertyGroupManagement from './pages/PropertyGroupManagement';
import RegisterUser from './pages/RegisterUser';
import Reports from './pages/Reports';
import ReportsOwner from './pages/ReportsOwner';
import ResetPasswordForm from './pages/ResetPasswordForm';
import RoomManagement from './pages/RoomManagement';
import Settings from './pages/Settings';
import TaskAssignment from './pages/TaskAssignment';
import UnitManagement from './pages/UnitManagement';


function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/change-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname === '/forgot-password';

  //const isAuthPage = location.pathname === '/login' || location.pathname === '/change-password'||location.pathname.startsWith('/reset-password');

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
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
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
              path="/reportsowner"
              element={
                <ProtectedRoute>
                  <ReportsOwner />
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

            <Route
              path="/ownerapartmentlist"
              element={
                <ProtectedRoute>
                  <OwnerApartmentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/apartmentdetails"
              element={
                <ProtectedRoute>
                  <ApartmentDetails />
                </ProtectedRoute>
              }
            />
              <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />

              <Route
              path="/guests"
              element={
                <ProtectedRoute>
                  <GuestList />
                </ProtectedRoute>
              }
            />

              <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <RoomManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cleaning"
              element={
                <ProtectedRoute>
                  <CleanerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/housekeeping-dashboard"
              element={
                <ProtectedRoute>
                  <HousekeepingDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner-dashboard"
              element={
                <ProtectedRoute>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
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