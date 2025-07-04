import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Room } from '../types';
import { useChat } from '../context/ChatContext';
import { websocketService } from '../services/websocket';
import { userService } from '../services/userService';

interface ChatRoomProps {
  currentUser: User;
  onLogout: () => void;
}

export function ChatRoom({ currentUser, onLogout }: ChatRoomProps) {
  const { state, dispatch } = useChat();
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'away' | 'offline'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockRooms: Room[] = [
    {
      id: '1',
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
      id: '2',
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

  // Use real users from context instead of mock users
  const realUsers = state.users;
  
  // Filter users based on status
  const filteredUsers = realUsers.filter(user => {
    if (userFilter === 'all') return true;
    return user.status === userFilter;
  });

  useEffect(() => {
    // Initialize with real users from user service
    const initialUsers = userService.getAllUsers();
    initialUsers.forEach(user => {
      dispatch({ type: 'ADD_USER', payload: user });
    });
  }, [dispatch]);

  useEffect(() => {
    // Initialize WebSocket connection
    const wsService = websocketService;
    
    // Connect to WebSocket
    wsService.connect('http://localhost:3001');
    
    // Set up event listeners for real-time user updates
    wsService.on('userJoined', (user: User) => {
      dispatch({ type: 'ADD_USER', payload: user });
    });
    
    wsService.on('userLeft', (userId: string) => {
      dispatch({ type: 'REMOVE_USER', payload: userId });
    });
    
    wsService.on('userStatusChanged', (user: User) => {
      dispatch({ type: 'UPDATE_USER', payload: user });
    });
    
    // Authenticate the current user
    wsService.authenticate(currentUser.id, 'mock-token');
    
    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, [currentUser.id, dispatch]);

  useEffect(() => {
    // Initialize with first room
    if (mockRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(mockRooms[0]);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoom?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRoom) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      content: message.trim(),
      type: 'text',
      sender: currentUser,
      roomId: selectedRoom.id,
      timestamp: new Date(),
      readBy: [currentUser.id],
    };

    // Add message to room
    const updatedRoom = {
      ...selectedRoom,
      messages: [...selectedRoom.messages, newMessage],
    };
    setSelectedRoom(updatedRoom);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedRoom) {
      const fileMessage: Message = {
        id: `file_${Date.now()}`,
        content: `📎 ${file.name}`,
        type: 'file',
        sender: currentUser,
        roomId: selectedRoom.id,
        timestamp: new Date(),
        readBy: [currentUser.id],
        fileName: file.name,
        fileSize: file.size,
      };

      const updatedRoom = {
        ...selectedRoom,
        messages: [...selectedRoom.messages, fileMessage],
      };
      setSelectedRoom(updatedRoom);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#48bb78';
      case 'away': return '#ed8936';
      case 'offline': return '#a0aec0';
      default: return '#a0aec0';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f7fafc' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3182ce',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}>
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{currentUser.username}</div>
              <div style={{ fontSize: '12px', color: '#48bb78' }}>Online</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="#a0aec0"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 35px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Rooms */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#a0aec0">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
              </svg>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>Rooms</span>
            </div>
            {mockRooms.map(room => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedRoom?.id === room.id ? '#ebf8ff' : 'transparent',
                  color: selectedRoom?.id === room.id ? '#3182ce' : '#2d3748',
                  marginBottom: '4px',
                  fontSize: '14px'
                }}
              >
                # {room.name}
              </div>
            ))}
          </div>

          {/* Users */}
          <div style={{ padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#a0aec0">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Users</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value as 'all' | 'online' | 'away' | 'offline')}
                  style={{
                    fontSize: '12px',
                    padding: '2px 6px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#2d3748',
                    outline: 'none'
                  }}
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                  <option value="all">All</option>
                </select>
                <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                  {filteredUsers.length}
                </span>
              </div>
            </div>
            {filteredUsers.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(user.status)
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#718096'
                    }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ color: '#2d3748' }}>{user.username}</span>
                  {user.id === currentUser.id && (
                    <span style={{ fontSize: '10px', color: '#a0aec0' }}>(you)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Room Header */}
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
              {selectedRoom ? `# ${selectedRoom.name}` : 'Select a room'}
            </h2>
            {selectedRoom && (
              <p style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>
                {selectedRoom.description}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          backgroundColor: '#f7fafc'
        }}>
          {selectedRoom?.messages.map(msg => (
            <div key={msg.id} style={{
              marginBottom: '16px',
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: msg.sender.id === currentUser.id ? '#3182ce' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: msg.sender.id === currentUser.id ? 'white' : '#2d3748',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {msg.sender.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
                    {msg.sender.username}
                  </span>
                  <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div style={{
                  backgroundColor: msg.sender.id === currentUser.id ? '#3182ce' : 'white',
                  color: msg.sender.id === currentUser.id ? 'white' : '#2d3748',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                style={{
                  width: '100%',
                  minHeight: '40px',
                  maxHeight: '120px',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#a0aec0'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </button>
              <button
                style={{
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#a0aec0'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                style={{
                  backgroundColor: message.trim() ? '#3182ce' : '#e2e8f0',
                  color: message.trim() ? 'white' : '#a0aec0',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: message.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                Send
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
} 