
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search, Plus, User, MessageSquare } from 'lucide-react';

interface BottomNavigationProps {
  activeView: string;
  onViewChange: (view: 'home' | 'search' | 'profile' | 'chats') => void;
  onShowSearch: () => void;
  onShowProfile: () => void;
  onShowChats: () => void;
  onShowCreateGroup: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeView,
  onViewChange,
  onShowSearch,
  onShowProfile,
  onShowChats,
  onShowCreateGroup
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-lg z-50 safe-area-pb">
      <div className="flex justify-around py-2 px-2 max-w-md mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-col space-y-1 h-auto py-3 px-3 rounded-xl transition-all duration-300 transform ${
            activeView === 'home' 
              ? 'bg-blue-100 text-blue-600 scale-105 shadow-md' 
              : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
          }`}
          onClick={() => onViewChange('home')}
        >
          <Home className={`w-5 h-5 transition-all duration-300 ${
            activeView === 'home' ? 'scale-110' : ''
          }`} />
          <span className="text-xs font-medium">Home</span>
          {activeView === 'home' && (
            <div className="w-4 h-0.5 bg-blue-600 rounded-full animate-fade-in"></div>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-col space-y-1 h-auto py-3 px-3 rounded-xl transition-all duration-300 transform ${
            activeView === 'search' 
              ? 'bg-green-100 text-green-600 scale-105 shadow-md' 
              : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
          }`}
          onClick={() => {
            onViewChange('search');
            onShowSearch();
          }}
        >
          <Search className={`w-5 h-5 transition-all duration-300 ${
            activeView === 'search' ? 'scale-110' : ''
          }`} />
          <span className="text-xs font-medium">Search</span>
          {activeView === 'search' && (
            <div className="w-4 h-0.5 bg-green-600 rounded-full animate-fade-in"></div>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-col space-y-1 h-auto py-3 px-3 rounded-xl transition-all duration-300 transform text-gray-600 hover:bg-gray-100 hover:scale-105"
          onClick={onShowCreateGroup}
        >
          <div className="relative">
            <Plus className="w-5 h-5 transition-all duration-300 hover:rotate-90" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs font-medium">New</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-col space-y-1 h-auto py-3 px-3 rounded-xl transition-all duration-300 transform ${
            activeView === 'chats' 
              ? 'bg-pink-100 text-pink-600 scale-105 shadow-md' 
              : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
          }`}
          onClick={() => {
            onViewChange('chats');
            onShowChats();
          }}
        >
          <MessageSquare className={`w-5 h-5 transition-all duration-300 ${
            activeView === 'chats' ? 'scale-110' : ''
          }`} />
          <span className="text-xs font-medium">Chats</span>
          {activeView === 'chats' && (
            <div className="w-4 h-0.5 bg-pink-600 rounded-full animate-fade-in"></div>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-col space-y-1 h-auto py-3 px-3 rounded-xl transition-all duration-300 transform ${
            activeView === 'profile' 
              ? 'bg-purple-100 text-purple-600 scale-105 shadow-md' 
              : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
          }`}
          onClick={() => {
            onViewChange('profile');
            onShowProfile();
          }}
        >
          <User className={`w-5 h-5 transition-all duration-300 ${
            activeView === 'profile' ? 'scale-110' : ''
          }`} />
          <span className="text-xs font-medium">Profile</span>
          {activeView === 'profile' && (
            <div className="w-4 h-0.5 bg-purple-600 rounded-full animate-fade-in"></div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;
