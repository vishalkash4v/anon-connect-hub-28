import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  username?: string;
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
  type: 'direct' | 'group' | 'random';
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
  onlineUsers: string[];
  typingUsers: Map<string, string>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  getProfile: (userId: string) => Promise<User | null>;
  createGroup: (groupData: { name: string; description?: string }) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  startDirectChat: (userId: string) => string;
  startRandomChat: () => Promise<string | null>;
  openGroupChat: (groupId: string, lastMessageId?: string, limit?: number) => Promise<Message[]>;
  openOneToOneChat: (otherUserId: string, lastMessageId?: string, limit?: number) => Promise<Message[]>;
  sendMessage: (chatId: string, content: string) => void;
  sendTyping: (chatId: string, otherUserId: string) => void;
  sendStopTyping: (chatId: string, otherUserId: string) => void;
  searchUsers: (query: string) => Promise<User[]>;
  searchGroups: (query: string) => Promise<Group[]>;
  globalSearch: (query: string) => Promise<any[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

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

  useEffect(() => {
    if (currentUser) {
      // Initialize socket connection
      socketService.connect();
      setTimeout(() => {
        socketService.join(currentUser.id);
      }, 1000);

      // Set up socket event listeners
      socketService.onMessage((message) => {
        const newMessage: Message = {
          id: message.id,
          senderId: message.fromUserId,
          content: message.message,
          timestamp: new Date(message.timestamp),
          type: 'text'
        };

        setChats(prev => {
          const chatId = message.type === 'private' 
            ? prev.find(c => 
                c.type === 'direct' && 
                c.participants.includes(currentUser.id) && 
                c.participants.includes(message.fromUserId)
              )?.id
            : message.groupId;

          if (!chatId) return prev;

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
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      socketService.onUserOffline((userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      socketService.onTyping((fromUserId) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(fromUserId, 'typing');
          return newMap;
        });
      });

      socketService.onStopTyping((fromUserId) => {
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
        username: apiResponse.username,
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

  const updateUser = async (userData: Partial<User>) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await apiService.updateProfile({
        userId: currentUser.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email
      });

      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      setUsers(prev => {
        const updated = prev.map(user => user.id === updatedUser.id ? updatedUser : user);
        localStorage.setItem('users', JSON.stringify(updated));
        return updated;
      });
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to local update
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      setUsers(prev => {
        const updated = prev.map(user => user.id === updatedUser.id ? updatedUser : user);
        localStorage.setItem('users', JSON.stringify(updated));
        return updated;
      });
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string): Promise<User | null> => {
    try {
      const response = await apiService.getProfile({ userId });
      if (response.user) {
        return {
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
          email: response.user.email,
          username: response.user.username,
          isAnonymous: response.user.isAnonymous,
          lastSeen: new Date(response.user.createdAt || Date.now())
        };
      }
    } catch (error) {
      console.error('Error getting profile:', error);
    }
    
    // Fallback to local search
    return users.find(user => user.id === userId) || null;
  };

  const createGroup = async (groupData: { name: string; description?: string }) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const apiResponse = await apiService.createGroup({
        group_name: groupData.name,
        description: groupData.description,
        createdBy: currentUser.id
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

  const startRandomChat = async (): Promise<string | null> => {
    if (!currentUser) return null;

    try {
      const response = await apiService.openRandomChat({ userId: currentUser.id });
      
      if (response.chatId) {
        const newChat: Chat = {
          id: response.chatId,
          type: 'random',
          participants: [currentUser.id, response.otherUserId],
          messages: [],
          unreadCount: 0,
          updatedAt: new Date()
        };

        setChats(prev => {
          const updated = [...prev, newChat];
          localStorage.setItem('chats', JSON.stringify(updated));
          return updated;
        });

        return response.chatId;
      }
    } catch (error) {
      console.error('Error starting random chat:', error);
    }

    // Fallback to local random matching
    const availableUsers = users.filter(user => 
      user.id !== currentUser.id && 
      !chats.some(chat => chat.participants.includes(user.id))
    );

    if (availableUsers.length === 0) return null;

    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    return startDirectChat(randomUser.id);
  };

  const openGroupChat = async (groupId: string, lastMessageId?: string, limit?: number): Promise<Message[]> => {
    try {
      const response = await apiService.openGroupChat({
        groupId,
        lastMessageId,
        limit: limit || 20
      });

      if (response.messages) {
        return response.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text'
        }));
      }
    } catch (error) {
      console.error('Error opening group chat:', error);
    }

    // Fallback to local messages
    const chat = chats.find(c => c.groupId === groupId);
    return chat?.messages || [];
  };

  const openOneToOneChat = async (otherUserId: string, lastMessageId?: string, limit?: number): Promise<Message[]> => {
    if (!currentUser) return [];

    try {
      const response = await apiService.openOneToOneChat({
        userId: currentUser.id,
        otherUserId,
        lastMessageId,
        limit: limit || 20
      });

      if (response.messages) {
        return response.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text'
        }));
      }
    } catch (error) {
      console.error('Error opening one-to-one chat:', error);
    }

    // Fallback to local messages
    const chat = chats.find(c => 
      c.type === 'direct' && 
      c.participants.includes(currentUser.id) && 
      c.participants.includes(otherUserId)
    );
    return chat?.messages || [];
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      type: 'text'
    };

    // Send via socket
    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find(id => id !== currentUser.id);
      if (otherUserId) {
        socketService.sendMessage({
          fromUserId: currentUser.id,
          toUserId: otherUserId,
          message: content,
          type: 'private'
        });
      }
    } else if (chat.type === 'group' && chat.groupId) {
      socketService.sendMessage({
        fromUserId: currentUser.id,
        groupId: chat.groupId,
        message: content,
        type: 'group'
      });
    }

    // Update local state
    setChats(prev => {
      const updated = prev.map(c => 
        c.id === chatId
          ? { 
              ...c, 
              messages: [...c.messages, newMessage],
              lastMessage: newMessage,
              updatedAt: new Date()
            }
          : c
      );
      localStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });
  };

  const sendTyping = (chatId: string, otherUserId: string) => {
    if (!currentUser) return;
    
    socketService.sendTyping({
      fromUserId: currentUser.id,
      toUserId: otherUserId
    });
  };

  const sendStopTyping = (chatId: string, otherUserId: string) => {
    if (!currentUser) return;
    
    socketService.sendStopTyping({
      fromUserId: currentUser.id,
      toUserId: otherUserId
    });
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    try {
      const apiResponse = await apiService.search({ query });

      if (apiResponse.data) {
        const users = apiResponse.data
          .filter((item: any) => item.type === 'user')
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            username: user.username,
            isAnonymous: user.isAnonymous,
            lastSeen: new Date(user.createdAt || Date.now())
          }))
          .filter((user: User) => user.id !== currentUser?.id);
        
        return users;
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }

    // Fallback to local search
    return users.filter(user => 
      user.id !== currentUser?.id &&
      (user.name?.toLowerCase().includes(query.toLowerCase()) ||
       user.email?.toLowerCase().includes(query.toLowerCase()) ||
       user.phone?.includes(query) ||
       user.username?.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const searchGroups = async (query: string): Promise<Group[]> => {
    if (!query.trim()) return [];

    try {
      const apiResponse = await apiService.search({ query });

      if (apiResponse.data) {
        const groups = apiResponse.data
          .filter((item: any) => item.type === 'group')
          .map((group: any) => ({
            id: group.id,
            name: group.group_name,
            description: group.description,
            members: [],
            createdBy: '',
            createdAt: new Date(group.createdAt),
            updatedAt: new Date(group.createdAt)
          }));
        
        return groups;
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

  const globalSearch = async (query: string): Promise<any[]> => {
    if (!query.trim()) return [];

    try {
      const apiResponse = await apiService.search({ query });
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error in global search:', error);
      return [];
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      groups,
      chats,
      loading,
      onlineUsers,
      typingUsers,
      createUser,
      updateUser,
      getProfile,
      createGroup,
      joinGroup,
      startDirectChat,
      startRandomChat,
      openGroupChat,
      openOneToOneChat,
      sendMessage,
      sendTyping,
      sendStopTyping,
      searchUsers,
      searchGroups,
      globalSearch
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
