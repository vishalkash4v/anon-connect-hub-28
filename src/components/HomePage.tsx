import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Search, Plus, User, MessageSquare, Users, Shuffle } from 'lucide-react';
import GroupJoinModal from './GroupJoinModal';
import CreateGroupModal from './CreateGroupModal';
import RandomChatSpinner from './RandomChatSpinner';

interface HomePageProps {
  onStartChat: (chatId: string) => void;
  onShowSearch: () => void;
  onShowProfile: () => void;
  onShowChats: () => void;
  activeView: string;
  onViewChange: (view: 'home' | 'search' | 'profile' | 'chats') => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onStartChat, 
  onShowSearch, 
  onShowProfile, 
  onShowChats,
  activeView,
  onViewChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showRandomChat, setShowRandomChat] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const [searchLoading, setSearchLoading] = useState(false);
  
  const { currentUser, groups, users, startRandomChat, searchUsers } = useUser();

  // Handle search with proper async handling
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchUsers]);

  const handleRandomChat = () => {
    setShowRandomChat(true);
    setTimeout(() => {
      const chatId = startRandomChat();
      setShowRandomChat(false);
      if (chatId) {
        onStartChat(chatId);
      } else {
        alert('No users available for random chat!');
      }
    }, 2000);
  };

  const handleJoinGroup = (group: any) => {
    setSelectedGroup(group);
    setShowJoinGroup(true);
  };

  const trendingGroups = groups.slice(0, 6);
  const onlineUsers = users.filter(user => user.id !== currentUser?.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AnonConnect
            </h1>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onShowProfile}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
          
          {/* Search Section */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 bg-white/90 border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                placeholder="Search groups, users, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setShowCreateGroup(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            <Button 
              onClick={handleRandomChat}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 transform hover:scale-105 transition-all duration-200"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8 animate-fade-in">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No results found for "{searchQuery}"</p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'Anonymous User'}</p>
                            <p className="text-sm text-gray-500">{user.isAnonymous ? 'Anonymous' : 'Profile User'}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => onShowSearch()}>
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
        )}

        {/* Trending Groups Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mr-4">🔥 Trending Groups</h2>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="trending" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Trending
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                New
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Popular
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="trending" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingGroups.map((group, index) => (
                  <Card 
                    key={group.id} 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {group.members.length} members
                            </Badge>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-500">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {group.description || 'Join this amazing group to connect with like-minded people!'}
                      </p>
                      <Button 
                        onClick={() => handleJoinGroup(group)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
                      >
                        Join Group
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.slice(-6).reverse().map((group, index) => (
                  <Card 
                    key={group.id} 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            {group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                            New
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {group.description || 'A new group ready for exciting conversations!'}
                      </p>
                      <Button 
                        onClick={() => handleJoinGroup(group)}
                        variant="outline"
                        className="w-full border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Join Group
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.sort((a, b) => b.members.length - a.members.length).slice(0, 6).map((group, index) => (
                  <Card 
                    key={group.id} 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-600">
                            {group.members.length} members
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {group.description || 'One of the most popular groups on the platform!'}
                      </p>
                      <Button 
                        onClick={() => handleJoinGroup(group)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Join Group
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Popular One-to-One Chats */}
        {onlineUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Available for Chat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {onlineUsers.map((user, index) => (
                <Card 
                  key={user.id} 
                  className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{user.name || 'Anonymous User'}</h3>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 font-medium">Online</span>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => onShowSearch()}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Options Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💬 Chat Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-2">Create Group</h3>
                <p className="text-blue-100 text-sm mb-4">Start your own community</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => setShowCreateGroup(true)}
                >
                  Create Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-2">Direct Chat</h3>
                <p className="text-green-100 text-sm mb-4">Find and chat with users</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={onShowSearch}
                >
                  Find Users
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shuffle className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-2">Random Chat</h3>
                <p className="text-orange-100 text-sm mb-4">Meet someone new</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={handleRandomChat}
                >
                  Start Random
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <User className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-2">Profile</h3>
                <p className="text-purple-100 text-sm mb-4">Manage your account</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={onShowProfile}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal 
        open={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
      />
      
      {selectedGroup && (
        <GroupJoinModal 
          open={showJoinGroup} 
          onClose={() => setShowJoinGroup(false)} 
          group={selectedGroup}
          onJoin={onStartChat}
        />
      )}
      
      <RandomChatSpinner 
        open={showRandomChat} 
        onClose={() => setShowRandomChat(false)} 
      />
    </div>
  );
};

export default HomePage;
