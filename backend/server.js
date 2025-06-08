const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Configure CORS for Express
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST']
}));

const server = http.createServer(app);

// Configure Socket.IO with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store room information for video conference
const rooms = new Map();

// Store chat messages for collaboration
const chatMessages = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    
    // Handle video conference cleanup
    rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        io.to(roomId).emit('user-left', { userId: socket.id });
        
        if (room.host === socket.id && room.participants.size > 0) {
          const newHost = Array.from(room.participants)[0];
          room.host = newHost;
          io.to(newHost).emit('new-host', { newHostId: newHost });
          io.to(roomId).emit('new-host', { newHostId: newHost });
        } else if (room.participants.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });

  // Video Conference Events
  socket.on('create-room', (data) => {
    try {
      const { roomId, userId } = data;
      if (!roomId || !userId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          host: userId,
          participants: new Set([userId])
        });
        socket.join(roomId);
        socket.emit('room-created', { roomId });
        console.log(`Room ${roomId} created by ${userId}`);
      } else {
        socket.emit('error', { message: 'Room already exists' });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Error creating room' });
    }
  });

  socket.on('join-room', (data) => {
    try {
      const { roomId, userId } = data;
      if (!roomId || !userId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.participants.add(userId);
        socket.join(roomId);
        socket.emit('room-joined', { roomId });

        socket.to(roomId).emit('user-joined', {
          id: userId,
          name: `User${Math.floor(Math.random() * 1000)}`,
          isHost: false
        });

        const participants = Array.from(room.participants)
          .filter(id => id !== userId)
          .map(id => ({
            id,
            name: `User${Math.floor(Math.random() * 1000)}`,
            isHost: id === room.host
          }));
        
        socket.emit('existing-participants', participants);
        console.log(`User ${userId} joined room ${roomId}`);
      } else {
        socket.emit('error', { message: 'Room does not exist' });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Error joining room' });
    }
  });

  socket.on('end-room', (data) => {
    const { roomId, userId } = data;
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.host === userId) {
        io.to(roomId).emit('room-ended');
        room.participants.forEach(participantId => {
          io.to(participantId).emit('room-ended');
        });
        rooms.delete(roomId);
        console.log(`Room ${roomId} ended by host ${userId}`);
      }
    }
  });

  socket.on('offer', (data) => {
    const { roomId, userId, targetUserId, signal } = data;
    if (rooms.has(roomId)) {
      socket.to(targetUserId).emit('offer', {
        userId,
        signal
      });
    }
  });

  socket.on('answer', (data) => {
    const { roomId, userId, targetUserId, signal } = data;
    if (rooms.has(roomId)) {
      socket.to(targetUserId).emit('answer', {
        userId,
        signal
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    const { roomId, userId, targetUserId, candidate } = data;
    if (rooms.has(roomId)) {
      socket.to(targetUserId).emit('ice-candidate', {
        userId,
        candidate
      });
    }
  });

  // Collaboration Events
  socket.on('join-collaboration', (data) => {
    try {
      const { roomId, userId } = data;
      if (!roomId || !userId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      socket.join(roomId);
      
      if (!chatMessages.has(roomId)) {
        chatMessages.set(roomId, []);
      }
      
      socket.emit('existing-messages', {
        roomId,
        messages: chatMessages.get(roomId)
      });
    } catch (error) {
      console.error('Error joining collaboration:', error);
      socket.emit('error', { message: 'Error joining collaboration' });
    }
  });

  socket.on('message', (data) => {
    try {
      if (!data) {
        console.error('Message event received with no data');
        return;
      }

      const { roomId, message } = data;
      if (!roomId || !message) {
        console.error('Missing required fields in message:', data);
        return;
      }

      if (!chatMessages.has(roomId)) {
        chatMessages.set(roomId, []);
      }

      const messageWithId = {
        ...message,
        id: message.id || Date.now().toString(),
        timestamp: message.timestamp || new Date().toISOString()
      };

      chatMessages.get(roomId).push(messageWithId);
      io.to(roomId).emit('message', messageWithId);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Error handling message' });
    }
  });

  socket.on('typing', (data) => {
    try {
      if (!data) {
        console.error('Typing event received with no data');
        return;
      }

      const { roomId, userId } = data;
      if (!roomId || !userId) {
        console.error('Missing required fields in typing event:', data);
        return;
      }

      socket.to(roomId).emit('user-typing', { 
        userId, 
        isTyping: true 
      });
    } catch (error) {
      console.error('Error handling typing event:', error);
    }
  });

  socket.on('stopped-typing', (data) => {
    try {
      if (!data) {
        console.error('Stopped typing event received with no data');
        return;
      }

      const { roomId, userId } = data;
      if (!roomId || !userId) {
        console.error('Missing required fields in stopped typing event:', data);
        return;
      }

      socket.to(roomId).emit('user-stopped-typing', { 
        userId, 
        isTyping: false 
      });
    } catch (error) {
      console.error('Error handling stopped typing event:', error);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 