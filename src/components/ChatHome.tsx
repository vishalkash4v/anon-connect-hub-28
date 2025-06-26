
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import HomePage from './HomePage';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import ProfileView from './ProfileView';
import ChatList from './ChatList';
import ProfileEdit from './ProfileEdit';

const ChatHome: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'search' | 'profile' | 'chats' | 'profile-edit'>('home');
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
        onEditProfile={() => setActiveView('profile-edit')}
      />
    );
  }

  if (activeView === 'chats') {
    return (
      <ChatList 
        onBack={() => setActiveView('home')}
        onStartChat={handleStartChat}
      />
    );
  }

  if (activeView === 'profile-edit') {
    return (
      <ProfileEdit 
        onBack={() => setActiveView('profile')}
      />
    );
  }

  return (
    <HomePage 
      onStartChat={handleStartChat}
      onShowSearch={() => setActiveView('search')}
      onShowProfile={() => setActiveView('profile')}
      onShowChats={() => setActiveView('chats')}
      activeView={activeView}
      onViewChange={setActiveView}
    />
  );
};

export default ChatHome;
