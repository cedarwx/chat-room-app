# Real-time Chat Room Application

A modern, real-time chat application built with React, TypeScript, and Socket.IO. This application provides a comprehensive chat experience with features similar to Discord, Slack, and other popular chat platforms.

## 🚀 Features

### Real-time Communication Core
- **Multi-user support**: Simultaneously support 50+ users online
- **Connection status**: Real-time display of user online/offline/away status
- **Reconnection**: Automatic network status detection, seamless reconnection
- **Heartbeat detection**: Regular ping-pong to ensure connection stability

### Message Features
- **Message types**: Plain text, emojis, system notifications, file sharing
- **Message status**: Sent, delivered, read receipts
- **Message editing**: Support message editing and recall (within 5 minutes)
- **Message search**: Full-text search of message history, filter by date
- **Message quoting**: Reply to specific messages, establish conversation threads

### Room Management
- **Room creation**: Dynamically create chat rooms, set room topics
- **Permission control**: Administrator and regular user permission levels
- **User removal**: Administrators can temporarily or permanently remove users
- **Room settings**: Modify room name, description, maximum user limit

### User Experience Optimization
- **Notification System**: Real-time alerts, sound notifications, do not disturb mode
- **Personalization**: User profiles, theme switching, font settings, quick replies
- **File Sharing**: Support for images, documents, compressed files with preview
- **Advanced Features**: Mention alerts, keyword monitoring, file upload management

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Socket.IO Client** - Real-time communication
- **React Icons** - Beautiful icon library
- **Custom CSS** - Modern, responsive design

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager

### Frontend Setup
```bash
# Navigate to the project directory
cd chat-room-app

# Install dependencies
yarn install

# Start the development server
yarn start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup
```bash
# Navigate to the server directory
cd server

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The backend will be available at `http://localhost:3001`

## 🎯 Usage

### Getting Started
1. Start both the frontend and backend servers
2. Open your browser and navigate to `http://localhost:3000`
3. Enter a username to join the chat
4. Select a room from the sidebar to start chatting

### Features Guide

#### Sending Messages
- Type your message in the input field
- Press Enter to send (Shift+Enter for new line)
- Use the emoji button to add emojis
- Use the attachment button to share files

#### Room Management
- Click on different rooms in the sidebar to switch
- Create new rooms using the room creation feature
- View room descriptions and member counts

#### User Management
- See online users in the sidebar
- View user status (online, away, offline)
- Click on usernames to view profiles

#### Message Features
- Edit your own messages by clicking the edit button
- Delete messages you've sent
- Reply to specific messages
- Search through message history

## 🏗 Project Structure

```
chat-room-app/
├── src/
│   ├── components/          # React components
│   │   ├── Login.tsx       # Login component
│   │   └── ChatRoom.tsx    # Main chat interface
│   ├── context/            # React context
│   │   └── ChatContext.tsx # Global state management
│   ├── services/           # Services and utilities
│   │   └── websocket.ts    # WebSocket service
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Application types
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
├── server/                 # Backend server
│   ├── server.js           # Express and Socket.IO server
│   └── package.json        # Server dependencies
├── public/                 # Static assets
└── package.json            # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_WEBSOCKET_URL=http://localhost:3001
PORT=3000
```

### Server Configuration
The server runs on port 3001 by default. You can change this by setting the `PORT` environment variable.

## 🚀 Deployment

### Frontend Deployment
```bash
# Build the production version
yarn build

# The build folder contains the production-ready files
```

### Backend Deployment
```bash
# Install production dependencies
yarn install --production

# Start the production server
yarn start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Chakra UI v3 compatibility issues (using custom CSS as workaround)
- File upload preview not fully implemented
- Emoji picker not implemented
- Message search functionality needs backend integration

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] File upload with cloud storage
- [ ] Voice and video chat
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Message encryption
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Happy Chatting! 💬**
