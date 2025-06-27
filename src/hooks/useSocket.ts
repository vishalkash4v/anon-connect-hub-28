
import { useEffect, useRef } from 'react';
import { socketService } from '@/services/socketService';
import { useUser } from '@/contexts/UserContext';

export const useSocket = () => {
  const { currentUser } = useUser();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (currentUser && !hasInitialized.current) {
      console.log('Initializing socket for user:', currentUser.id);
      socketService.connect();
      
      // Wait a bit for connection then join
      setTimeout(() => {
        if (socketService.isConnected()) {
          socketService.join(currentUser.id);
        }
      }, 1000);
      
      hasInitialized.current = true;
    }

    return () => {
      if (!currentUser) {
        socketService.disconnect();
        hasInitialized.current = false;
      }
    };
  }, [currentUser]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return socketService;
};
