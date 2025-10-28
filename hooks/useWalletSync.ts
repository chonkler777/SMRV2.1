'use client';

import { useEffect, useRef } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/AuthContext/AuthProvider';
import { toast } from 'react-toastify';
import axios from 'axios';

interface User {
  username: string;
  walletAddress: string;
  uid: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_AUTH_BACKEND_ENDPOINT;

const checkUserExists = async (address: string): Promise<User | null> => {
  if (!address) return null;
  
  const q = query(
    collection(db, "users"),
    where("walletAddress", "==", address)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const userData = snapshot.docs[0].data() as User;
    return userData;
  }
  
  return null;
};

const linkWalletToUser = async (uid: string, walletAddress: string): Promise<ApiResponse> => {
  const response = await axios.post<ApiResponse>(
    `${baseUrl}/api/auth/wallet/link`,
    { uid, walletAddress },
    { timeout: 30000 }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.message || "Wallet linking failed");
  }
  
  return response.data;
};

const authenticateUser = async (username: string, walletAddress: string): Promise<string> => {
  const response = await axios.post<ApiResponse>(
    `${baseUrl}/api/auth/authenticate`,
    { username, walletAddress },
    { timeout: 30000 }
  );
  
  if (!response.data.success || !response.data.token) {
    throw new Error(response.data.message || "Authentication failed");
  }
  
  return response.data.token;
};

export const useWalletSync = (address: string | null | undefined, isConnected: boolean) => {
  const { currentUser, setCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  const previousStateRef = useRef<{
    address: string | null | undefined;
    isConnected: boolean;
    userId: string | null;
  }>({
    address: null,
    isConnected: false,
    userId: null
  });

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (currentUser?.walletAddress === address && isConnected) {
        previousStateRef.current = {
          address,
          isConnected,
          userId: currentUser?.uid || null
        };
        return;
      }
      
      const isNewConnection = 
        !previousStateRef.current.isConnected && isConnected && 
        address && 
        currentUser?.username && 
        (previousStateRef.current.address !== address || previousStateRef.current.userId !== currentUser.uid); 

      
      previousStateRef.current = {
        address,
        isConnected,
        userId: currentUser?.uid || null
      };

      
      if (!isNewConnection) return;

      try {

        const existingUser = await checkUserExists(address);

        if (existingUser?.username) {
          
          
          const token = await authenticateUser(existingUser.username, address);
          await signInWithCustomToken(auth, token);
          
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {

            queryClient.setQueryData(['user-check', address], {
              username: existingUser.username,
              walletAddress: address,
              uid: firebaseUser.uid,
            });
            
            setCurrentUser({
              ...firebaseUser,
              username: existingUser.username,
              walletAddress: address,
            });
            

          }
        } else if (currentUser.username && currentUser.uid) {
          
          await linkWalletToUser(currentUser.uid, address);
          
          const token = await authenticateUser(currentUser.username, address);
          await signInWithCustomToken(auth, token);
          
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            
            queryClient.setQueryData(['user-check', address], {
              username: currentUser.username,
              walletAddress: address,
              uid: firebaseUser.uid,
            });
            
            queryClient.invalidateQueries({
              queryKey: ['user-check']
            });
            
            setCurrentUser({
              ...firebaseUser,
              username: currentUser.username,
              walletAddress: address,
            });
            
            toast.success(`Wallet connected to ${currentUser.username}!`);
          }
        }
      } catch (error) {
        console.error("Wallet sync error:", error);
        toast.error("Failed to sync wallet");
      }
    };

    handleWalletConnection();
  }, [address, isConnected, currentUser?.username, currentUser?.uid, setCurrentUser, queryClient]);
};