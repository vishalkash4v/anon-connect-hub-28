
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useDebounce } from '@/hooks/useDebounce';
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
  const [hasSearched, setHasSearched] = useState(false);
  
  const { searchUsers, searchGroups, startDirectChat, joinGroup } = useUser();
  
  // Debounce the search query to prevent endless loops
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Use ref to track if we're currently searching to prevent duplicate calls
  const isSearchingRef = useRef(false);
  const lastSearchQueryRef = useRef('');

  const performSearch = useCallback(async (query: string) => {
    // Prevent duplicate searches
    if (isSearchingRef.current || lastSearchQueryRef.current === query) {
      return;
    }

    if (!query.trim()) {
      setUserResults([]);
      setGroupResults([]);
      setHasSearched(false);
      setLoading(false);
      lastSearchQueryRef.current = '';
      return;
    }

    // Set search state
    isSearchingRef.current = true;
    lastSearchQueryRef.current = query;
    setLoading(true);
    setHasSearched(true);
    
    try {
      console.log('🔍 Performing search for:', query);
      const [users, groups] = await Promise.all([
        searchUsers(query),
        searchGroups(query)
      ]);
      
      console.log('✅ Search completed - Users:', users.length, 'Groups:', groups.length);
      setUserResults(users);
      setGroupResults(groups);
    } catch (error) {
      console.error('❌ Search error:', error);
      setUserResults([]);
      setGroupResults([]);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [searchUsers, searchGroups]);

  // Trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
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
      console.error('❌ Error joining group:', error);
    }
  };

  const renderSearchResults = (results: any[], type: 'users' | 'groups') => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Searching...</p>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <p className="text-gray-500 text-center py-8">
          {type === 'users' 
            ? 'Enter a name, email, or phone number to search for users'
            : 'Enter a group name to search for groups'
          }
        </p>
      );
    }

    if (results.length === 0) {
      return (
        <p className="text-gray-500 text-center py-8">
          No {type} found matching "{debouncedSearchQuery}"
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {results.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {(item.name || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">
                  {item.name || 'Anonymous User'}
                </h4>
                <div className="text-sm text-gray-500 space-y-1">
                  {type === 'users' ? (
                    <>
                      {item.email && <p>📧 {item.email}</p>}
                      {item.phone && <p>📱 {item.phone}</p>}
                      <p>
                        {item.isAnonymous ? '👤 Anonymous' : '✅ Profile User'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>👥 {item.members?.length || 0} members</p>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1">
                          {item.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => type === 'users' ? handleStartChat(item.id) : handleJoinGroup(item.id)}
            >
              {type === 'users' ? (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Join
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    );
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
              onChange={handleInputChange}
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
                {renderSearchResults(userResults, 'users')}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSearchResults(groupResults, 'groups')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserSearch;
