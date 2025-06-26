
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  isAnonymous: boolean;
  avatar?: string;
  lastSeen: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  groupId?: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  chats: Chat[];
  createUser: (userData: Partial<User>) => void;
  createGroup: (groupData: { name: string; description?: string }) => void;
  joinGroup: (groupId: string) => void;
  startDirectChat: (userId: string) => string;
  startRandomChat: () => string | null;
  sendMessage: (chatId: string, content: string) => void;
  searchUsers: (query: string) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('users');
    const savedGroups = localStorage.getItem('groups');
    const savedChats = localStorage.getItem('chats');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  const createUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      isAnonymous: !userData.name && !userData.phone && !userData.email,
      lastSeen: new Date(),
      avatar: userData.avatar
    };

    setCurrentUser(newUser);
    setUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem('users', JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const createGroup = (groupData: { name: string; description?: string }) => {
    if (!currentUser) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupData.name,
      description: groupData.description,
      members: [currentUser.id],
      createdBy: currentUser.id,
      createdAt: new Date()
    };

    setGroups(prev => {
      const updated = [...prev, newGroup];
      localStorage.setItem('groups', JSON.stringify(updated));
      return updated;
    });
  };

  const joinGroup = (groupId: string) => {
    if (!currentUser) return;

    setGroups(prev => {
      const updated = prev.map(group => 
        group.id === groupId && !group.members.includes(currentUser.id)
          ? { ...group, members: [...group.members, currentUser.id] }
          : group
      );
      localStorage.setItem('groups', JSON.stringify(updated));
      return updated;
    });
  };

  const startDirectChat = (userId: string): string => {
    if (!currentUser) return '';

    const existingChat = chats.find(chat => 
      chat.type === 'direct' && 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(userId)
    );

    if (existingChat) {
      return existingChat.id;
    }

    const newChat: Chat = {
      id: Date.now().toString(),
      type: 'direct',
      participants: [currentUser.id, userId],
      messages: [],
      unreadCount: 0
    };

    setChats(prev => {
      const updated = [...prev, newChat];
      localStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });

    return newChat.id;
  };

  const startRandomChat = (): string | null => {
    if (!currentUser) return null;

    const availableUsers = users.filter(user => 
      user.id !== currentUser.id && 
      !chats.some(chat => chat.participants.includes(user.id))
    );

    if (availableUsers.length === 0) return null;

    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    return startDirectChat(randomUser.id);
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId
          ? { 
              ...chat, 
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage
            }
          : chat
      );
      localStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });
  };

  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return [];

    return users.filter(user => 
      user.id !== currentUser?.id &&
      (user.name?.toLowerCase().includes(query.toLowerCase()) ||
       user.email?.toLowerCase().includes(query.toLowerCase()) ||
       user.phone?.includes(query))
    );
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      groups,
      chats,
      createUser,
      createGroup,
      joinGroup,
      startDirectChat,
      startRandomChat,
      sendMessage,
      searchUsers
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
