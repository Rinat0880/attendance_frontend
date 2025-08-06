import React, { useState, useEffect } from "react";
import "../../shared/styles/App.css";
import DashboardContent from "./AdminDashboardContent.tsx";
import { Grid, Box, IconButton, Select, MenuItem, SelectChangeEvent, Menu, MenuItem as MuiMenuItem } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import DepartmentPositionManagement from "./DepartmentPositionManagement.tsx";
import EmployeeListPage from "./EmployeeListPage.tsx";
import CompanySettingsPage from "./CompanySettingsPage.tsx";
import NewTablePage from "./NewTablePage.tsx";
import SideMenu from "../components/SideMenu.tsx";
import { useTranslation } from "react-i18next";
import { fetchCompanySettings } from '../../utils/libs/axios.ts';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';

interface AdminDashboardProps {
  onLogout: () => void;
}

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['admin', 'common']);
  const [language, setLanguage] = useState(i18n.language);
  const [companyName, setCompanyName] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const getCompanyInfo = async () => {
      try {
        const data = await fetchCompanySettings();
        setCompanyName(data.results.company_name || "");
      } catch (error) {
        console.error("Ошибка при получении информации о компании:", error);
      }
    };

    getCompanyInfo();
  }, []);

  const handleLogoutClick = () => {
    handleMenuClose();
    onLogout();
    navigate("/login");
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    localStorage.setItem('lang', newLanguage);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoToEmployee = () => {
    handleMenuClose();
    navigate("/employee");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", minWidth: "1240px", backgroundColor: "#F5F8FA" }}>
      <SideMenu companyName={companyName} />
      
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            marginRight: "20px",
            marginLeft: "20px", 
            marginTop: "10px",
            marginBottom: "0px",
            borderRadius: "8px" 
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={{
                marginRight: "10px",
                color: "white",
                backgroundColor: "#105E82",
                height: "40px",
                width: "120px",
                fontSize: "0.875rem",
                padding: "0 10px",
                "& .MuiSelect-icon": { color: "white" }
              }}
            >
              <MenuItem value="ja">{t('common:japanese')}</MenuItem>
              <MenuItem value="en">{t('common:english')}</MenuItem>
            </Select>

            {/* Hamburger Menu */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: "#105E82",
                color: "white",
                height: "40px",
                width: "40px",
                "&:hover": { 
                  backgroundColor: "#0D4D6B" 
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <MuiMenuItem onClick={handleGoToEmployee}>
                <PersonIcon sx={{ mr: 2, color: "#105E82" }} />
                個人ダッシュボード
              </MuiMenuItem>
              
              <MuiMenuItem>
                <LanguageIcon sx={{ mr: 2, color: "#105E82" }} />
                <Select
                  value={language}
                  onChange={(e) => {
                    handleLanguageChange(e);
                    handleMenuClose();
                  }}
                  variant="standard"
                  disableUnderline
                  sx={{
                    fontSize: "inherit",
                    "& .MuiSelect-select": {
                      padding: 0,
                      border: "none",
                      "&:focus": {
                        backgroundColor: "transparent"
                      }
                    }
                  }}
                >
                  <MenuItem value="ja">{t('common:japanese')}</MenuItem>
                  <MenuItem value="en">{t('common:english')}</MenuItem>
                </Select>
              </MuiMenuItem>

              <MuiMenuItem onClick={handleLogoutClick}>
                <LogoutIcon sx={{ mr: 2, color: "#d32f2f" }} />
                ログアウト
              </MuiMenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1, padding: "20px" }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Routes>
                <Route path="/" element={<DashboardContent />} />
                <Route path="/department-and-position" element={<DepartmentPositionManagement />} />
                <Route path="/employee-edit" element={<EmployeeListPage />} />
                <Route path="/company-settings" element={<CompanySettingsPage />} />
                <Route path="/new-table" element={<NewTablePage />} />
              </Routes>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;