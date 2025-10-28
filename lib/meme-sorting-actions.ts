'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Meme } from '@/Types';
import { Timestamp } from 'firebase-admin/firestore';

function serializeDoc(doc: FirebaseFirestore.DocumentSnapshot): Record<string, any> & { id: string } {
  const data = doc.data() || {};
  const { id: userId, ...restData } = data;
  
  return {
    id: doc.id, 
    userId: userId, 
    ...Object.entries(restData).reduce((acc, [key, value]) => {
      if (value instanceof Timestamp) {
        acc[key] = value.toDate().toISOString();
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        acc[key] = JSON.parse(JSON.stringify(value));
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>),
  };
}

function addWeeklySeparators(memes: Meme[]): (Meme | { isWeekSeparator: true; weekDiff: number; id: string })[] {
  if (memes.length === 0) return [];
  
  const now = Date.now();
  const result: (Meme | { isWeekSeparator: true; weekDiff: number; id: string })[] = [];
  let lastWeekDiff = -1;
  
  memes.forEach((meme, index) => {
    const timestamp = typeof meme.timestamp === 'string' 
      ? new Date(meme.timestamp).getTime() 
      : new Date(meme.timestamp as any).getTime();
    
    const weekDiff = Math.floor((now - timestamp) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekDiff !== lastWeekDiff && index > 0) {
      result.push({
        isWeekSeparator: true,
        weekDiff,
        id: `week-separator-${weekDiff}`
      });
    }
    
    result.push(meme);
    lastWeekDiff = weekDiff;
  });
  
  return result;
}




export async function fetchHotMemes(
  cursor?: string,
  limit: number = 12,
  skipCount: boolean = false
): Promise<{
  memes: (Meme | { isWeekSeparator: true; weekDiff: number; id: string })[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}> {
  try {
    
    const memesRef = adminDb.collection('memescollection');
    
    let total = -1;
    const shouldSkipCount = skipCount || !!cursor;
    if (!shouldSkipCount) {
      const totalSnapshot = await memesRef.where('upvotes', '>=', 3).count().get();
      total = totalSnapshot.data().count;
    }
    
    let query = memesRef
      .where('upvotes', '>=', 3)
      .orderBy('timestamp', 'desc')
      .limit(limit + 1);

    if (cursor && typeof cursor === 'string' && cursor.trim() !== '') {
      try {
        const [timestampStr] = cursor.split('_');
        const cursorTimestamp = Timestamp.fromDate(new Date(timestampStr));
        query = query.startAfter(cursorTimestamp);
      } catch (error) {
        console.error(`❌ Invalid hot cursor ${cursor}:`, error);
      }
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return { memes: [], hasMore: false, total, nextCursor: undefined };
    }


    const allMemes = snapshot.docs
      .map(doc => serializeDoc(doc) as Meme)
      .filter(meme => meme.imageUrl && meme.imageUrl.trim() !== '');

    const hasMore = allMemes.length > limit;
    const memes = hasMore ? allMemes.slice(0, limit) : allMemes;
    

    const nextCursor = hasMore && memes.length > 0
      ? `${memes[memes.length - 1].timestamp}_${memes[memes.length - 1].id}`
      : undefined;
    
    const memesWithSeparators = addWeeklySeparators(memes);
    
    return { 
      memes: memesWithSeparators, 
      nextCursor,
      hasMore,
      total
    };
    
  } catch (error) {
    console.error('Hot memes fetch error:', error);
    return { memes: [], hasMore: false, total: 0, nextCursor: undefined };
  }
}







export async function fetchRandomMemes(
  cursor?: string,
  limit?: number,
  skipCount: boolean = false 
): Promise<{
  memes: Meme[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}> {
  try {
    const actualLimit = limit ?? 12;
    
    const memesRef = adminDb.collection('memescollection');
    
    let total = -1;
    const shouldSkipCount = skipCount || !!cursor;
    
    if (!shouldSkipCount) {
      const totalSnapshot = await memesRef.count().get();
      total = totalSnapshot.data().count;
    }
    
    const randomThreshold = Math.random();
    
    let query = memesRef
      .where('randomValue', '>=', randomThreshold)
      .orderBy('randomValue', 'asc')
      .limit(actualLimit + 1);

    if (cursor && typeof cursor === 'string' && cursor.trim() !== '') {
      const cursorDoc = await memesRef.doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      } else {
        console.warn(`⚠️ Random memes cursor ${cursor} not found`);
      }
    }

    let snapshot = await query.get();
    
    if (snapshot.size < actualLimit + 1) {
      const additionalQuery = memesRef
        .where('randomValue', '<', randomThreshold)
        .orderBy('randomValue', 'desc')
        .limit(actualLimit + 1 - snapshot.size);
      
      const additionalSnapshot = await additionalQuery.get();
      const allDocs = [...snapshot.docs, ...additionalSnapshot.docs];
      snapshot = { docs: allDocs, size: allDocs.length, empty: allDocs.length === 0 } as any;
    }
    
    if (snapshot.empty) {
      return { memes: [], hasMore: false, total, nextCursor: undefined };
    }
    
    const serializeStart = Date.now();
    const allMemes = snapshot.docs
      .map(doc => serializeDoc(doc) as Meme)
      .filter(meme => meme.imageUrl && meme.imageUrl.trim() !== '');
    
    const hasMore = allMemes.length > actualLimit;
    const memes = hasMore ? allMemes.slice(0, actualLimit) : allMemes;
    const nextCursor = hasMore ? memes[memes.length - 1].id : undefined;
    
    return { memes, nextCursor, hasMore, total };
    
  } catch (error) {
    console.error('Random memes fetch error:', error);
    return { memes: [], hasMore: false, total: 0, nextCursor: undefined };
  }
}

export async function fetchLatestMemes(
  cursor?: string,
  limit: number = 12
): Promise<{
  memes: Meme[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}> {
  const { fetchMemesServerSide } = await import('./meme-server-actions');
  return fetchMemesServerSide(cursor, limit);
}

