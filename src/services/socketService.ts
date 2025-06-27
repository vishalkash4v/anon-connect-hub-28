
import { io, Socket } from 'socket.io-client';

interface SocketMessage {
  id: string;
  fromUserId: string;
  toUserId?: string;
  groupId?: string;
  message: string;
  type: 'private' | 'group';
  timestamp: string;
}

interface TypingData {
  fromUserId: string;
  toUserId: string;
}

class SocketService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: SocketMessage) => void)[] = [];
  private groupMessageCallbacks: Map<string, ((message: SocketMessage) => void)[]> = new Map();
  private userOnlineCallbacks: ((userId: string) => void)[] = [];
  private userOfflineCallbacks: ((userId: string) => void)[] = [];
  private typingCallbacks: ((fromUserId: string) => void)[] = [];
  private stopTypingCallbacks: ((fromUserId: string) => void)[] = [];

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io("https://rcapis.best-smm.in", {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for private messages
    this.socket.on('receive-message', (message: SocketMessage) => {
      console.log('Received message:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // Listen for user online status
    this.socket.on('user-online', (userId: string) => {
      console.log('User online:', userId);
      this.userOnlineCallbacks.forEach(callback => callback(userId));
    });

    // Listen for user offline status
    this.socket.on('user-offline', (userId: string) => {
      console.log('User offline:', userId);
      this.userOfflineCallbacks.forEach(callback => callback(userId));
    });

    // Listen for typing indicators
    this.socket.on('user-typing', (fromUserId: string) => {
      console.log('User typing:', fromUserId);
      this.typingCallbacks.forEach(callback => callback(fromUserId));
    });

    // Listen for stop typing indicators
    this.socket.on('user-stop-typing', (fromUserId: string) => {
      console.log('User stopped typing:', fromUserId);
      this.stopTypingCallbacks.forEach(callback => callback(fromUserId));
    });
  }

  join(userId: string) {
    if (this.socket?.connected) {
      console.log('Joining socket with userId:', userId);
      this.socket.emit('join', userId);
    }
  }

  sendMessage(data: {
    fromUserId: string;
    toUserId?: string;
    groupId?: string;
    message: string;
    type: 'private' | 'group';
  }) {
    if (this.socket?.connected) {
      console.log('Sending message:', data);
      this.socket.emit('send-message', data);
    }
  }

  sendTyping(data: { fromUserId: string; toUserId: string }) {
    if (this.socket?.connected) {
      this.socket.emit('typing', data);
    }
  }

  sendStopTyping(data: { fromUserId: string; toUserId: string }) {
    if (this.socket?.connected) {
      this.socket.emit('stop-typing', data);
    }
  }

  subscribeToGroupMessages(groupId: string, callback: (message: SocketMessage) => void) {
    const eventName = `group-${groupId}-new-message`;
    
    if (this.socket) {
      this.socket.on(eventName, callback);
    }

    // Store callback for cleanup
    if (!this.groupMessageCallbacks.has(groupId)) {
      this.groupMessageCallbacks.set(groupId, []);
    }
    this.groupMessageCallbacks.get(groupId)?.push(callback);
  }

  unsubscribeFromGroupMessages(groupId: string) {
    const eventName = `group-${groupId}-new-message`;
    
    if (this.socket) {
      this.socket.off(eventName);
    }

    this.groupMessageCallbacks.delete(groupId);
  }

  onMessage(callback: (message: SocketMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onUserOnline(callback: (userId: string) => void) {
    this.userOnlineCallbacks.push(callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    this.userOfflineCallbacks.push(callback);
  }

  onTyping(callback: (fromUserId: string) => void) {
    this.typingCallbacks.push(callback);
  }

  onStopTyping(callback: (fromUserId: string) => void) {
    this.stopTypingCallbacks.push(callback);
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear all callbacks
    this.messageCallbacks = [];
    this.groupMessageCallbacks.clear();
    this.userOnlineCallbacks = [];
    this.userOfflineCallbacks = [];
    this.typingCallbacks = [];
    this.stopTypingCallbacks = [];
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
