import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  isLoggedIn: boolean;
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
