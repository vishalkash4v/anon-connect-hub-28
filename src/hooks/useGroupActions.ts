
import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { User, Group } from '@/types/user';
import { saveToStorage } from '@/utils/localStorage';

export const useGroupActions = (
  currentUser: User | null,
  groups: Group[],
  setGroups: (groups: Group[]) => void,
  setTrendingGroups: (groups: Group[]) => void,
  setNewGroups: (groups: Group[]) => void,
  setPopularGroups: (groups: Group[]) => void
) => {
  const [loading, setLoading] = useState(false);

  const createGroup = async (groupData: { name: string; description?: string }) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const apiResponse = await apiService.createGroup({
        group_name: groupData.name,
        description: groupData.description,
        createdBy: currentUser.id
      });

      const newGroup: Group = {
        id: apiResponse.data._id,
        name: groupData.name,
        description: groupData.description,
        members: [currentUser.id],
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      saveToStorage.groups(updatedGroups);

      await loadGroupsOverview();

      toast({
        title: "Success",
        description: "Group created successfully!"
      });
    } catch (error) {
      console.error('Error creating group:', error);
      const newGroup: Group = {
        id: `local_group_${Date.now()}`,
        name: groupData.name,
        description: groupData.description,
        members: [currentUser.id],
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      saveToStorage.groups(updatedGroups);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupsOverview = async () => {
    try {
      const response = await apiService.getGroupsOverview();
      
      if (response.status && response.data) {
        const convertApiGroup = (apiGroup: any): Group => ({
          id: apiGroup._id,
          name: apiGroup.group_name,
          description: apiGroup.description || '',
          members: [],
          createdBy: '',
          createdAt: new Date(apiGroup.createdAt || Date.now()),
          updatedAt: new Date(apiGroup.createdAt || Date.now())
        });

        setTrendingGroups(response.data.trending?.map(convertApiGroup) || []);
        setNewGroups(response.data.new?.map(convertApiGroup) || []);
        setPopularGroups(response.data.popular?.map(convertApiGroup) || []);
      }
    } catch (error) {
      console.error('Error loading groups overview:', error);
      setTrendingGroups(groups.slice(0, 5));
      setNewGroups(groups.slice(-5).reverse());
      setPopularGroups(groups.sort((a, b) => b.members.length - a.members.length).slice(0, 5));
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await apiService.joinGroup({
        groupId,
        userId: currentUser.id
      });

      const updatedGroups = groups.map(group => 
        group.id === groupId && !group.members.includes(currentUser.id)
          ? { ...group, members: [...group.members, currentUser.id], updatedAt: new Date() }
          : group
      );
      setGroups(updatedGroups);
      saveToStorage.groups(updatedGroups);

      toast({
        title: "Success",
        description: "Joined group successfully!"
      });
    } catch (error) {
      console.error('Error joining group:', error);
      const updatedGroups = groups.map(group => 
        group.id === groupId && !group.members.includes(currentUser.id)
          ? { ...group, members: [...group.members, currentUser.id], updatedAt: new Date() }
          : group
      );
      setGroups(updatedGroups);
      saveToStorage.groups(updatedGroups);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createGroup,
    joinGroup,
    loadGroupsOverview
  };
};
