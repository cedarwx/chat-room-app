import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChatState, User, Room, Message, ConnectionStatus, UserSettings, FileUpload } from '../types';

// Action types
type ChatAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'CLEAR_CURRENT_USER' }
  | { type: 'SET_CURRENT_ROOM'; payload: Room }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'REMOVE_ROOM'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'ADD_FILE_UPLOAD'; payload: FileUpload }
  | { type: 'UPDATE_FILE_UPLOAD'; payload: FileUpload }
  | { type: 'REMOVE_FILE_UPLOAD'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: Message[] };

// Initial state
const initialState: ChatState = {
  currentUser: null,
  currentRoom: null,
  rooms: [],
  users: [],
  connectionStatus: {
    isConnected: false,
    isReconnecting: false,
    lastHeartbeat: new Date(),
  },
  userSettings: {
    theme: 'auto',
    fontSize: 'medium',
    lineSpacing: 'normal',
    quickReplies: ['Hello!', 'Thanks!', 'See you later!'],
    notifications: {
      soundEnabled: true,
      desktopNotifications: true,
      doNotDisturb: false,
      mentionAlerts: true,
      keywordAlerts: [],
    },
  },
  fileUploads: [],
  searchQuery: '',
  searchResults: [],
};

// Reducer function
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'CLEAR_CURRENT_USER':
      return { ...state, currentUser: null };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room => 
          room.id === action.payload.id ? action.payload : room
        ),
        currentRoom: state.currentRoom?.id === action.payload.id ? action.payload : state.currentRoom,
      };
    
    case 'REMOVE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload),
        currentRoom: state.currentRoom?.id === action.payload ? null : state.currentRoom,
      };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser,
      };
    
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.roomId
            ? { ...room, messages: [...room.messages, action.payload] }
            : room
        ),
        currentRoom: state.currentRoom?.id === action.payload.roomId
          ? { ...state.currentRoom, messages: [...state.currentRoom.messages, action.payload] }
          : state.currentRoom,
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.roomId
            ? {
                ...room,
                messages: room.messages.map(msg =>
                  msg.id === action.payload.id ? action.payload : msg
                ),
              }
            : room
        ),
        currentRoom: state.currentRoom?.id === action.payload.roomId
          ? {
              ...state.currentRoom,
              messages: state.currentRoom.messages.map(msg =>
                msg.id === action.payload.id ? action.payload : msg
              ),
            }
          : state.currentRoom,
      };
    
    case 'REMOVE_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map(room => ({
          ...room,
          messages: room.messages.filter(msg => msg.id !== action.payload),
        })),
        currentRoom: state.currentRoom
          ? {
              ...state.currentRoom,
              messages: state.currentRoom.messages.filter(msg => msg.id !== action.payload),
            }
          : state.currentRoom,
      };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'UPDATE_USER_SETTINGS':
      return {
        ...state,
        userSettings: { ...state.userSettings, ...action.payload },
      };
    
    case 'ADD_FILE_UPLOAD':
      return { ...state, fileUploads: [...state.fileUploads, action.payload] };
    
    case 'UPDATE_FILE_UPLOAD':
      return {
        ...state,
        fileUploads: state.fileUploads.map(upload =>
          upload.id === action.payload.id ? action.payload : upload
        ),
      };
    
    case 'REMOVE_FILE_UPLOAD':
      return {
        ...state,
        fileUploads: state.fileUploads.filter(upload => upload.id !== action.payload),
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    
    default:
      return state;
  }
}

// Context
interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 