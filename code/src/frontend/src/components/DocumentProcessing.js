import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  TextField, 
  LinearProgress, 
  Grid, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';

function DocumentProcessing() {
  const [files, setFiles] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');
  const [query, setQuery] = useState('');
  const [extractedRules, setExtractedRules] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleProcessDocuments = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessingStatus(`Successfully processed ${files.length} files`);
    } catch (error) {
      setProcessingStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractRules = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setExtractedRules({
        rules: [
          {
            rule_name: "Sample Rule",
            rule_description: "This is a sample rule extracted from documents",
            rule_condition: "value > 100",
            error_message: "Value exceeds limit"
          }
        ]
      });
    } catch (error) {
      setExtractedRules({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Document Upload" />
          <CardContent>
            <input
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              id="document-upload"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="document-upload">
              <Button
                variant="contained"
                component="span"
                fullWidth
                sx={{ mb: 2 }}
              >
                Select Documents
              </Button>
            </label>
            
            {files.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files:
                </Typography>
                <List dense>
                  {files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            <Button
              variant="contained"
              onClick={handleProcessDocuments}
              disabled={files.length === 0 || isLoading}
              fullWidth
            >
              Process Documents
            </Button>
            {isLoading && <LinearProgress sx={{ mt: 2 }} />}
            {processingStatus && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {processingStatus}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Rule Extraction" />
          <CardContent>
            <TextField
              label="Extraction Query"
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleExtractRules}
              disabled={!query.trim() || isLoading}
              fullWidth
            >
              Extract Rules
            </Button>
            {isLoading && <LinearProgress sx={{ mt: 2 }} />}
            {extractedRules && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <pre style={{ margin: 0 }}>{JSON.stringify(extractedRules, null, 2)}</pre>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default DocumentProcessing;