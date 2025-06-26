
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import HomePage from './HomePage';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import ProfileView from './ProfileView';

const ChatHome: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'search' | 'profile'>('home');
  const [activeChatId, setActiveChatId] = useState<string>('');

  const handleStartChat = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveView('chat');
  };

  if (activeView === 'chat' && activeChatId) {
    return (
      <ChatWindow 
        chatId={activeChatId} 
        onBack={() => setActiveView('home')}
      />
    );
  }

  if (activeView === 'search') {
    return (
      <UserSearch 
        onBack={() => setActiveView('home')}
        onStartChat={handleStartChat}
      />
    );
  }

  if (activeView === 'profile') {
    return (
      <ProfileView 
        onBack={() => setActiveView('home')}
      />
    );
  }

  return (
    <HomePage 
      onStartChat={handleStartChat}
      onShowSearch={() => setActiveView('search')}
      onShowProfile={() => setActiveView('profile')}
    />
  );
};

export default ChatHome;
