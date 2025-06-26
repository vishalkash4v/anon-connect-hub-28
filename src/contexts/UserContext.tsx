
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  isAnonymous: boolean;
  avatar?: string;
  bio?: string;
  lastSeen: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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
  updatedAt: Date;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  chats: Chat[];
  loading: boolean;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: User) => void;
  createGroup: (groupData: { name: string; description?: string }) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  startDirectChat: (userId: string) => string;
  startRandomChat: () => string | null;
  sendMessage: (chatId: string, content: string) => void;
  searchUsers: (query: string) => Promise<User[]>;
  searchGroups: (query: string) => Promise<Group[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

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

  const createUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      let apiResponse;
      
      if (userData.name || userData.phone || userData.email) {
        // Create profile user
        apiResponse = await apiService.createProfile({
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || ''
        });
      } else {
        // Join as anonymous
        apiResponse = await apiService.joinAnonymous({
          name: userData.name,
          phone: userData.phone,
          email: userData.email
        });
      }

      const newUser: User = {
        id: apiResponse.userId || Date.now().toString(),
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        bio: userData.bio,
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

      toast({
        title: "Success",
        description: newUser.isAnonymous ? "Joined anonymously!" : "Profile created successfully!"
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to local creation
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        bio: userData.bio,
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
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setCurrentUser(userData);
    setUsers(prev => {
      const updated = prev.map(user => user.id === userData.id ? userData : user);
      localStorage.setItem('users', JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const createGroup = async (groupData: { name: string; description?: string }) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const apiResponse = await apiService.createGroup({
        group_name: groupData.name
      });

      const newGroup: Group = {
        id: apiResponse.groupId || Date.now().toString(),
        name: groupData.name,
        description: groupData.description,
        members: [currentUser.id],
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setGroups(prev => {
        const updated = [...prev, newGroup];
        localStorage.setItem('groups', JSON.stringify(updated));
        return updated;
      });

      toast({
        title: "Success",
        description: "Group created successfully!"
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to local creation
      const newGroup: Group = {
        id: Date.now().toString(),
        name: groupData.name,
        description: groupData.description,
        members: [currentUser.id],
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setGroups(prev => {
        const updated = [...prev, newGroup];
        localStorage.setItem('groups', JSON.stringify(updated));
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await apiService.joinGroup({
        groupId,
        userId: currentUser.id
      });

      setGroups(prev => {
        const updated = prev.map(group => 
          group.id === groupId && !group.members.includes(currentUser.id)
            ? { ...group, members: [...group.members, currentUser.id], updatedAt: new Date() }
            : group
        );
        localStorage.setItem('groups', JSON.stringify(updated));
        return updated;
      });

      toast({
        title: "Success",
        description: "Joined group successfully!"
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to local join
      setGroups(prev => {
        const updated = prev.map(group => 
          group.id === groupId && !group.members.includes(currentUser.id)
            ? { ...group, members: [...group.members, currentUser.id], updatedAt: new Date() }
            : group
        );
        localStorage.setItem('groups', JSON.stringify(updated));
        return updated;
      });
    } finally {
      setLoading(false);
    }
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
      unreadCount: 0,
      updatedAt: new Date()
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
              lastMessage: newMessage,
              updatedAt: new Date()
            }
          : chat
      );
      localStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    try {
      const apiResponse = await apiService.search({
        userId: currentUser?.id,
        query
      });

      // If API returns users, use them, otherwise fallback to local search
      if (apiResponse.users) {
        return apiResponse.users.filter((user: any) => user.id !== currentUser?.id);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }

    // Fallback to local search
    return users.filter(user => 
      user.id !== currentUser?.id &&
      (user.name?.toLowerCase().includes(query.toLowerCase()) ||
       user.email?.toLowerCase().includes(query.toLowerCase()) ||
       user.phone?.includes(query))
    );
  };

  const searchGroups = async (query: string): Promise<Group[]> => {
    if (!query.trim()) return [];

    try {
      const apiResponse = await apiService.search({
        groupId: currentUser?.id,
        query
      });

      // If API returns groups, use them, otherwise fallback to local search
      if (apiResponse.groups) {
        return apiResponse.groups;
      }
    } catch (error) {
      console.error('Error searching groups:', error);
    }

    // Fallback to local search
    return groups.filter(group => 
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      groups,
      chats,
      loading,
      createUser,
      updateUser,
      createGroup,
      joinGroup,
      startDirectChat,
      startRandomChat,
      sendMessage,
      searchUsers,
      searchGroups
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
