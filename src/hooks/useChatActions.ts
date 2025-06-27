
import { apiService } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import { User, Chat, Message } from '@/types/user';
import { saveToStorage } from '@/utils/localStorage';

export const useChatActions = (
  currentUser: User | null,
  chats: Chat[],
  setChats: (chats: Chat[]) => void,
  users: User[]
) => {
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
      id: `chat_${currentUser.id}_${userId}`,
      type: 'direct',
      participants: [currentUser.id, userId],
      messages: [],
      unreadCount: 0,
      updatedAt: new Date()
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    saveToStorage.chats(updatedChats);

    return newChat.id;
  };

  const startRandomChat = async (): Promise<string | null> => {
    if (!currentUser) return null;

    try {
      console.log('🎲 Starting random chat...');
      const response = await apiService.openRandomChat({ userId: currentUser.id });
      
      console.log('🎲 Random chat response:', response);
      
      if (response.status && response.data && response.data.matchedUser) {
        const matchedUser = response.data.matchedUser;
        
        // Create or find existing direct chat with matched user
        const chatId = startDirectChat(matchedUser._id);
        
        console.log('🎲 Random chat started with user:', matchedUser.name, 'chatId:', chatId);
        
        return chatId;
      }
    } catch (error) {
      console.error('❌ Error starting random chat:', error);
    }

    // Fallback to local random selection
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
      console.log('👥 Opening group chat:', groupId);
      const response = await apiService.openGroupChat({
        groupId,
        lastMessageId,
        limit: limit || 20
      });

      if (response.messages) {
        const messages = response.messages.map((msg: any) => ({
          id: msg._id || msg.id,
          senderId: msg.from || msg.senderId,
          content: msg.message || msg.content,
          timestamp: new Date(msg.createdAt || msg.timestamp),
          type: msg.type || 'text'
        }));

        // Subscribe to group messages for real-time updates
        socketService.subscribeToGroupMessages(groupId, (socketMessage) => {
          const newMessage: Message = {
            id: socketMessage._id,
            senderId: socketMessage.from,
            content: socketMessage.message,
            timestamp: new Date(socketMessage.createdAt),
            type: 'text'
          };

          setChats(prev => {
            const updated = prev.map(chat => 
              chat.groupId === groupId
                ? { 
                    ...chat, 
                    messages: [...chat.messages, newMessage],
                    lastMessage: newMessage,
                    updatedAt: new Date()
                  }
                : chat
            );
            saveToStorage.chats(updated);
            return updated;
          });
        });

        return messages;
      }
    } catch (error) {
      console.error('❌ Error opening group chat:', error);
    }

    const chat = chats.find(c => c.groupId === groupId);
    return chat?.messages || [];
  };

  const openOneToOneChat = async (otherUserId: string, lastMessageId?: string, limit?: number): Promise<Message[]> => {
    if (!currentUser) return [];

    try {
      console.log('💬 Opening one-to-one chat with:', otherUserId);
      const response = await apiService.openOneToOneChat({
        userId: currentUser.id,
        otherUserId,
        lastMessageId,
        limit: limit || 20
      });

      if (response.messages) {
        return response.messages.map((msg: any) => ({
          id: msg._id || msg.id,
          senderId: msg.from || msg.senderId,
          content: msg.message || msg.content,
          timestamp: new Date(msg.createdAt || msg.timestamp),
          type: msg.type || 'text'
        }));
      }
    } catch (error) {
      console.error('❌ Error opening one-to-one chat:', error);
    }

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
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    const updatedChats = chats.map(c => 
      c.id === chatId
        ? { 
            ...c, 
            messages: [...c.messages, newMessage],
            lastMessage: newMessage,
            updatedAt: new Date()
          }
        : c
    );
    setChats(updatedChats);
    saveToStorage.chats(updatedChats);
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

  return {
    startDirectChat,
    startRandomChat,
    openGroupChat,
    openOneToOneChat,
    sendMessage,
    sendTyping,
    sendStopTyping
  };
};
