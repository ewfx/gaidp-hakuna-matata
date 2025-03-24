import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Grid,
  TextField,
  Typography
} from '@mui/material';

function DataValidation() {
  const [inputMethod, setInputMethod] = useState('upload');
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState([{ amount: '', currency: '', date: '' }]);
  const [selectedRule, setSelectedRule] = useState('');
  const [validationResults, setValidationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleManualDataChange = (index, field, value) => {
    const newData = [...manualData];
    newData[index][field] = value;
    setManualData(newData);
  };

  const addManualRow = () => {
    setManualData([...manualData, { amount: '', currency: '', date: '' }]);
  };

  const removeManualRow = (index) => {
    if (manualData.length > 1) {
      const newData = manualData.filter((_, i) => i !== index);
      setManualData(newData);
    }
  };

  const handleValidate = async () => {
    if (!selectedRule) {
      alert('Please select a rule first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setValidationResults([
        { row_index: 1, field: 'amount', error: 'Value exceeds limit' },
        { row_index: 3, field: 'date', error: 'Invalid date format' }
      ]);
    } catch (error) {
      setValidationResults([{ Error: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Data Validation" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Input Method</FormLabel>
              <RadioGroup
                row
                value={inputMethod}
                onChange={(e) => setInputMethod(e.target.value)}
              >
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label="Upload File"
                />
                <FormControlLabel
                  value="manual"
                  control={<Radio />}
                  label="Manual Input"
                />
              </RadioGroup>
            </FormControl>

            {inputMethod === 'upload' ? (
              <>
                <input
                  accept=".csv,.xlsx"
                  style={{ display: 'none' }}
                  id="data-upload"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor="data-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {file ? file.name : 'Select Data File'}
                  </Button>
                </label>
              </>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Amount</TableCell>
                      <TableCell>Currency</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manualData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.amount}
                            onChange={(e) =>
                              handleManualDataChange(index, 'amount', e.target.value)
                            }
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.currency}
                            onChange={(e) =>
                              handleManualDataChange(index, 'currency', e.target.value)
                            }
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={row.date}
                            onChange={(e) =>
                              handleManualDataChange(index, 'date', e.target.value)
                            }
                            size="small"
                            fullWidth
                            InputLabelProps={{
                              shrink: true
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button onClick={addManualRow} sx={{ m: 1 }}>
                  Add Row
                </Button>
              </TableContainer>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedRule}
                onChange={(e) => setSelectedRule(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a validation rule
                </MenuItem>
                <MenuItem value="Amount Check">Amount Check</MenuItem>
                <MenuItem value="Date Validation">Date Validation</MenuItem>
                <MenuItem value="Currency Check">Currency Check</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleValidate}
              disabled={isLoading || !selectedRule}
              fullWidth
            >
              Validate Data
            </Button>
            {isLoading && <LinearProgress sx={{ mt: 2 }} />}
          </Grid>

          <Grid item xs={12} md={6}>
            {validationResults && (
              <>
                <Typography variant="h6" gutterBottom>
                  Validation Results
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(validationResults[0]).map((key) => (
                          <TableCell key={key}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validationResults.map((result, index) => (
                        <TableRow key={index}>
                          {Object.values(result).map((value, i) => (
                            <TableCell key={i}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default DataValidation;