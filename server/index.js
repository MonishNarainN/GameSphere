import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const onlineUsers = new Map(); // socket.id -> username

app.use(cors());
app.use(express.json());

// --- Connect to all databases ---
const reviewConn = mongoose.createConnection('mongodb://localhost:27017/REVIEWDB');
const chatConn = mongoose.createConnection('mongodb://localhost:27017/chatDB');
const loginConn = mongoose.createConnection('mongodb://localhost:27017/loginDB');

// --- Define Schemas and Models with explicit collection names ---
const Review = reviewConn.model('Review', new mongoose.Schema({
  game: String,
  review: String,
  user: String,
  rating: Number,
  avatar: String,
}), 'REVIEW');

const ChatMessage = chatConn.model('ChatMessage', new mongoose.Schema({
  user: String,
  message: String,
  timestamp: Date,
}), 'chat');

const User = loginConn.model('User', new mongoose.Schema({
  username: String,
  password: String, // In production, hash this!
  avatar: String,
}), 'login');

// --- Review Routes ---
app.get('/api/reviews', async (req, res) => {
  const reviews = await Review.find();
  res.json(reviews);
});
app.post('/api/reviews', async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  const io = req.app.get('io');
  if (io) {
    io.emit('new review', review);
  }
  res.json(review);
});

// --- Games Routes ---
app.get('/api/games', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'games.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading games.json:', error);
    res.status(500).json({ success: false, message: 'Failed to load games data' });
  }
});

// --- Chat Routes ---
app.get('/api/chat', async (req, res) => {
  const messages = await ChatMessage.find();
  res.json(messages);
});
app.post('/api/chat', async (req, res) => {
  const msg = new ChatMessage({ ...req.body, timestamp: new Date() });
  await msg.save();
  res.json(msg);
});

// --- Login Routes ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) res.json({ success: true, user });
  else res.status(401).json({ success: false, message: 'Invalid credentials' });
});
app.post('/api/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// Add a root route for health check or friendly message
app.get('/', (req, res) => {
  res.send('GameSphere API is running!');
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const DEFAULT_PORT = 5000;
const localIP = getLocalIP();

function startServer(port) {
  // Create a new server and io instance for each attempt
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  app.set('io', io);

  // --- Socket.IO for real-time chat ---
  io.on('connection', (socket) => {
    socket.on('user joined', (username) => {
      onlineUsers.set(socket.id, username);
      io.emit('online users', Array.from(new Set(onlineUsers.values())));
    });

    socket.on('disconnect', () => {
      if (onlineUsers.has(socket.id)) {
        onlineUsers.delete(socket.id);
        io.emit('online users', Array.from(new Set(onlineUsers.values())));
      }
    });

    socket.on('chat message', async (msg) => {
      const chatMsg = new ChatMessage({ ...msg, timestamp: new Date() });
      await chatMsg.save();
      io.emit('chat message', chatMsg);
    });
  });

  server.listen(port, () => {
    console.log(`\nServer running!`);
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://${localIP}:${port}/\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT); 