'use client'


import { useState, useEffect, useMemo, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface VoteUpdate {
  docId: string;
  upvotes: number;
  timestamp: number;
}

export function useRealtimeVotes(visibleMemeIds: string[]) {
  const [voteUpdates, setVoteUpdates] = useState<Map<string, VoteUpdate>>(new Map());
  const activeListenersRef = useRef<Map<string, () => void>>(new Map());
  const isMountedRef = useRef(true);


  const stableVisibleIds = useMemo(() => {
    return [...visibleMemeIds].sort();
  }, [visibleMemeIds.join(',')]);

  useEffect(() => {
    isMountedRef.current = true;


    const updateListeners = (memeIds: string[]) => {
      const currentListeners = activeListenersRef.current;
      const newListeners = new Map<string, () => void>();


      currentListeners.forEach((unsubscribe, docId) => {
        if (!memeIds.includes(docId)) {
          unsubscribe();
        } else {
          newListeners.set(docId, unsubscribe);
        }
      });


      memeIds.forEach(docId => {
        if (!currentListeners.has(docId)) {
          const memeRef = doc(db, "memescollection", docId);
          
          const unsubscribe = onSnapshot(memeRef, (docSnapshot) => {
            if (!isMountedRef.current) return;

            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              
              setVoteUpdates(prev => {
                const newMap = new Map(prev);
                newMap.set(docId, {
                  docId,
                  upvotes: data.upvotes || 0,
                  timestamp: Date.now()
                });
                return newMap;
              });
            }
          }, (error) => {
            console.warn(`Vote listener error for ${docId}:`, error);
          });

          newListeners.set(docId, unsubscribe);

        }
      });

      activeListenersRef.current = newListeners;
    };


    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        updateListeners(stableVisibleIds);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [stableVisibleIds]);


  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeListenersRef.current.forEach(unsubscribe => unsubscribe());
      activeListenersRef.current.clear();
    };
  }, []);

  return voteUpdates;
}