import React, { useEffect, useState } from 'react';
import { Typography, Box, IconButton, Menu, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import axiosInstance, { downloadEmployeeQRCodeByHimself } from '../../utils/libs/axios.ts';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLogout: () => void;
  anchorEl: null | HTMLElement;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
}

const CustomMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: '#f4f4f4',
    borderRadius: 2,
    boxShadow: theme.shadows[3],
    minWidth: 120,
    '& .MuiMenuItem-root': {
      color: '#333333',
      backgroundColor: '#f4f4f4',
      '&:hover': {
        backgroundColor: '#ff3b30',
        color: '#ffffff',
      },
      width: '100%',
    },
  },
}));

const Header: React.FC<HeaderProps> = ({ onLogout, anchorEl, handleMenuOpen, handleMenuClose }) => {
  const { t, i18n } = useTranslation();
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const changeLanguage = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
    handleMenuClose();
  };

  const goToBigTable = () => {
    navigate('/bigTable');
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const handleDownloadQRCode = async () => {
    try {
      if (employeeId) {
        await downloadEmployeeQRCodeByHimself(employeeId);
      } else {
        console.error('従業員IDが見つかりません。');
      }
      handleMenuClose();
    } catch (error) {
      console.error('QRコードのダウンロード中にエラーが発生しました。', error);
    }
  };

  const fetchEmployeeName = async () => {
    try {
      const response = await axiosInstance().get('/user/dashboard');

      if (response.data && response.data.status && response.data.employee) {
        setEmployeeName(response.data.employee);
        if (response.data.employee_id) {
          setEmployeeId(response.data.employee_id);
        }
      } else {
        console.error('従業員名を取得できませんでした。APIの応答に必要なデータが含まれていません。', response.data);
      }
    } catch (error) {
      console.error('従業員名の取得中にエラーが発生しました。', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeName();
  }, []);

  return (
    <Box sx={{
      bgcolor: '#105e82', color: 'white', p: 2, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', mb: 2,
      position: 'sticky',
      top: 0,
      zIndex: 1,
      borderRadius: 3,
    }}>
      <Typography variant="h6" sx={{ ml: 2, color: '#ffffff', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
        {loading ? t('loading') : employeeName ? t('greeting', { employeeId: employeeName }) : t('error')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          edge="end" 
          aria-label="menu" 
          onClick={handleMenuOpen}
          sx={{ 
            '& .MuiSvgIcon-root': {
              color: '#ffffff'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        <CustomMenu
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
        >
          <MenuItem onClick={goToBigTable}>{t('goBigTable') || 'Dashboard View'}</MenuItem>
          <MenuItem onClick={handleDownloadQRCode}>
            Qrcode
          </MenuItem>
          <MenuItem>
            <Select
              value={i18n.language}
              onChange={changeLanguage}
              sx={{ minWidth: 120, color: 'inherit' }}
            >
              <MenuItem value="ja">{t('japanese')}</MenuItem>
              <MenuItem value="en">{t('english')}</MenuItem>
            </Select>
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>{t('logout')}</MenuItem>
        </CustomMenu>
      </Box>
    </Box>
  );
};

export default Header;