'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppUser, AuthContextType } from '@/Types';



const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- localStorage helpers ---------- */
const LS_KEY = 'cachedUser';

const readCachedUser = (): AppUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
};

const writeCachedUser = (user: AppUser | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
    else localStorage.removeItem(LS_KEY);
  } catch (e) {
    
    console.warn('Failed to write cache', e);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const cachedOnMount = useMemo(() => readCachedUser(), []);
  const [currentUser, setCurrentUserState] = useState<AppUser | null>(cachedOnMount);
  const [initialized, setInitialized] = useState(false);
  const initRan = useRef(false);

  
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          const enriched: AppUser = {
            uid: fbUser.uid,
            username: snap.exists() ? snap.data().username ?? null : null,
            walletAddress: snap.exists() ? snap.data().walletAddress ?? null : null,
          };
          setCurrentUserState(enriched);
          writeCachedUser(enriched);
        } else {
          setCurrentUserState(null);
          writeCachedUser(null);
        }
      } finally {
        setInitialized(true);
      }
    });

    return () => unsub();
  }, []);

  
  const setCurrentUser = (u: AppUser | null) => {
    setCurrentUserState(u);
    writeCachedUser(u);
  };

  
  const logout = async () => {

    setCurrentUserState(null);
    writeCachedUser(null);
    
    setInitialized(true);
    try {
      await auth.signOut();
    } catch {
      
    }
  };

  
  const authLoading = !initialized && !cachedOnMount;
  const isAuthenticated = initialized && !!currentUser;

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    authLoading,
    isAuthenticated,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}









