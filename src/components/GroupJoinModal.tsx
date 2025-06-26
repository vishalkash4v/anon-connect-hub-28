
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Users, Clock, User } from 'lucide-react';

interface GroupJoinModalProps {
  open: boolean;
  onClose: () => void;
  group: any;
  onJoin: (chatId: string) => void;
}

const GroupJoinModal: React.FC<GroupJoinModalProps> = ({ open, onClose, group, onJoin }) => {
  const { currentUser, joinGroup, startDirectChat } = useUser();

  const handleJoinAnonymously = () => {
    joinGroup(group.id);
    const chatId = startDirectChat(group.id);
    onJoin(chatId);
    onClose();
  };

  const handleJoinWithProfile = () => {
    joinGroup(group.id);
    const chatId = startDirectChat(group.id);
    onJoin(chatId);
    onClose();
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Group Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{group.name}</h3>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="secondary" className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {group.members.length} members
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Group Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              {group.description || 'Join this group to connect with amazing people and have great conversations!'}
            </p>
          </div>

          {/* Online Members Preview */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online Members
            </h4>
            <div className="flex -space-x-2">
              {group.members.slice(0, 5).map((memberId: string, index: number) => (
                <Avatar key={memberId} className="w-8 h-8 border-2 border-white">
                  <AvatarFallback className="text-xs">
                    {`M${index + 1}`}
                  </AvatarFallback>
                </Avatar>
              ))}
              {group.members.length > 5 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{group.members.length - 5}</span>
                </div>
              )}
            </div>
          </div>

          {/* Join Options */}
          <div className="space-y-3">
            <Button 
              onClick={handleJoinWithProfile}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12"
            >
              <User className="w-4 h-4 mr-2" />
              Join with Profile
            </Button>
            
            <Button 
              onClick={handleJoinAnonymously}
              variant="outline"
              className="w-full h-12"
            >
              Join Anonymously
            </Button>
          </div>

          {/* Group Rules */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-800 mb-1">Group Guidelines:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Be respectful to all members</li>
              <li>• Keep conversations appropriate</li>
              <li>• No spam or promotional content</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupJoinModal;
