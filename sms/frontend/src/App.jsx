import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import MemberTable from './components/MemberTable';
import Reports from './components/Reports';
import Notices from './components/Notices';
import Complaints from './components/Complaints';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider, useUser } from './context/UserContext';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import UserDashboard from './components/UserDashboard';
import SecurityDashboard from './components/SecurityDashboard';
import SecretaryDashboard from './components/SecretaryDashboard';
import UnifiedAccounting from './components/UnifiedAccounting';
import InvoiceManagement from './components/InvoiceManagement';

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userRole } = useUser();

  const getDefaultRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'treasure':
        return '/treasure-dashboard';
      case 'security':
        return '/security-dashboard';
      case 'secretary':
        return '/secretary-dashboard';
      default:
        return '/user-dashboard';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to={getDefaultRoute(userRole)} replace />
          )
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <Register />
          ) : (
            <Navigate to={getDefaultRoute(userRole)} replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Admin Routes */}
        {userRole === 'admin' && (
          <>
            <Route path="admin-dashboard" element={
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            } />
            <Route path="members" element={<MemberTable />} />
            <Route path="accounting" element={<UnifiedAccounting />} />
            <Route path="admin/invoices/*" element={<InvoiceManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notices" element={<Notices />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </>
        )}

        {/* Treasure Routes */}
        {userRole === 'treasure' && (
          <>
            <Route path="treasure-dashboard" element={<UnifiedAccounting />} />
            <Route path="accounting" element={<UnifiedAccounting />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </>
        )}

        {/* Security Routes */}
        {userRole === 'security' && (
          <>
            <Route path="security-dashboard" element={<SecurityDashboard />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </>
        )}

        {/* Secretary Routes */}
        {userRole === 'secretary' && (
          <>
            <Route path="secretary-dashboard" element={<SecretaryDashboard />} />
            <Route path="notices" element={<Notices />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </>
        )}

        {/* User Routes */}
        {userRole === 'user' && (
          <>
            <Route path="user-dashboard" element={<UserDashboard />} />
            <Route path="notices" element={<Notices />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </>
        )}

        {/* Default redirect based on role */}
        <Route
          path="/"
          element={<Navigate to={getDefaultRoute(userRole)} replace />}
        />
      </Route>

      {/* Catch all route */}
      <Route
        path="*"
        element={<Navigate to={getDefaultRoute(userRole)} replace />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
};

export default App;
