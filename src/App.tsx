import React, { useState } from 'react';
import { ChatProvider } from './context/ChatContext';
import { Login } from './components/Login';
import { ChatRoom } from './components/ChatRoom';
import { User } from './types';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <ChatProvider>
      <div className="App">
        {currentUser ? (
          <ChatRoom currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </ChatProvider>
  );
}

export default App;
