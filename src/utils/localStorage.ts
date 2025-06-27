
import { User, Group, Chat } from '@/types/user';

export const loadFromStorage = () => {
  const savedUser = localStorage.getItem('currentUser');
  const savedUsers = localStorage.getItem('users');
  const savedGroups = localStorage.getItem('groups');
  const savedChats = localStorage.getItem('chats');

  return {
    currentUser: savedUser ? JSON.parse(savedUser) : null,
    users: savedUsers ? JSON.parse(savedUsers) : [],
    groups: savedGroups ? JSON.parse(savedGroups) : [],
    chats: savedChats ? JSON.parse(savedChats) : []
  };
};

export const saveToStorage = {
  currentUser: (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  users: (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  },
  groups: (groups: Group[]) => {
    localStorage.setItem('groups', JSON.stringify(groups));
  },
  chats: (chats: Chat[]) => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }
};
