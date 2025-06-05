import React, { useState } from 'react';
import { styled } from '@mui/system';
import { Tabs as BaseTabs, TabsList as BaseTabsList, TabPanel as BaseTabPanel, Tab as BaseTab } from '@mui/base';

interface TabsProps {
  onTabChange: (event: React.SyntheticEvent<any, Event> | null, newValue: string | number | null) => void;
}

const Tab = styled(BaseTab)`
  /* Стили для Tab */
`;

const TabPanel = styled(BaseTabPanel)`
  /* Стили для TabPanel */
`;

const Tabs = styled(BaseTabs)`
  /* Стили для Tabs */
`;

const TabsList = styled(BaseTabsList)`
  /* Стили для TabsList */
`;

function UnstyledTabsVertical({ onTabChange }: TabsProps) {
  const [value, setValue] = useState<number | string>(0);

  const handleChange = (event: React.SyntheticEvent<any, Event> | null, newValue: string | number | null) => {
    setValue(newValue as number);
    onTabChange(event, newValue);
  };

  return (
    <Tabs value={value} orientation="vertical" onChange={handleChange}>
      <TabsList>
        <Tab value={0}>One</Tab>
        <Tab value={1}>Two</Tab>
      </TabsList>
      <TabPanel value={0}>
        {/* Contents of the first tab */}
      </TabPanel>
      <TabPanel value={1}>
        {/* Contents of the second tab */}
      </TabPanel>
    </Tabs>
  );
}

export default UnstyledTabsVertical;