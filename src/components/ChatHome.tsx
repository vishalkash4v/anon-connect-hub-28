
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import GroupList from './GroupList';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import { Users, MessageSquare, User } from 'lucide-react';

const ChatHome: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'search'>('home');
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [groupName, setGroupName] = useState('');
  const { currentUser, groups, chats, createGroup, startRandomChat } = useUser();

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGroup({ name: groupName.trim() });
      setGroupName('');
    }
  };

  const handleRandomChat = () => {
    const chatId = startRandomChat();
    if (chatId) {
      setActiveChatId(chatId);
      setActiveView('chat');
    } else {
      alert('No users available for random chat!');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">
                  {currentUser?.name || 'Anonymous User'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentUser?.isAnonymous ? 'Anonymous' : 'Profile User'}
                </p>
              </div>
            </div>
            <Button onClick={() => setActiveView('search')} variant="outline">
              <User className="w-4 h-4 mr-2" />
              Find Users
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Random Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Connect with a random user for an instant chat
              </p>
              <Button onClick={handleRandomChat} className="w-full">
                Start Random Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Create Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups and Chats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GroupList onJoinGroup={handleStartChat} />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Chats</CardTitle>
            </CardHeader>
            <CardContent>
              {chats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No chats yet. Start a conversation!
                </p>
              ) : (
                <div className="space-y-3">
                  {chats.slice(0, 5).map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStartChat(chat.id)}
                    >
                      <div>
                        <p className="font-medium">
                          {chat.type === 'group' ? 'Group Chat' : 'Direct Chat'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatHome;
