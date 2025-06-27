
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

export interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  chats: Chat[];
  loading: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, string>;
  trendingGroups: Group[];
  newGroups: Group[];
  popularGroups: Group[];
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
  loadGroupsOverview: () => Promise<void>;
}
