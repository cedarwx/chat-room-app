export interface User {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  isAdmin?: boolean;
  joinedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'file' | 'system' | 'emoji';
  sender: User;
  roomId: string;
  timestamp: Date;
  editedAt?: Date;
  isEdited?: boolean;
  replyTo?: Message;
  readBy: string[]; // Array of user IDs who have read the message
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  maxUsers: number;
  createdAt: Date;
  createdBy: string;
  isPrivate: boolean;
  users: User[];
  messages: Message[];
}

export interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastHeartbeat: Date;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  doNotDisturb: boolean;
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
  mentionAlerts: boolean;
  keywordAlerts: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'tight' | 'normal' | 'loose';
  quickReplies: string[];
  notifications: NotificationSettings;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface ChatState {
  currentUser: User | null;
  currentRoom: Room | null;
  rooms: Room[];
  users: User[];
  connectionStatus: ConnectionStatus;
  userSettings: UserSettings;
  fileUploads: FileUpload[];
  searchQuery: string;
  searchResults: Message[];
} 