const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express()
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

// Make io accessible to our router
app.set('io', io);

// Body parser middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

io.on('connection', (socket) => {
  console.log('A user connected');
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  }
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (userId) console.log(`User ${userId} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));