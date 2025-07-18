const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express()
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

app.set('io', io);

app.use(express.json());

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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