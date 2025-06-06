import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import MemberTable from './components/MemberTable';
import Accounting from './components/Accounting';
import Reports from './components/Reports';
import Notices from './components/Notices';
import Complaints from './components/Complaints';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider, useUser } from './context/UserContext';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userRole } = useUser();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : userRole === 'admin' ? (
            <Navigate to="/admin-dashboard" replace />
          ) : (
            <Navigate to="/user-dashboard" replace />
          )
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <Register />
          ) : userRole === 'admin' ? (
            <Navigate to="/admin-dashboard" replace />
          ) : (
            <Navigate to="/user-dashboard" replace />
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
            <Route path="admin-dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<MemberTable />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notices" element={<Notices />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
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
          element={
            userRole === 'admin' ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <Navigate to="/user-dashboard" replace />
            )
          }
        />
      </Route>

      {/* Catch all route */}
      <Route
        path="*"
        element={
          userRole === 'admin' ? (
            <Navigate to="/admin-dashboard" replace />
          ) : (
            <Navigate to="/user-dashboard" replace />
          )
        }
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
