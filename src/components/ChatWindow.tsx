
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Send } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chats, users, currentUser, sendMessage, sendTyping, sendStopTyping, onlineUsers, typingUsers } = useUser();

  const chat = chats.find(c => c.id === chatId);
  const otherUserId = chat?.participants.find(id => id !== currentUser?.id);
  const otherUser = users.find(u => u.id === otherUserId);
  const isOtherUserOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;
  const isOtherUserTyping = otherUserId ? typingUsers.has(otherUserId) : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(chatId, message.trim());
      setMessage('');
      
      // Stop typing when message is sent
      if (otherUserId) {
        sendStopTyping(chatId, otherUserId);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    if (otherUserId && e.target.value.trim()) {
      sendTyping(chatId, otherUserId);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      const newTimeout = setTimeout(() => {
        sendStopTyping(chatId, otherUserId);
      }, 2000);
      
      setTypingTimeout(newTimeout);
    } else if (otherUserId && !e.target.value.trim()) {
      sendStopTyping(chatId, otherUserId);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chat not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Avatar>
              <AvatarFallback>
                {otherUser?.name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            {isOtherUserOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">
              {otherUser?.name || 'Anonymous User'}
            </h2>
            <p className="text-sm text-gray-500">
              {isOtherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chat.messages.map((msg) => {
            const isOwn = msg.senderId === currentUser?.id;
            const sender = users.find(u => u.id === msg.senderId);
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md`}>
                  {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 px-3">
                      {sender?.name || 'Anonymous'}
                    </p>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <p className="text-xs text-gray-500 mb-1 px-3">
                {otherUser?.name || 'Anonymous'}
              </p>
              <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
                <p className="text-gray-500 italic">typing...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
