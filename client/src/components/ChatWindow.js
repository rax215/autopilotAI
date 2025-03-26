import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  Drawer,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import axios from 'axios';
import PopoutWindow from './PopoutWindow';

const drawerWidth = 350;

// Custom theme colors
const colors = {
  primary: '#7600bc',
  secondary: '#9c27b0',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  userMessage: '#f3e5f5',
  botMessage: '#e1bee7',
  headerBg: '#7600bc',
  drawerBg: '#fafafa',
};

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [popoutMessage, setPopoutMessage] = useState(null);
  const [llmProvider, setLlmProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedBrowser, setSelectedBrowser] = useState('custom');
  const [selectedScript, setSelectedScript] = useState('playwright');
  const [apiKey, setApiKey] = useState('');
  const [runningCode, setRunningCode] = useState(null);
  const [generatePlaywrightScript, setGeneratePlaywrightScript] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});
  const codeRunnerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      const loadingMessage = {
        type: 'system',
        content: 'Processing your request...',
        timestamp: new Date().toISOString(),
        isLoading: true
      };
      setMessages(prev => [...prev, loadingMessage]);
    }
  }, [isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey.trim()) {
      alert('Please enter both prompt and API key');
      return;
    }

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    //console.log(llmProvider, selectedModel, apiKey, selectedBrowser, selectedScript, input)

    try {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      const response = await axios.post('http://localhost:5000/api/data', {
        llmProvider,
        model: selectedModel,
        apiKey,
        browser: selectedBrowser,
        script: selectedScript,
        prompt: input,
        generatePlaywrightScript
      });
      console.log(response)

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Add the bot's response to messages
      const botMessage = {
        type: 'bot',
        content: response.data.generatedScript || response.data.response,
        timestamp: new Date().toISOString(),
        codeType: response.data.generatedScript ? true : false
      };

      setMessages((prev) => [...prev, botMessage]);

      // If there's additional result data, show it
      if (response.data.result) {
        const resultMessage = {
          type: 'system',
          content: typeof response.data.result === 'object' 
            ? JSON.stringify(response.data.result, null, 2) 
            : response.data.result,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, resultMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'error',
        content: error.response?.data?.error || error.message || 'Sorry, there was an error processing your request.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus({ ...copyStatus, [messageId]: true });
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [messageId]: false }));
      }, 5000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openPopoutWindow = (message) => {
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popoutWindow = window.open(
      '',
      'ResponsePopout',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (popoutWindow) {
      popoutWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Response Details</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Roboto', sans-serif;
              }
              .response-container {
                background-color: #f5f5f5;
                padding: 20px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .header {
                background-color: #1976d2;
                color: white;
                padding: 16px;
                margin: -20px -20px 20px -20px;
              }
              .copy-button {
                background-color: #1976d2;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .copy-button:hover {
                background-color: #1565c0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0;">Response Details</h2>
            </div>
            <div class="response-container">
              ${message.content}
            </div>
            <button class="copy-button" onclick="copyToClipboard()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy to Clipboard
            </button>
            <script>
              function copyToClipboard() {
                const content = \`${message.content.replace(/`/g, '\\`')}\`;
                navigator.clipboard.writeText(content)
                  .then(() => alert('Copied to clipboard!'))
                  .catch(err => console.error('Failed to copy text:', err));
              }
            </script>
          </body>
        </html>
      `);
      popoutWindow.document.close();
    }
  };

  const handleTryNow = async (code) => {
    try {
      console.log('Running code:', code);
      setRunningCode(code);
      const response = await axios.post('http://localhost:5001/run-code', { code });
      
      // Create a new message with the code execution result
      const executionResultMessage = {
        type: 'execution-result',
        content: response.data.output,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, executionResultMessage]);
    } catch (error) {
      console.error('Error running code:', error);
      const errorMessage = {
        type: 'error',
        content: error.response?.data?.error || 'Failed to run code',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setRunningCode(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <style>
        {`
          .loading-dots {
            display: inline-flex;
            align-items: center;
          }
          .loading-dots:after {
            content: '.';
            width: 1em;
            animation: dots 1.5s steps(4, end) infinite;
          }
          @keyframes dots {
            0%, 20% {
              content: '.';
            }
            40% {
              content: '..';
            }
            60% {
              content: '...';
            }
            80%, 100% {
              content: '';
            }
          }
        `}
      </style>
      {/* Header */}
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: colors.headerBg,
      }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Browserwrite AI
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Left Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: colors.drawerBg,
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ 
          overflow: 'auto', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          width: '100%',
          maxWidth: '90%'
        }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: colors.primary,
              textAlign: 'center'
            }}
          >
            Custom Configuration
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>LLM Provider</InputLabel>
            <Select
              value={llmProvider}
              label="LLM Provider"
              onChange={(e) => {
                setLlmProvider(e.target.value);
                setSelectedModel(e.target.value === 'openai' ? 'gpt-4o' : 'gemini-2.0-flash');
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
              }}
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="google">Google</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={selectedModel}
              label="Model"
              onChange={(e) => setSelectedModel(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
              }}
            >
              {llmProvider === 'openai' ? (
                [
                  <MenuItem key="gpt-4o" value="gpt-4o">GPT-4O</MenuItem>,
                  <MenuItem key="gpt-4o-mini" value="gpt-4o-mini">GPT-4O Mini</MenuItem>
                ]
              ) : (
                [
                  <MenuItem key="gemini-2.0-flash" value="gemini-2.0-flash">Gemini 2.0 Flash</MenuItem>,
                  <MenuItem key="gemini-1.5-pro" value="gemini-1.5-pro">Gemini 1.5 Pro</MenuItem>,
                  <MenuItem key="gemini-1.5-flash" value="gemini-1.5-flash">Gemini 1.5 Flash</MenuItem>
                ]
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Browser</InputLabel>
            <Select
              value={selectedBrowser}
              label="Browser"
              onChange={(e) => setSelectedBrowser(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
              }}
            >
              <MenuItem value="custom">Custom</MenuItem>
              <MenuItem value="chrome">Google Chrome</MenuItem>
              <MenuItem value="edge">Microsoft Edge</MenuItem>
              <MenuItem value="firefox">Firefox</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Output Script</InputLabel>
            <Select
              value={selectedScript}
              label="Output Script"
              onChange={(e) => setSelectedScript(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
              }}
            >
              <MenuItem value="playwright">Playwright</MenuItem>
              <MenuItem value="cypress">Cypress</MenuItem>
              <MenuItem value="puppeteer">Puppeteer</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.primary,
                },
                '&:hover fieldset': {
                  borderColor: colors.secondary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.primary,
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={generatePlaywrightScript}
                onChange={(e) => setGeneratePlaywrightScript(e.target.checked)}
                color="primary"
              />
            }
            label="Generate Playwright Script"
            sx={{ mb: 2 }}
          />
          
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: `${drawerWidth}px`,
          marginTop: '64px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 128px)',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Messages Container */}
        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            mb: 2,
            p: 2,
            backgroundColor: '#ffffff',
          }}
        >
          <List>
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    bgcolor: message.type === 'user' ? colors.userMessage :
                            message.type === 'bot' ? colors.botMessage :
                            message.type === 'system' ? 'rgba(0, 0, 0, 0.04)' :
                            message.type === 'error' ? '#ffebee' : 'transparent',
                    borderRadius: 2,
                    my: 1,
                    p: 2,
                    maxWidth: '80%',
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    {message.isLoading ? (
                      <Typography sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary',
                        fontStyle: 'italic'
                      }}>
                        <span className="loading-dots">Processing your request</span>
                      </Typography>
                    ) : (
                      <>
                        {message.content && (
                          <Typography
                            component="pre"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              fontFamily: message.codeType 
                                ? "'Roboto Mono', monospace" 
                                : "'Poppins', sans-serif",
                              backgroundColor: message.type === 'user' 
                                ? colors.userMessage 
                                : colors.botMessage,
                              padding: '16px',
                              borderRadius: '8px',
                              fontSize: message.codeType ? '0.9rem' : '0.95rem',
                              marginTop: '8px',
                              lineHeight: '1.6',
                              letterSpacing: message.codeType ? '0' : '0.3px',
                              color: '#333333',
                            }}
                          >
                            {message.content}
                          </Typography>
                        )}
                        {message.content && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => copyToClipboard(message.content, index)}
                              startIcon={<ContentCopyIcon />}
                              sx={{ 
                                color: colors.primary,
                                '&:hover': { 
                                  color: '#fff',
                                  backgroundColor: colors.primary 
                                },
                                textTransform: 'none',
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              {copyStatus[index] ? 'Copied!' : 'Copy'}
                            </Button>
                            <Button
                              size="small"
                              onClick={() => openPopoutWindow(message)}
                              startIcon={<LaunchIcon />}
                              sx={{ 
                                color: colors.warning,
                                '&:hover': { 
                                  color: '#fff',
                                  backgroundColor: colors.warning 
                                },
                                textTransform: 'none',
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              Popout
                            </Button>
                            {message.codeType && (
                              <Button
                                size="small"
                                onClick={() => handleTryNow(message.content)}
                                startIcon={<PlayCircleIcon />}
                                sx={{ 
                                  color: colors.success,
                                  '&:hover': { 
                                    color: '#fff',
                                    backgroundColor: colors.success 
                                  },
                                  textTransform: 'none',
                                  fontFamily: "'Roboto', sans-serif",
                                }}
                              >
                                Try Now
                              </Button>
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </ListItem>
                <Divider sx={{ my: 1 }} />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        {/* Input Container */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '0.95rem',
                },
                '&:hover .MuiOutlinedInput-root': {
                  '& > fieldset': { borderColor: colors.secondary },
                },
              }}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading}
              sx={{ 
                alignSelf: 'flex-end',
                backgroundColor: colors.primary,
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: colors.secondary,
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: colors.drawerBg,
          marginLeft: `${drawerWidth}px`,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ fontFamily: "'Roboto', sans-serif" }}
        >
          &copy; {new Date().getFullYear()} AI Chat Assistant. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatWindow;
