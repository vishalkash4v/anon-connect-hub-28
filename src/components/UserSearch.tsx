
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Search, MessageSquare, Users } from 'lucide-react';

interface UserSearchProps {
  onBack: () => void;
  onStartChat: (chatId: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onBack, onStartChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [groupResults, setGroupResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchUsers, searchGroups, startDirectChat, joinGroup } = useUser();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setUserResults([]);
      setGroupResults([]);
      return;
    }

    setLoading(true);
    try {
      const [users, groups] = await Promise.all([
        searchUsers(query),
        searchGroups(query)
      ]);
      setUserResults(users);
      setGroupResults(groups);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (userId: string) => {
    const chatId = startDirectChat(userId);
    onStartChat(chatId);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      // After joining, you could start a group chat here
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Search</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search users or groups..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : !searchQuery.trim() ? (
                  <p className="text-gray-500 text-center py-8">
                    Enter a name, email, or phone number to search for users
                  </p>
                ) : userResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No users found matching "{searchQuery}"
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userResults.map((user) => (
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
          </TabsContent>
          
          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : !searchQuery.trim() ? (
                  <p className="text-gray-500 text-center py-8">
                    Enter a group name to search for groups
                  </p>
                ) : groupResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No groups found matching "{searchQuery}"
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupResults.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {group.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <div className="text-sm text-gray-500">
                              <p>👥 {group.members?.length || 0} members</p>
                              {group.description && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {group.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserSearch;
