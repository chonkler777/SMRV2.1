'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';


type MinimalUser = {
  walletAddress?: string | null;
  username?: string | null;
  uid?: string;
};

export const useAutoLogout = (
  currentUser: MinimalUser | null,
  isConnected: boolean,
  walletHydrated: boolean = true,
) => {
  const queryClient = useQueryClient();
  const wasConnectedRef = useRef(false);


  useEffect(() => {

    if (!currentUser) {
      wasConnectedRef.current = false;
      return;
    }

    if (isConnected && walletHydrated) {
      wasConnectedRef.current = true;
      return;
    }

    if (
      walletHydrated && 
      currentUser?.walletAddress && 
      wasConnectedRef.current && 
      !isConnected
    ) {
      
      const logout = async () => {
        try {
          queryClient.clear();
          await signOut(auth);
        } catch (error) {
          console.error('Auto-logout failed:', error);
        }
      };
      
      logout();
      wasConnectedRef.current = false; 
    }
  }, [currentUser, isConnected, walletHydrated, queryClient]);

  return {};
};



