
import { apiService } from '@/services/apiService';
import { User, Group } from '@/types/user';

export const useSearchActions = (
  currentUser: User | null,
  users: User[],
  groups: Group[]
) => {
  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

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
        
        return users;
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }

    return users.filter(user => 
      user.id !== currentUser?.id &&
      (user.name?.toLowerCase().includes(query.toLowerCase()) ||
       user.email?.toLowerCase().includes(query.toLowerCase()) ||
       user.phone?.includes(query) ||
       user.username?.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const searchGroups = async (query: string): Promise<Group[]> => {
    if (!query.trim()) return [];

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
        
        return groups;
      }
    } catch (error) {
      console.error('Error searching groups:', error);
    }

    return groups.filter(group => 
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const globalSearch = async (query: string): Promise<any[]> => {
    if (!query.trim()) return [];

    try {
      const apiResponse = await apiService.search({ query });
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error in global search:', error);
      return [];
    }
  };

  return {
    searchUsers,
    searchGroups,
    globalSearch
  };
};
