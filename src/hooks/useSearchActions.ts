
import { useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { User, Group } from '@/types/user';

export const useSearchActions = (
  currentUser: User | null,
  users: User[],
  groups: Group[]
) => {
  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    console.log('🔍 Searching users for:', query);

    try {
      const apiResponse = await apiService.search({ query });

      if (apiResponse.data) {
        const users = apiResponse.data
          .filter((item: any) => item.type === 'user')
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            username: user.username,
            isAnonymous: user.isAnonymous,
            lastSeen: new Date(user.createdAt || Date.now())
          }))
          .filter((user: User) => user.id !== currentUser?.id);
        
        console.log('✅ Found users from API:', users.length);
        return users;
      }
    } catch (error) {
      console.error('❌ Error searching users via API:', error);
    }

    // Fallback to local search
    const localResults = users.filter(user => 
      user.id !== currentUser?.id &&
      (user.name?.toLowerCase().includes(query.toLowerCase()) ||
       user.email?.toLowerCase().includes(query.toLowerCase()) ||
       user.phone?.includes(query) ||
       user.username?.toLowerCase().includes(query.toLowerCase()))
    );

    console.log('✅ Found users locally:', localResults.length);
    return localResults;
  }, [currentUser, users]);

  const searchGroups = useCallback(async (query: string): Promise<Group[]> => {
    if (!query.trim()) return [];

    console.log('🔍 Searching groups for:', query);

    try {
      const apiResponse = await apiService.search({ query });

      if (apiResponse.data) {
        const groups = apiResponse.data
          .filter((item: any) => item.type === 'group')
          .map((group: any) => ({
            id: group.id,
            name: group.group_name,
            description: group.description,
            members: [],
            createdBy: '',
            createdAt: new Date(group.createdAt),
            updatedAt: new Date(group.createdAt)
          }));
        
        console.log('✅ Found groups from API:', groups.length);
        return groups;
      }
    } catch (error) {
      console.error('❌ Error searching groups via API:', error);
    }

    // Fallback to local search
    const localResults = groups.filter(group => 
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description?.toLowerCase().includes(query.toLowerCase())
    );

    console.log('✅ Found groups locally:', localResults.length);
    return localResults;
  }, [groups]);

  const globalSearch = useCallback(async (query: string): Promise<any[]> => {
    if (!query.trim()) return [];

    console.log('🔍 Global search for:', query);

    try {
      const apiResponse = await apiService.search({ query });
      console.log('✅ Global search results:', apiResponse.data?.length || 0);
      return apiResponse.data || [];
    } catch (error) {
      console.error('❌ Error in global search:', error);
      return [];
    }
  }, []);

  return {
    searchUsers,
    searchGroups,
    globalSearch
  };
};
