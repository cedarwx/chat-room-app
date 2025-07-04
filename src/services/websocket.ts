import { io, Socket } from 'socket.io-client';
import { Message, User, Room, ConnectionStatus } from '../types';

export interface WebSocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  reconnect: (attemptNumber: number) => void;
  reconnect_error: (error: Error) => void;
  
  // User events
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userStatusChanged: (user: User) => void;
  
  // Room events
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  roomDeleted: (roomId: string) => void;
  userJoinedRoom: (data: { user: User; roomId: string }) => void;
  userLeftRoom: (data: { userId: string; roomId: string }) => void;
  
  // Message events
  messageReceived: (message: Message) => void;
  messageUpdated: (message: Message) => void;
  messageDeleted: (data: { messageId: string; roomId: string }) => void;
  messageRead: (data: { messageId: string; userId: string }) => void;
  
  // System events
  systemMessage: (message: string) => void;
  error: (error: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<keyof WebSocketEvents, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Initialize empty arrays for all event types
    const eventTypes: (keyof WebSocketEvents)[] = [
      'connect', 'disconnect', 'reconnect', 'reconnect_error',
      'userJoined', 'userLeft', 'userStatusChanged',
      'roomCreated', 'roomUpdated', 'roomDeleted', 'userJoinedRoom', 'userLeftRoom',
      'messageReceived', 'messageUpdated', 'messageDeleted', 'messageRead',
      'systemMessage', 'error'
    ];

    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }

  connect(url: string = 'http://localhost:3001'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          timeout: 20000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connect');
          resolve();
        });

        this.socket.on('disconnect', (reason: string) => {
          console.log('Disconnected from WebSocket server:', reason);
          this.stopHeartbeat();
          this.emit('disconnect', reason);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
          console.log('Reconnected to WebSocket server, attempt:', attemptNumber);
          this.emit('reconnect', attemptNumber);
        });

        this.socket.on('reconnect_error', (error: Error) => {
          console.error('Reconnection error:', error);
          this.emit('reconnect_error', error);
        });

        // Handle server events
        this.socket.on('userJoined', (user: User) => {
          this.emit('userJoined', user);
        });

        this.socket.on('userLeft', (userId: string) => {
          this.emit('userLeft', userId);
        });

        this.socket.on('userStatusChanged', (user: User) => {
          this.emit('userStatusChanged', user);
        });

        this.socket.on('roomCreated', (room: Room) => {
          this.emit('roomCreated', room);
        });

        this.socket.on('roomUpdated', (room: Room) => {
          this.emit('roomUpdated', room);
        });

        this.socket.on('roomDeleted', (roomId: string) => {
          this.emit('roomDeleted', roomId);
        });

        this.socket.on('userJoinedRoom', (data: { user: User; roomId: string }) => {
          this.emit('userJoinedRoom', data);
        });

        this.socket.on('userLeftRoom', (data: { userId: string; roomId: string }) => {
          this.emit('userLeftRoom', data);
        });

        this.socket.on('messageReceived', (message: Message) => {
          this.emit('messageReceived', message);
        });

        this.socket.on('messageUpdated', (message: Message) => {
          this.emit('messageUpdated', message);
        });

        this.socket.on('messageDeleted', (data: { messageId: string; roomId: string }) => {
          this.emit('messageDeleted', data);
        });

        this.socket.on('messageRead', (data: { messageId: string; userId: string }) => {
          this.emit('messageRead', data);
        });

        this.socket.on('systemMessage', (message: string) => {
          this.emit('systemMessage', message);
        });

        this.socket.on('error', (error: string) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
        });

      } catch (error) {
        console.error('Failed to connect to WebSocket server:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.stopHeartbeat();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Client to server events
  authenticate(userId: string, token: string): void {
    if (this.socket) {
      this.socket.emit('authenticate', { userId, token });
    }
  }

  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId });
    }
  }

  sendMessage(roomId: string, content: string, type: 'text' | 'file' | 'emoji' = 'text', replyTo?: string): void {
    if (this.socket) {
      this.socket.emit('sendMessage', {
        roomId,
        content,
        type,
        replyTo,
        timestamp: new Date(),
      });
    }
  }

  editMessage(messageId: string, content: string): void {
    if (this.socket) {
      this.socket.emit('editMessage', { messageId, content });
    }
  }

  deleteMessage(messageId: string): void {
    if (this.socket) {
      this.socket.emit('deleteMessage', { messageId });
    }
  }

  markMessageAsRead(messageId: string): void {
    if (this.socket) {
      this.socket.emit('markMessageAsRead', { messageId });
    }
  }

  updateUserStatus(status: 'online' | 'offline' | 'away'): void {
    if (this.socket) {
      this.socket.emit('updateStatus', { status });
    }
  }

  createRoom(name: string, description?: string, isPrivate: boolean = false, maxUsers: number = 50): void {
    if (this.socket) {
      this.socket.emit('createRoom', { name, description, isPrivate, maxUsers });
    }
  }

  updateRoom(roomId: string, updates: Partial<Room>): void {
    if (this.socket) {
      this.socket.emit('updateRoom', { roomId, updates });
    }
  }

  deleteRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('deleteRoom', { roomId });
    }
  }

  // Event listener management
  on<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.push(callback as Function);
    }
  }

  off<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback as Function);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<T extends keyof WebSocketEvents>(event: T, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.isConnected(),
      isReconnecting: this.socket?.io?._reconnecting || false,
      lastHeartbeat: new Date(),
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService; 