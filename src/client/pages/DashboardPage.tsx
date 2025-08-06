import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import NewDepartmentTable from '../../admin/components/Table/NewDepartmentTable.tsx';
import { Employee } from '../../employees.tsx';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface DashboardPageProps {
  employeeData: Employee | null;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ employeeData, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showControls, setShowControls] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!employeeData) {
    return <div>従業員データの読み込み...</div>;
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoToPersonal = () => {
    handleMenuClose();
    navigate('/employee/personal');
  };

  const handleGoToAdmin = () => {
    handleMenuClose();
    navigate('/admin');
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
    navigate('/login');
  };

  const isAdmin = employeeData.role === 'ADMIN';

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'relative',
      backgroundColor: '#F5F8FA'
    }}>
      {/* Hamburger menu in top right corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1001,
        }}
      >
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            backgroundColor: 'rgba(16, 94, 130, 0.9)',
            color: 'white',
            width: 50,
            height: 50,
            '&:hover': {
              backgroundColor: '#0D4D6B',
            },
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Dropdown menu */}
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
          <MenuItem onClick={handleGoToPersonal}>
            <PersonIcon sx={{ mr: 2, color: "#105E82" }} />
            個人ページ
          </MenuItem>
          
          {isAdmin && (
            <MenuItem onClick={handleGoToAdmin}>
              <AdminPanelSettingsIcon sx={{ mr: 2, color: "#105E82" }} />
              管理パネル
            </MenuItem>
          )}

          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 2, color: "#d32f2f" }} />
            ログアウト
          </MenuItem>
        </Menu>
      </Box>

      {/* Main content - NewDepartmentTable in employee mode */}
      <NewDepartmentTable 
        mode="employee"
        onControlsHover={setShowControls}
      />
    </Box>
  );
};

export default DashboardPage;