import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Login } from './components/Login';
import { ChatRoom } from './components/ChatRoom';
import { User } from './types';
import './App.css';

function AppContent() {
  const { state, dispatch } = useChat();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Add user to the global users list
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
    dispatch({ type: 'ADD_USER', payload: user });
  };

  const handleLogout = () => {
    if (currentUser) {
      // Remove user from the global users list
      dispatch({ type: 'REMOVE_USER', payload: currentUser.id });
      dispatch({ type: 'CLEAR_CURRENT_USER' });
    }
    setCurrentUser(null);
  };

  return (
    <div className="App">
      {currentUser ? (
        <ChatRoom currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
