
import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types/user';
import { saveToStorage } from '@/utils/localStorage';

export const useUserActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  users: User[],
  setUsers: (users: User[]) => void
) => {
  const [loading, setLoading] = useState(false);

  const createUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      let apiResponse;
      
      if (userData.name || userData.phone || userData.email) {
        apiResponse = await apiService.createProfile({
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || ''
        });
      } else {
        apiResponse = await apiService.joinAnonymous({
          name: userData.name,
          phone: userData.phone,
          email: userData.email
        });
      }

      const newUser: User = {
        id: apiResponse.data._id,
        name: apiResponse.data.name,
        phone: apiResponse.data.phone,
        email: apiResponse.data.email,
        username: apiResponse.data.username,
        bio: userData.bio,
        isAnonymous: apiResponse.data.isAnonymous,
        lastSeen: new Date(),
        avatar: userData.avatar
      };

      setCurrentUser(newUser);
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveToStorage.currentUser(newUser);
      saveToStorage.users(updatedUsers);

      toast({
        title: "Success",
        description: newUser.isAnonymous ? "Joined anonymously!" : "Profile created successfully!"
      });
    } catch (error) {
      console.error('Error creating user:', error);
      const fallbackUser: User = {
        id: `local_${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        bio: userData.bio,
        isAnonymous: !userData.name && !userData.phone && !userData.email,
        lastSeen: new Date(),
        avatar: userData.avatar
      };

      setCurrentUser(fallbackUser);
      const updatedUsers = [...users, fallbackUser];
      setUsers(updatedUsers);
      saveToStorage.currentUser(fallbackUser);
      saveToStorage.users(updatedUsers);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await apiService.updateProfile({
        userId: currentUser.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email
      });

      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      const updatedUsers = users.map(user => user.id === updatedUser.id ? updatedUser : user);
      setUsers(updatedUsers);
      saveToStorage.currentUser(updatedUser);
      saveToStorage.users(updatedUsers);

      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error('Error updating user:', error);
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      const updatedUsers = users.map(user => user.id === updatedUser.id ? updatedUser : user);
      setUsers(updatedUsers);
      saveToStorage.currentUser(updatedUser);
      saveToStorage.users(updatedUsers);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string): Promise<User | null> => {
    try {
      const response = await apiService.getProfile({ userId });
      if (response.user) {
        return {
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
          email: response.user.email,
          username: response.user.username,
          isAnonymous: response.user.isAnonymous,
          lastSeen: new Date(response.user.createdAt || Date.now())
        };
      }
    } catch (error) {
      console.error('Error getting profile:', error);
    }
    
    return users.find(user => user.id === userId) || null;
  };

  return {
    loading,
    createUser,
    updateUser,
    getProfile
  };
};
