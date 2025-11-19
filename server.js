const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store data
let sosSignals = [];
let chatMessages = [];
let connectedUsers = new Map();

// Handle connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send existing data to new user
  socket.emit('sosHistory', sosSignals);
  socket.emit('chatHistory', chatMessages);
  socket.emit('userCount', connectedUsers.size);

  // Handle SOS signal
  socket.on('sendSOS', (data) => {
    const sosData = {
      id: socket.id,
      timestamp: new Date().toLocaleTimeString(),
      location: data.location || 'Location unknown',
      coordinates: data.coordinates,
      type: 'SOS'
    };
    
    sosSignals.push(sosData);
    console.log('SOS Received:', sosData);
    io.emit('newSOS', sosData);
  });

  // Handle chat messages
  socket.on('sendChat', (data) => {
    const chatData = {
      id: socket.id,
      username: data.username || 'Survivor',
      message: data.message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    chatMessages.push(chatData);
    io.emit('newChat', chatData);
  });

  // Handle user info
  socket.on('userJoin', (username) => {
    connectedUsers.set(socket.id, username || 'Survivor');
    io.emit('userCount', connectedUsers.size);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    io.emit('userCount', connectedUsers.size);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sahayak Net Server running on http://localhost:${PORT}`);
  console.log(`📱 Connect phones to this network and visit the above URL`);
});