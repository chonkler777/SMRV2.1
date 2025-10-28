'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';
import type { Meme } from '@/Types';

export function useMemeRealtime(enabled: boolean) {
  const queryClient = useQueryClient();
  const [newMemes, setNewMemes] = useState<Meme[]>([]);
  const [newMemesCount, setNewMemesCount] = useState(0);
  
  const latestTimestamp = useRef<Timestamp | null>(null);
  const processedMemeIds = useRef(new Set<string>());

  const clearNewMemes = () => {
    setNewMemes([]);
    setNewMemesCount(0);
    processedMemeIds.current.clear();
    queryClient.invalidateQueries({ queryKey: ['memes', 'latest'] });
  };

  useEffect(() => {
    if (!enabled) {
      setNewMemes([]);
      setNewMemesCount(0);
      processedMemeIds.current.clear();
      return;
    }

    setNewMemes([]);
    setNewMemesCount(0);


    const memesRef = collection(db, 'memescollection');
    
    let realtimeQuery;
    
    if (latestTimestamp.current) {
      realtimeQuery = query(
        memesRef,
        where('timestamp', '>', latestTimestamp.current),
        orderBy('timestamp', 'desc')
      );
    } else {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      realtimeQuery = query(
        memesRef,
        where('timestamp', '>', Timestamp.fromDate(fiveMinutesAgo)),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      realtimeQuery,
      (snapshot) => {
        const detectedMemes: Meme[] = [];
        let latestTs: Timestamp | null = null;

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const meme = {
            ...data,
            id: doc.id,
            userId: data.userId || data.id
          } as Meme;

          if (
            meme.imageUrl && 
            meme.imageUrl.trim() !== '' && 
            meme.memeId && 
            !processedMemeIds.current.has(meme.memeId)
          ) {
            detectedMemes.push(meme);
            processedMemeIds.current.add(meme.memeId);
            
            if (meme.timestamp && (!latestTs || meme.timestamp.seconds > latestTs.seconds)) {
              latestTs = meme.timestamp;
            }
          }
        });


        if (processedMemeIds.current.size > 500) {
          processedMemeIds.current.clear();
        }

        if (detectedMemes.length > 0) {
          
          if (latestTs) {
            latestTimestamp.current = latestTs;
          }

          setNewMemes(prev => [...detectedMemes, ...prev]);
          setNewMemesCount(prev => prev + detectedMemes.length);
        }
      },
      (error) => {
        console.error('❌ Real-time listener error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, queryClient]);

  return {
    newMemes,
    newMemesCount,
    clearNewMemes,
  };
}