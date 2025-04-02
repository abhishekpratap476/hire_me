import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user is trying to access service provider routes
  if (window.location.pathname.startsWith('/service-') && userType !== 'service') {
    return <Navigate to="/home" replace />;
  }

  // Check if the user is trying to access client routes
  if (!window.location.pathname.startsWith('/service-') && userType !== 'client') {
    return <Navigate to="/service-home" replace />;
  }

  return children;
};

export default PrivateRoute; 