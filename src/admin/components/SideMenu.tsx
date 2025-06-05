import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography, 
  IconButton,
  Drawer,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TableChartIcon from '@mui/icons-material/TableChart';
import WorkIcon from '@mui/icons-material/Work';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const primaryColor = '#105E82';
const drawerWidth = 300;
const miniDrawerWidth = 65;

interface SideMenuProps {
  companyName: string;
}

const CustomList = styled(List)({
  width: '100%',
  backgroundColor: '#F5F8FA',
  padding: 0,
  overflow: 'hidden',
});

const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: '12px 24px',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: primaryColor,
    color: '#FFFFFF',
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '&.Mui-selected': {
    backgroundColor: primaryColor,
    color: '#FFFFFF',
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
}));

const MenuTitle = styled(Typography)({
  padding: '16px 24px',
  color: primaryColor,
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  minHeight: '64px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
}));

function SideMenu({ companyName }: SideMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['admin', 'common']);
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const menuItems = [
    { path: '/admin', icon: <DashboardIcon />, text: t('admin:sideMenu.dashboard') },
    { path: '/admin/department-and-position', icon: <WorkIcon />, text: t('admin:sideMenu.departmentAndPosition') },
    { path: '/admin/employee-edit', icon: <PeopleIcon />, text: t('admin:sideMenu.employeeEdit') },
    { path: '/admin/company-settings', icon: <SettingsIcon />, text: t('admin:sideMenu.companySettings') },
    { path: '/admin/new-table', icon: <TableChartIcon />, text: t('admin:sideMenu.newTable') },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : miniDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniDrawerWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: '#F5F8FA',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DrawerHeader>
        {open ? (
          <MenuTitle variant="h6">{companyName || "Digital Knowledgee"}</MenuTitle>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ 
              color: primaryColor, 
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <CustomList>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <ListItem disablePadding>
              {open ? (
                <CustomListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? '#FFFFFF' : primaryColor,
                      minWidth: '40px',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </CustomListItemButton>
              ) : (
                <Tooltip title={item.text} placement="right">
                  <CustomListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      justifyContent: 'center',
                      padding: '16px 8px',
                      minHeight: '56px',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? '#FFFFFF' : primaryColor,
                        minWidth: '24px',
                        margin: 0,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </CustomListItemButton>
                </Tooltip>
              )}
            </ListItem>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </CustomList>
    </Drawer>
  );
}

export default SideMenu;