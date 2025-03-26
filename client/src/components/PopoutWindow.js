import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const PopoutWindow = ({ message, onClose }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2, backgroundColor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Response Details</Typography>
        <IconButton color="inherit" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
        <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5', position: 'relative' }}>
          <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={copyToClipboard}
            variant="contained"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            Copy
          </Button>
        </Paper>
      </Box>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Sent at: {new Date(message.timestamp).toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default PopoutWindow;
