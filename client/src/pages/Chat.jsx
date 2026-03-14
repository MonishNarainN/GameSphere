import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  Chip,
} from '@mui/material';
import { Send as SendIcon, SportsEsports } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io(); // Uses Vite proxy

function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // We memoize the random username just in case they aren't logged in
  const [currentUsername] = useState(() => user?.username || `Guest-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(setMessages);

    socket.emit('user joined', currentUsername);

    socket.on('online users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('chat message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.off('online users');
      socket.off('chat message');
    };
  }, [currentUsername]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      user: currentUsername,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`,
    };
    socket.emit('chat message', msg);
    setNewMessage('');
  };

  return (
    <Box sx={{ minHeight: '90vh', py: 4, background: 'linear-gradient(45deg, #121212 30%, #1E1E1E 90%)' }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                sx={{
                  height: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Rajdhani' }}>
                    Gaming Chat Room
                  </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={msg._id || msg.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'start',
                            mb: 2,
                          }}
                        >
                          <Avatar src={msg.avatar} sx={{ mr: 2 }} />
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 'bold', mr: 1 }}
                              >
                                {msg.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {msg.timestamp}
                              </Typography>
                            </Box>
                            <Typography variant="body1">{msg.message}</Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                </Box>

                <Box
                  component="form"
                  onSubmit={handleSendMessage}
                  sx={{
                    p: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                    >
                      Send
                    </Button>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Rajdhani' }}>
                  Online Gamers
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {onlineUsers.map((user) => (
                    <Chip
                      key={user}
                      avatar={<Avatar><SportsEsports /></Avatar>}
                      label={user}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Chat; 