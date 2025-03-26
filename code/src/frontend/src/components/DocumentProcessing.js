import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  LinearProgress,
  Grid,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import { documentService } from '../services/api';

function DocumentProcessing() {
  const [files, setFiles] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileInfo, setSelectedFileInfo] = useState({
    index: '',
    fileName: ''
  }); const [query, setQuery] = useState('');
  const [extractedRules, setExtractedRules] = useState(null);

  useEffect(() => {
    const fetchProcessedDocs = async () => {
      // try {
      // setIsLoading(prev => ({...prev, fetch: true}));
      const docs = await documentService.getDocuments();
      setUploadedFiles(docs);
      // if (docs.length > 0) {
      //   setSelectedDocId(docs[0].id);
      // }
      // } catch (err) {
      //   setError('Failed to load documents');
      // } 
      // finally {
      //   setIsLoading(prev => ({...prev, fetch: false}));
      // }
    };
    fetchProcessedDocs();
  }, []);


  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleProcessDocuments = async () => {
    setIsLoading(true);
    setProcessingStatus('');
    try {
      const result = await documentService.uploadDocuments(files);
      if (result.success) {
        setProcessingStatus(`Successfully processed ${files.length} files`);
      } else {
        setProcessingStatus(`Error processing ${files.length} files`);
      }
    } catch (error) {
      setProcessingStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractRules = async () => {
    if (selectedFileInfo.index === '' || !query.trim()) return;
    console.log(selectedFileInfo);
    setIsLoading(true);
    try {
      // Simulate API call
      const rules = await documentService.extractRules({
        index: selectedFileInfo.index,
        fileName: selectedFileInfo.fileName,
        query
      });
      setExtractedRules(rules);
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
            {uploadedFiles.length > 0 ? (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Processed Document</InputLabel>
                  <Select
                    value={selectedFileInfo.id}
                    onChange={(e) => {
                      const selectedFile = uploadedFiles[e.target.value];
                      setSelectedFileInfo({
                        index: selectedFile.index,
                        fileName: selectedFile.fileName
                      });
                    }}
                    label="Select Document"
                  >
                    {uploadedFiles.map((doc) => (
                      <MenuItem key={doc.fileName} value={doc.id}>
                        {doc.fileName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                  disabled={!selectedFileInfo.index || !query.trim() || isLoading.extract}
                  fullWidth
                >
                  Extract Rules
                </Button>
              </>
            ) : (
              <Typography color="text.secondary">
                No processed documents available
              </Typography>
            )}

            {/* Results display */}
            {extractedRules && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6">Extracted Rules</Typography>
                <pre>{JSON.stringify(extractedRules, null, 2)}</pre>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default DocumentProcessing;