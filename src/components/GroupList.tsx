
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { Users } from 'lucide-react';

interface GroupListProps {
  onJoinGroup: (chatId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ onJoinGroup }) => {
  const { groups, currentUser, joinGroup, startDirectChat } = useUser();

  const handleJoinGroup = (groupId: string) => {
    joinGroup(groupId);
    // Create or get group chat
    const chatId = startDirectChat(groupId); // This would need to be modified for group chats
    onJoinGroup(chatId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Available Groups
        </CardTitle>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No groups available. Create the first one!
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {group.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-sm text-gray-500">
                      {group.members.length} members
                    </p>
                    {group.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={group.members.includes(currentUser?.id || '') ? "outline" : "default"}
                  onClick={() => handleJoinGroup(group.id)}
                >
                  {group.members.includes(currentUser?.id || '') ? "Chat" : "Join"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupList;
