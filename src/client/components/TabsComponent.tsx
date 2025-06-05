import React from 'react';
import { Tabs, Tab } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import { styled } from '@mui/material/styles';

interface TabsComponentProps {
  tabIndex: number;
  handleTabChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#105e82',
  },
});

const StyledTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    color: '#105e82',
    '& .MuiSvgIcon-root': {
      color: '#105e82',
      opacity: 1,
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: 28,
    color: '#105e82',
    opacity: 0.5, 
  },
  transition: 'background-color 0.3s ease, transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const TabsComponent: React.FC<TabsComponentProps> = ({ tabIndex, handleTabChange }) => {
  return (
    <StyledTabs
      value={tabIndex}
      onChange={handleTabChange}
      centered
      sx={{
        mb: 2,
        width: '100%',
        '.MuiTabs-flexContainer': {
          width: '100%',
        },
        '.MuiTab-root': {
          flexGrow: 1,
          minWidth: 80,
          minHeight: 50,
          fontSize: '1rem',
        },
      }}
    >
      <StyledTab icon={<AccessTimeIcon />} aria-label="time" />
      <StyledTab icon={<BarChartIcon />} aria-label="summary" />
      <StyledTab icon={<GroupIcon />} aria-label="team" />
    </StyledTabs>
  );
};

export default TabsComponent;
