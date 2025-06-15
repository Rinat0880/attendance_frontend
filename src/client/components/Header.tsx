import React, { useEffect, useState } from 'react';
import {
  Typography, Box, IconButton, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
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
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    boxShadow: theme.shadows[4],
    minWidth: 150,
    fontFamily: '"Roboto", "Segoe UI", sans-serif',
    '& .MuiMenuItem-root': {
      color: '#222',
      fontSize: '15px',
      fontWeight: 500,
      padding: '10px 16px',
      transition: 'all 0.2s ease-in-out',
      borderRadius: 6,
      '&:hover': {
        backgroundColor: '#fffff',
      },
    },
  },
}));


const Header: React.FC<HeaderProps> = ({ onLogout, anchorEl, handleMenuOpen, handleMenuClose }) => {
  const { t, i18n } = useTranslation();
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    handleLanguageMenuClose();
  };

  const goToBigTable = () => {
    navigate('/bigTable');
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
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
      if (response.data?.status && response.data.employee) {
        setEmployeeName(response.data.employee);
        if (response.data.employee_id) {
          setEmployeeId(response.data.employee_id);
        }
      } else {
        console.error('従業員名を取得できませんでした。', response.data);
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
      bgcolor: '#105e82',
      color: 'white',
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2,
      position: 'sticky',
      top: 0,
      zIndex: 1,
      borderRadius: 3,
    }}>
      <Typography variant="h6" sx={{ ml: 2, color: '#ffffff' }}>
        {loading ? t('loading') : employeeName ? t('greeting', { employeeId: employeeName }) : t('error')}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleLanguageMenuOpen} sx={{ color: '#ffffff' }}>
          <LanguageIcon />
        </IconButton>

        <Menu
          anchorEl={languageMenuAnchor}
          open={Boolean(languageMenuAnchor)}
          onClose={handleLanguageMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => changeLanguage('en')}>{t('english')}</MenuItem>
          <MenuItem onClick={() => changeLanguage('ja')}>{t('japanese')}</MenuItem>
        </Menu>

        <IconButton
          edge="end"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{
            '& .MuiSvgIcon-root': {
              color: '#ffffff',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <CustomMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={goToBigTable}>{t('goBigTable') || 'Dashboard View'}</MenuItem>
          <MenuItem onClick={handleDownloadQRCode}>{t('qrCode')}</MenuItem>
          <MenuItem onClick={handleLogoutClick}>{t('logout')}</MenuItem>
        </CustomMenu>
      </Box>
    </Box>
  );
};

export default Header;
