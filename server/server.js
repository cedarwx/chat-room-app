const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const users = new Map();
const rooms = new Map();
const userSockets = new Map();

// Initialize default rooms
const defaultRooms = [
  {
    id: 'general',
    name: 'General',
    description: 'General discussion',
    maxUsers: 50,
    createdAt: new Date(),
    createdBy: 'system',
    isPrivate: false,
    users: [],
    messages: []
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Random topics',
    maxUsers: 30,
    createdAt: new Date(),
    createdBy: 'system',
    isPrivate: false,
    users: [],
    messages: []
  }
];

defaultRooms.forEach(room => {
  rooms.set(room.id, room);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { userId, token } = data;
    // In a real app, validate the token
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log('User authenticated:', userId);
  });

  // Handle joining a room
  socket.on('joinRoom', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      socket.join(roomId);
      const user = users.get(socket.userId);
      if (user && !room.users.find(u => u.id === user.id)) {
        room.users.push(user);
        io.to(roomId).emit('userJoinedRoom', { user, roomId });
        console.log(`User ${user.username} joined room ${room.name}`);
      }
    }
  });

  // Handle leaving a room
  socket.on('leaveRoom', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      socket.leave(roomId);
      const user = users.get(socket.userId);
      if (user) {
        room.users = room.users.filter(u => u.id !== user.id);
        io.to(roomId).emit('userLeftRoom', { userId: user.id, roomId });
        console.log(`User ${user.username} left room ${room.name}`);
      }
    }
  });

  // Handle sending messages
  socket.on('sendMessage', (data) => {
    const { roomId, content, type, replyTo, timestamp } = data;
    const room = rooms.get(roomId);
    const user = users.get(socket.userId);
    
    if (room && user) {
      const message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        content,
        type: type || 'text',
        sender: user,
        roomId,
        timestamp: new Date(timestamp),
        readBy: [user.id],
        replyTo
      };
      
      room.messages.push(message);
      io.to(roomId).emit('messageReceived', message);
      console.log(`Message sent in ${room.name}: ${content}`);
    }
  });

  // Handle editing messages
  socket.on('editMessage', (data) => {
    const { messageId, content } = data;
    const user = users.get(socket.userId);
    
    if (user) {
      // Find message in all rooms
      for (const room of rooms.values()) {
        const message = room.messages.find(m => m.id === messageId);
        if (message && message.sender.id === user.id) {
          message.content = content;
          message.editedAt = new Date();
          message.isEdited = true;
          io.to(room.id).emit('messageUpdated', message);
          console.log(`Message edited: ${content}`);
          break;
        }
      }
    }
  });

  // Handle deleting messages
  socket.on('deleteMessage', (data) => {
    const { messageId } = data;
    const user = users.get(socket.userId);
    
    if (user) {
      // Find message in all rooms
      for (const room of rooms.values()) {
        const messageIndex = room.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1 && room.messages[messageIndex].sender.id === user.id) {
          room.messages.splice(messageIndex, 1);
          io.to(room.id).emit('messageDeleted', { messageId, roomId: room.id });
          console.log(`Message deleted by ${user.username}`);
          break;
        }
      }
    }
  });

  // Handle marking messages as read
  socket.on('markMessageAsRead', (data) => {
    const { messageId } = data;
    const user = users.get(socket.userId);
    
    if (user) {
      // Find message in all rooms
      for (const room of rooms.values()) {
        const message = room.messages.find(m => m.id === messageId);
        if (message && !message.readBy.includes(user.id)) {
          message.readBy.push(user.id);
          io.to(room.id).emit('messageRead', { messageId, userId: user.id });
          break;
        }
      }
    }
  });

  // Handle user status updates
  socket.on('updateStatus', (data) => {
    const { status } = data;
    const user = users.get(socket.userId);
    
    if (user) {
      user.status = status;
      io.emit('userStatusChanged', user);
      console.log(`User ${user.username} status changed to ${status}`);
    }
  });

  // Handle room creation
  socket.on('createRoom', (data) => {
    const { name, description, isPrivate, maxUsers } = data;
    const user = users.get(socket.userId);
    
    if (user) {
      const room = {
        id: `room_${Date.now()}`,
        name,
        description,
        maxUsers: maxUsers || 50,
        createdAt: new Date(),
        createdBy: user.id,
        isPrivate: isPrivate || false,
        users: [user],
        messages: []
      };
      
      rooms.set(room.id, room);
      io.emit('roomCreated', room);
      console.log(`Room created: ${name} by ${user.username}`);
    }
  });

  // Handle room updates
  socket.on('updateRoom', (data) => {
    const { roomId, updates } = data;
    const room = rooms.get(roomId);
    const user = users.get(socket.userId);
    
    if (room && user && room.createdBy === user.id) {
      Object.assign(room, updates);
      io.emit('roomUpdated', room);
      console.log(`Room updated: ${room.name}`);
    }
  });

  // Handle room deletion
  socket.on('deleteRoom', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    const user = users.get(socket.userId);
    
    if (room && user && room.createdBy === user.id) {
      rooms.delete(roomId);
      io.emit('roomDeleted', roomId);
      console.log(`Room deleted: ${room.name}`);
    }
  });

  // Handle heartbeat
  socket.on('heartbeat', () => {
    // Update last heartbeat time
    const user = users.get(socket.userId);
    if (user) {
      user.lastHeartbeat = new Date();
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      const user = users.get(socket.userId);
      if (user) {
        user.status = 'offline';
        userSockets.delete(socket.userId);
        io.emit('userStatusChanged', user);
        console.log(`User ${user.username} went offline`);
      }
    }
  });
});

// REST API endpoints
app.get('/api/rooms', (req, res) => {
  res.json(Array.from(rooms.values()));
});

app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

app.post('/api/users', (req, res) => {
  const { username, avatar } = req.body;
  const user = {
    id: `user_${Date.now()}`,
    username,
    avatar,
    status: 'online',
    joinedAt: new Date()
  };
  
  users.set(user.id, user);
  io.emit('userJoined', user);
  res.json(user);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
}); 