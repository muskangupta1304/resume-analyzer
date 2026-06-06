import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found in ProtectedRoute. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
