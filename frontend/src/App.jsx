import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ApplicationForm from './pages/ApplicationForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/apply" element={<ApplicationForm />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Student/Parent Routes */}
          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute allowedRoles={['student', 'parent']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
