
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, User, Mail, Phone, Users, MessageSquare, Calendar } from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const { currentUser, groups, chats } = useUser();

  if (!currentUser) return null;

  const userGroups = groups.filter(group => group.members.includes(currentUser.id));
  const userChats = chats.filter(chat => chat.participants.includes(currentUser.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentUser.name || 'Anonymous User'}
                </h2>
                <Badge variant={currentUser.isAnonymous ? "outline" : "default"} className="mb-3">
                  {currentUser.isAnonymous ? 'Anonymous User' : 'Profile User'}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {new Date(currentUser.lastSeen).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Name</span>
                </div>
                <p className="text-gray-900">{currentUser.name || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Email</span>
                </div>
                <p className="text-gray-900">{currentUser.email || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Phone</span>
                </div>
                <p className="text-gray-900">{currentUser.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-1">{userGroups.length}</h3>
              <p className="text-blue-100">Groups Joined</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-1">{userChats.length}</h3>
              <p className="text-green-100">Active Chats</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Active</h3>
              <p className="text-purple-100">Status</p>
            </CardContent>
          </Card>
        </div>

        {/* My Groups */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              My Groups ({userGroups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGroups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't joined any groups yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {group.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm text-gray-500">{group.members.length} members</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Recent Chats ({userChats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userChats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent chats.</p>
            ) : (
              <div className="space-y-3">
                {userChats.slice(0, 5).map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">
                        {chat.type === 'group' ? 'Group Chat' : 'Direct Chat'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-blue-500 text-white">
                        {chat.unreadCount}
                      </Badge>
                    )}
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

export default ProfileView;
