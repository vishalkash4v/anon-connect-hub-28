
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import HomePage from './HomePage';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import ProfileView from './ProfileView';
import ChatList from './ChatList';
import ProfileEdit from './ProfileEdit';
import BottomNavigation from './BottomNavigation';
import CreateGroupModal from './CreateGroupModal';

const ChatHome: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'search' | 'profile' | 'chats' | 'profile-edit'>('home');
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleStartChat = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveView('chat');
  };

  const handleShowCreateGroup = () => {
    setShowCreateGroup(true);
  };

  if (activeView === 'chat' && activeChatId) {
    return (
      <div className="min-h-screen pb-20">
        <ChatWindow 
          chatId={activeChatId} 
          onBack={() => setActiveView('home')}
        />
        <BottomNavigation
          activeView="home"
          onViewChange={setActiveView}
          onShowSearch={() => setActiveView('search')}
          onShowProfile={() => setActiveView('profile')}
          onShowChats={() => setActiveView('chats')}
          onShowCreateGroup={handleShowCreateGroup}
        />
      </div>
    );
  }

  if (activeView === 'search') {
    return (
      <div className="min-h-screen pb-20">
        <UserSearch 
          onBack={() => setActiveView('home')}
          onStartChat={handleStartChat}
        />
        <BottomNavigation
          activeView="search"
          onViewChange={setActiveView}
          onShowSearch={() => setActiveView('search')}
          onShowProfile={() => setActiveView('profile')}
          onShowChats={() => setActiveView('chats')}
          onShowCreateGroup={handleShowCreateGroup}
        />
      </div>
    );
  }

  if (activeView === 'profile') {
    return (
      <div className="min-h-screen pb-20">
        <ProfileView 
          onBack={() => setActiveView('home')}
          onEditProfile={() => setActiveView('profile-edit')}
        />
        <BottomNavigation
          activeView="profile"
          onViewChange={setActiveView}
          onShowSearch={() => setActiveView('search')}
          onShowProfile={() => setActiveView('profile')}
          onShowChats={() => setActiveView('chats')}
          onShowCreateGroup={handleShowCreateGroup}
        />
      </div>
    );
  }

  if (activeView === 'chats') {
    return (
      <div className="min-h-screen pb-20">
        <ChatList 
          onBack={() => setActiveView('home')}
          onStartChat={handleStartChat}
        />
        <BottomNavigation
          activeView="chats"
          onViewChange={setActiveView}
          onShowSearch={() => setActiveView('search')}
          onShowProfile={() => setActiveView('profile')}
          onShowChats={() => setActiveView('chats')}
          onShowCreateGroup={handleShowCreateGroup}
        />
      </div>
    );
  }

  if (activeView === 'profile-edit') {
    return (
      <div className="min-h-screen pb-20">
        <ProfileEdit 
          onBack={() => setActiveView('profile')}
        />
        <BottomNavigation
          activeView="profile"
          onViewChange={setActiveView}
          onShowSearch={() => setActiveView('search')}
          onShowProfile={() => setActiveView('profile')}
          onShowChats={() => setActiveView('chats')}
          onShowCreateGroup={handleShowCreateGroup}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <HomePage 
        onStartChat={handleStartChat}
        onShowSearch={() => setActiveView('search')}
        onShowProfile={() => setActiveView('profile')}
        onShowChats={() => setActiveView('chats')}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <BottomNavigation
        activeView="home"
        onViewChange={setActiveView}
        onShowSearch={() => setActiveView('search')}
        onShowProfile={() => setActiveView('profile')}
        onShowChats={() => setActiveView('chats')}
        onShowCreateGroup={handleShowCreateGroup}
      />
      <CreateGroupModal 
        open={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
      />
    </div>
  );
};

export default ChatHome;
