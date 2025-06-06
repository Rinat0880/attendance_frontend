import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axiosInstance from "../../utils/libs/axios.ts";
import { Employee } from "../../employees.tsx";
import { AxiosError } from "../../admin/components/Table/types.ts";

interface LoginPageProps {
  onLoginSuccess: (employee: Employee) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [employee_id, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam === "google_auth_failed") {
      setError("Googleログインに失敗しました");
    } else if (errorParam === "missing_tokens") {
      setError("認証データが不完全です");
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!employee_id || !password) {
      setError("すべての欄にご記入ください。");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance().post("/sign-in", {
        employee_id: employee_id,
        password: password,
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.access_token
      ) {
        const accessToken = response.data.data.access_token;
        const refreshToken = response.data.data.refresh_token;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        const tempEmployeeData: Employee = {
          id: employee_id,
          username: response.data.employee_id || "Unknown",
          password: "",
          role: response.data.data.role || "employee",
          position: response.data.position || "Unknown",
          checkInTime: null,
          checkOutTime: null,
          location: "Unknown",
          status: "Absent",
          attendanceSummary: {
            earlyLeaves: 0,
            absences: 0,
            lateIns: 0,
            leaves: 0,
          },
        };

        localStorage.setItem("employeeData", JSON.stringify(tempEmployeeData));
        onLoginSuccess(tempEmployeeData);

        if (tempEmployeeData.role === "ADMIN") {
          navigate("/admin");
        } else if (tempEmployeeData.role === "QRCODE") {
          navigate("/qrscanner");
        } else if (tempEmployeeData.role === "DASHBOARD") {
          navigate("/bigTable");
        } else {
          navigate("/employee");
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        setError(axiosError.response.data.error);
      } else {
        setError("予期せぬエラーが発生しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const forceSelect = searchParams.get("force_select");
    const baseUrl = process.env.REACT_APP_BASE_URL;

    if (forceSelect === "true") {
      window.location.href = `${baseUrl}/auth/google/force-select`;
    } else {
      window.location.href = `${baseUrl}/auth/google`;
    }
  };

  const handleGoogleForceSelectLogin = () => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    window.location.href = `${baseUrl}/auth/google/force-select`;
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #F5F8FA 0%, #E8F4F8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 60px rgba(16, 94, 130, 0.12)",
              maxWidth: 480,
              margin: "0 auto",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #105E82 0%, #1976D2 100%)",
                borderRadius: "12px 12px 0 0",
              },
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #105E82 0%, #1976D2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px auto",
                  boxShadow: "0 12px 32px rgba(16, 94, 130, 0.3)",
                }}
              >
                <Person sx={{ color: "white", fontSize: 28 }} />
              </Box>

              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#105E82",
                  mb: 1,
                  letterSpacing: "-0.5px",
                }}
              >
                ログイン
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#64748B",
                  fontWeight: 400,
                }}
              >
                アカウントにサインインしてください
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 2,
                  color: "#DC2626",
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}

            {/* Login Form */}
            <Box
              component="form"
              onSubmit={handleLogin}
              noValidate
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="employee_id"
                label="社員番号 & メールアドレス"
                name="employee_id"
                autoComplete="employee_id"
                autoFocus
                value={employee_id}
                onChange={(e) => setEmployeeId(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(248, 250, 252, 0.8)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundColor: "rgba(248, 250, 252, 1)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      "& fieldset": {
                        borderColor: "#105E82",
                        borderWidth: 2,
                      },
                    },
                    // Fix for filled state
                    "&.Mui-focused, &:has(input:not(:placeholder-shown))": {
                      backgroundColor: "white",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#105E82",
                  },
                  // Ensure icon gets proper styling when input has value
                  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                    transition: "color 0.3s ease-in-out",
                  },
                  "&:has(input:not(:placeholder-shown)) .MuiInputAdornment-root .MuiSvgIcon-root": {
                    color: "#105E82",
                  },
                  // Fix for browser autofill
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset !important",
                    WebkitTextFillColor: "#374151 !important",
                    borderRadius: "8px",
                    transition: "background-color 5000s ease-in-out 0s",
                  },
                  "& input:-webkit-autofill:hover": {
                    WebkitBoxShadow: "0 0 0 1000px white inset !important",
                  },
                  "& input:-webkit-autofill:focus": {
                    WebkitBoxShadow: "0 0 0 1000px white inset !important",
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="パスワード"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#94A3B8" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(248, 250, 252, 0.8)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundColor: "rgba(248, 250, 252, 1)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      "& fieldset": {
                        borderColor: "#105E82",
                        borderWidth: 2,
                      },
                    },
                    // Fix for filled state
                    "&.Mui-focused, &:has(input:not(:placeholder-shown))": {
                      backgroundColor: "white",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#105E82",
                  },
                  // Ensure icon gets proper styling when input has value
                  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                    transition: "color 0.3s ease-in-out",
                  },
                  "&:has(input:not(:placeholder-shown)) .MuiInputAdornment-root .MuiSvgIcon-root": {
                    color: "#105E82",
                  },
                  // Fix for browser autofill
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset !important",
                    WebkitTextFillColor: "#374151 !important",
                    borderRadius: "8px",
                    transition: "background-color 5000s ease-in-out 0s",
                  },
                  "& input:-webkit-autofill:hover": {
                    WebkitBoxShadow: "0 0 0 1000px white inset !important",
                  },
                  "& input:-webkit-autofill:focus": {
                    WebkitBoxShadow: "0 0 0 1000px white inset !important",
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  height: 56,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #105E82 0%, #1976D2 100%)",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  boxShadow: "0 8px 24px rgba(16, 94, 130, 0.3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0D4D6B 0%, #1565C0 100%)",
                    boxShadow: "0 12px 32px rgba(16, 94, 130, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)",
                    boxShadow: "none",
                    transform: "none",
                  },
                  mb: 3,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "ログイン"
                )}
              </Button>
            </Box>

            {/* Divider */}
            <Divider
              sx={{
                my: 3,
                "&::before, &::after": {
                  borderColor: "rgba(148, 163, 184, 0.3)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  px: 2,
                  fontWeight: 500,
                }}
              >
                または
              </Typography>
            </Divider>

            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{
                height: 56,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderColor: "rgba(66, 133, 244, 0.3)",
                color: "#1976D2",
                backgroundColor: "rgba(25, 118, 210, 0.02)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  borderColor: "#1976D2",
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  boxShadow: "0 8px 24px rgba(25, 118, 210, 0.15)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  borderColor: "rgba(148, 163, 184, 0.3)",
                  color: "#94A3B8",
                  backgroundColor: "transparent",
                  transform: "none",
                },
                mb: 2,
              }}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                style={{
                  width: 20,
                  height: 20,
                  marginRight: 12,
                  filter: isLoading ? "grayscale(1)" : "none",
                }}
              />
              Googleでログイン
            </Button>

            {/* Google Force Select Login */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleForceSelectLogin}
              disabled={isLoading}
            >
              別のアカウントを選択
            </Button>
          </Paper>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;