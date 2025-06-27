
import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { User, Group, Chat, Message, UserContextType } from '@/types/user';
import { loadFromStorage } from '@/utils/localStorage';
import { useUserActions } from '@/hooks/useUserActions';
import { useGroupActions } from '@/hooks/useGroupActions';
import { useChatActions } from '@/hooks/useChatActions';
import { useSearchActions } from '@/hooks/useSearchActions';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [trendingGroups, setTrendingGroups] = useState<Group[]>([]);
  const [newGroups, setNewGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);

  // Initialize hooks
  const userActions = useUserActions(currentUser, setCurrentUser, users, setUsers);
  const groupActions = useGroupActions(
    currentUser, 
    groups, 
    setGroups, 
    setTrendingGroups, 
    setNewGroups, 
    setPopularGroups
  );
  const chatActions = useChatActions(currentUser, chats, setChats, users);
  const searchActions = useSearchActions(currentUser, users, groups);

  useEffect(() => {
    const savedData = loadFromStorage();
    setCurrentUser(savedData.currentUser);
    setUsers(savedData.users);
    setGroups(savedData.groups);
    setChats(savedData.chats);
  }, []);

  useEffect(() => {
    if (currentUser) {
      console.log('🔌 Setting up socket for user:', currentUser.id);
      socketService.connect();
      
      setTimeout(() => {
        if (socketService.isConnected()) {
          socketService.join(currentUser.id);
        }
      }, 1000);

      // Handle incoming messages
      socketService.onMessage((socketMessage) => {
        console.log('📨 Processing incoming message:', socketMessage);
        
        const newMessage: Message = {
          id: socketMessage._id,
          senderId: socketMessage.from,
          content: socketMessage.message,
          timestamp: new Date(socketMessage.createdAt),
          type: 'text'
        };

        setChats(prev => {
          const chatId = socketMessage.type === 'private' 
            ? prev.find(c => 
                c.type === 'direct' && 
                c.participants.includes(currentUser.id) && 
                c.participants.includes(socketMessage.from)
              )?.id
            : socketMessage.groupId;

          if (!chatId) {
            console.log('❌ No matching chat found for message');
            return prev;
          }

          const updated = prev.map(chat => 
            chat.id === chatId
              ? { 
                  ...chat, 
                  messages: [...chat.messages, newMessage],
                  lastMessage: newMessage,
                  updatedAt: new Date()
                }
              : chat
          );
          
          localStorage.setItem('chats', JSON.stringify(updated));
          return updated;
        });
      });

      socketService.onUserOnline((userId) => {
        console.log('🟢 User came online:', userId);
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      socketService.onUserOffline((userId) => {
        console.log('🔴 User went offline:', userId);
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      socketService.onTyping((fromUserId) => {
        console.log('⌨️ User started typing:', fromUserId);
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(fromUserId, 'typing');
          return newMap;
        });
      });

      socketService.onStopTyping((fromUserId) => {
        console.log('⏹️ User stopped typing:', fromUserId);
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(fromUserId);
          return newMap;
        });
      });
    }

    return () => {
      if (!currentUser) {
        socketService.disconnect();
      }
    };
  }, [currentUser]);

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      groups,
      chats,
      loading: userActions.loading || groupActions.loading,
      onlineUsers,
      typingUsers,
      trendingGroups,
      newGroups,
      popularGroups,
      ...userActions,
      ...groupActions,
      ...chatActions,
      ...searchActions
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
