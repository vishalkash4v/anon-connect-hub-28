
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shuffle, Users, MessageSquare, X } from 'lucide-react';

interface RandomChatSpinnerProps {
  open: boolean;
  onClose: () => void;
}

const RandomChatSpinner: React.FC<RandomChatSpinnerProps> = ({ open, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [dots, setDots] = useState('');

  const messages = [
    "🔍 Searching for available users...",
    "🌟 Finding your perfect chat match...",
    "🎯 Almost there...",
    "💫 Connecting you now..."
  ];

  useEffect(() => {
    if (!open) return;

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 800);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="text-center space-y-6 py-4">
          {/* Animated Icon */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
              <Shuffle className="w-10 h-10 text-white animate-spin" />
            </div>
            
            {/* Orbiting Icons */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <Users className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 text-blue-500" />
              <MessageSquare className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 text-green-500" />
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-6 h-6 bg-purple-500 rounded-full"></div>
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-6 bg-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Finding Your Match</h3>
            <p className="text-gray-600 min-h-[1.5rem]">
              {messages[currentMessage]}{dots}
            </p>
          </div>

          {/* Progress Animation */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full animate-pulse" style={{
              width: '100%',
              animation: 'pulse 1.5s ease-in-out infinite alternate'
            }}></div>
          </div>

          {/* Fun Facts */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-800 font-medium mb-1">💡 Did you know?</p>
            <p className="text-sm text-orange-700">
              Random chats are a great way to meet people from different backgrounds and cultures!
            </p>
          </div>

          {/* Cancel Button */}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RandomChatSpinner;
