
import React from 'react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useSocket } from '@/hooks/useSocket';
import UserSetup from '@/components/UserSetup';
import ChatHome from '@/components/ChatHome';

const IndexContent: React.FC = () => {
  const { currentUser } = useUser();
  useSocket(); // Initialize socket connection

  if (!currentUser) {
    return <UserSetup />;
  }

  return <ChatHome />;
};

const Index: React.FC = () => {
  return (
    <UserProvider>
      <IndexContent />
    </UserProvider>
  );
};

export default Index;
