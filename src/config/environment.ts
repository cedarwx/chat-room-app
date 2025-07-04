// Environment configuration for WebSocket connections
export const getWebSocketUrl = (): string => {
  // Check if we're in production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable for production WebSocket URL
    // You'll need to set this in your Vercel environment variables
    return process.env.REACT_APP_WEBSOCKET_URL || 'wss://your-backend-domain.com';
  }
  
  // Development environment
  return 'http://localhost:3001';
};

export const getApiUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://your-backend-domain.com';
  }
  
  return 'http://localhost:3001';
}; 