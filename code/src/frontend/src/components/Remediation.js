import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  MenuItem,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material';

function Remediation() {
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [remediation, setRemediation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate API call to load flagged items
    const fetchFlaggedItems = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFlaggedItems([
          { id: 1, rule_name: "Amount Check", field_name: "amount" },
          { id: 2, rule_name: "Date Validation", field_name: "date" },
          { id: 3, rule_name: "Currency Check", field_name: "currency" }
        ]);
      } catch (error) {
        console.error('Error loading flagged items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlaggedItems();
  }, []);

  const handleGenerateRemediation = async () => {
    if (!selectedItem) return;
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRemediation(`
## Remediation Steps for ${selectedItem}

1. **Immediate Action**: Correct the value to be within acceptable range
2. **Root Cause**: Data entry error
3. **Preventive Measures**: 
   - Implement input validation
   - Add tooltips with acceptable ranges
4. **Business Justification**: 
   - Required for regulatory compliance
   - Ensures data integrity`);
    } catch (error) {
      setRemediation(`Error generating remediation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Remediation" />
      <CardContent>
        <Select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          fullWidth
          displayEmpty
          sx={{ mb: 2 }}
          disabled={isLoading || flaggedItems.length === 0}
        >
          <MenuItem value="" disabled>
            {isLoading ? 'Loading items...' : 'Select an item'}
          </MenuItem>
          {flaggedItems.map(item => (
            <MenuItem key={item.id} value={item.rule_name}>
              {item.rule_name} - {item.field_name}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          onClick={handleGenerateRemediation}
          disabled={!selectedItem || isLoading}
          fullWidth
        >
          Generate Remediation
        </Button>
        
        {isLoading && <LinearProgress sx={{ mt: 2 }} />}
        
        {remediation && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography component="div" sx={{ whiteSpace: 'pre-line' }}>
              {remediation}
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}

export default Remediation;