import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./client/pages/LoginPage.tsx";
import DashboardPage from "./client/pages/DashboardPage.tsx";
import PersonalDashboard from "./client/pages/PersonalDashboard.tsx";
import AdminDashboard from "./admin/pages/AdminDashboard.tsx";
import { Employee } from "./employees";
import { Box } from "@mui/material";
import "./shared/styles/App.css";
import QRCodeScanner from "./client/pages/QrCodeScanner.tsx";
import BigTablePage from "./client/pages/BigTable.tsx";
import "./i18n.ts";
import ProtectedRoute from "./shared/protection/ProtectedRoute.tsx";
import { jaJP } from "@mui/material/locale";
import GoogleCallback from "./client/pages/GoogleCallback.tsx";

const theme = createTheme(
  {
    palette: {
      primary: {
        main: "#007bff",
      },
      secondary: {
        main: "#6c757d",
      },
    },
    typography: {
      fontFamily: "Poppins, Roboto, sans-serif",
    },
  },
  jaJP
);

function App() {
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem("access_token");
      const storedEmployeeData = localStorage.getItem("employeeData");

      if (accessToken && storedEmployeeData) {
        setEmployeeData(JSON.parse(storedEmployeeData));
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (employee: Employee) => {
    setEmployeeData(employee);
    localStorage.setItem("employeeData", JSON.stringify(employee));
  };

  const handleLogout = () => {
    setEmployeeData(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("employeeData");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ height: "100vh" }}>
          <Routes>
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/auth/callback"
              element={<GoogleCallback onLoginSuccess={handleLoginSuccess} />}
            />

            {/* Защищенные маршруты с проверкой авторизации */}
            <Route element={<ProtectedRoute />}>
              {/* Main dashboard - now shows big table */}
              <Route
                path="/employee"
                element={
                  <DashboardPage
                    employeeData={employeeData!}
                    onLogout={handleLogout}
                  />
                }
              />
              {/* Personal dashboard with tabs */}
              <Route
                path="/employee/personal"
                element={
                  <PersonalDashboard
                    employeeData={employeeData!}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route
                path="/admin/*"
                element={<AdminDashboard onLogout={handleLogout} />}
              />
              <Route path="/qrscanner" element={<QRCodeScanner />} />
              <Route path="/bigTable" element={<BigTablePage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;