import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!accessToken || !refreshToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // При необходимости здесь можно добавить проверку валидности токена
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // или ваш компонент загрузки
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;