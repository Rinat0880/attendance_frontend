import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Container, Typography, Box } from '@mui/material';
import { Employee } from '../../employees.tsx';

interface GoogleCallbackProps {
  onLoginSuccess: (employee: Employee) => void;
}

const GoogleCallback: React.FC<GoogleCallbackProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    const role = searchParams.get('role');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      // Передаем ошибку с дополнительным параметром для принудительного выбора аккаунта
      const errorMessage = encodeURIComponent(error);
      navigate(`/login?error=${errorMessage}&force_select=true`);
      return;
    }

    if (access_token && refresh_token && role) {
      try {
        // Сохраняем токены
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        // Можно декодировать JWT токен для получения дополнительной информации
        const tokenPayload = parseJwtPayload(access_token);
        
        // Создаем объект Employee
        const tempEmployeeData: Employee = {
          id: tokenPayload?.id || 'google_user',
          username: tokenPayload?.username || 'Google User',
          password: '',
          role: role.toUpperCase() as "ADMIN" | "EMPLOYEE" | "QRCODE" | "DASHBOARD",
          position: tokenPayload?.position || 'Unknown',
          checkInTime: null,
          checkOutTime: null,
          location: 'Unknown',
          status: 'Absent',
          attendanceSummary: {
            earlyLeaves: 0,
            absences: 0,
            lateIns: 0,
            leaves: 0,
          },
        };

        localStorage.setItem("employeeData", JSON.stringify(tempEmployeeData));
        onLoginSuccess(tempEmployeeData);

        // Перенаправляем в зависимости от роли
        if (role.toUpperCase() === 'ADMIN') {
          navigate("/admin");
        } else if (role.toUpperCase() === 'QRCODE') {
          navigate("/qrscanner");
        } else if (role.toUpperCase() === 'DASHBOARD') {
          navigate("/bigTable");
        } else {
          navigate("/employee");
        }
      } catch (error) {
        console.error('Error processing Google login:', error);
        navigate('/login?error=processing_error&force_select=true');
      }
    } else {
      // Если нет нужных параметров, перенаправляем на login с принудительным выбором
      navigate('/login?error=missing_tokens&force_select=true');
    }
  }, [searchParams, navigate, onLoginSuccess]);

  // Функция для парсинга JWT токена (базовая реализация)
  const parseJwtPayload = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Box style={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Googleアカウントでログイン中...
        </Typography>
      </Box>
    </Container>
  );
};

export default GoogleCallback;