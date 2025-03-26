import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DocumentProcessing from './DocumentProcessing';
import RuleGeneration from './RuleGeneration';
import DataValidation from './DataValidation';
import Remediation from './Remediation';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MainTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} variant="fullWidth">
          <Tab label="Document Processing" />
          <Tab label="Rule Generation" />
          <Tab label="Data Validation" />
          <Tab label="Remediation" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <DocumentProcessing />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RuleGeneration />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <DataValidation />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Remediation />
      </TabPanel>
    </Box>
  );
}

export default MainTabs;