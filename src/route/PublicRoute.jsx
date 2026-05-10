import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; 

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); 

  if (isAuthenticated) {
    return <Navigate to="/page-group" />;
  }

  return children;
};

export default PublicRoute;
