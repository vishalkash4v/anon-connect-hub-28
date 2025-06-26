
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Search, MessageSquare } from 'lucide-react';

interface UserSearchProps {
  onBack: () => void;
  onStartChat: (chatId: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onBack, onStartChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchUsers, startDirectChat } = useUser();

  const searchResults = searchUsers(searchQuery);

  const handleStartChat = (userId: string) => {
    const chatId = startDirectChat(userId);
    onStartChat(chatId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Find Users</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!searchQuery.trim() ? (
              <p className="text-gray-500 text-center py-8">
                Enter a name, email, or phone number to search for users
              </p>
            ) : searchResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No users found matching "{searchQuery}"
              </p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {user.name || 'Anonymous User'}
                        </h4>
                        <div className="text-sm text-gray-500 space-y-1">
                          {user.email && <p>📧 {user.email}</p>}
                          {user.phone && <p>📱 {user.phone}</p>}
                          <p>
                            {user.isAnonymous ? '👤 Anonymous' : '✅ Profile User'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(user.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserSearch;
