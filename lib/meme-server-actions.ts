'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Meme } from '@/Types';
import { unstable_cache } from 'next/cache';
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


async function fetchMemesCore(
  cursor: string | undefined,
  limit: number,
  fileTypes?: string[],
  skipCount: boolean = false
): Promise<{
  memes: Meme[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}> {
  try {
    
    const memesRef = adminDb.collection('memescollection');
    

    let total = -1;
    if (!skipCount) {
      let countQuery: FirebaseFirestore.Query | FirebaseFirestore.CollectionReference = memesRef;
      if (fileTypes && fileTypes.length > 0) {
        countQuery = countQuery.where('fileType', 'in', fileTypes);
      }
      const totalSnapshot = await countQuery.count().get();
      total = totalSnapshot.data().count;
    }
    

    let query: FirebaseFirestore.Query = memesRef;
    
    if (fileTypes && fileTypes.length > 0) {
      query = query.where('fileType', 'in', fileTypes);
    }
    
    query = query.orderBy('timestamp', 'desc').limit(limit + 1);
    

    if (cursor && typeof cursor === 'string' && cursor.trim() !== '') {
      try {

        const [timestampStr] = cursor.split('_');
        const cursorTimestamp = Timestamp.fromDate(new Date(timestampStr));
        query = query.startAfter(cursorTimestamp);
      } catch (error) {
        console.error(`❌ Invalid cursor ${cursor}:`, error);
      }
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return { memes: [], hasMore: false, total, nextCursor: undefined };
    }

    const allDocs = snapshot.docs.map(doc => ({
      doc,
      serialized: serializeDoc(doc) as Meme
    }));

    const validMemes = allDocs
      .filter(({ serialized }) => serialized.imageUrl && serialized.imageUrl.trim() !== '')
      .map(({ serialized }) => serialized);
    

    const hasMore = snapshot.docs.length > limit;
    const memes = validMemes.slice(0, limit);
    

    const nextCursor = hasMore && memes.length > 0 
      ? `${memes[memes.length - 1].timestamp}_${memes[memes.length - 1].id}` 
      : undefined;
    
    
    return { memes, hasMore, total, nextCursor };
    
  } catch (error) {
    return { memes: [], hasMore: false, total: 0, nextCursor: undefined };
  }
}


const fetchFirstPageCached = unstable_cache(
  async (limit: number, fileTypes?: string[]) => {
    return fetchMemesCore(undefined, limit, fileTypes, false);
  },
  ['memes-first-page'],
  {
    revalidate: 10,
    tags: ['memes', 'latest-memes'],
  }
);


async function fetchMemesUncached(
  cursor: string,
  limit: number,
  fileTypes?: string[]
): Promise<{
  memes: Meme[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}> {
  return fetchMemesCore(cursor, limit, fileTypes, true);
}


export async function fetchMemesServerSide(
  cursor?: string,
  limit: number = 12,
  fileTypes?: string[]
): Promise<{
  memes: Meme[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}> {
  if (!cursor) {
    return fetchFirstPageCached(limit, fileTypes);
  }
  
  return fetchMemesUncached(cursor, limit, fileTypes);
}


export async function fetchMemesInfinite(
  cursor?: string,
  limit: number = 12
): Promise<{
  memes: Meme[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}> {
  return fetchMemesServerSide(cursor, limit);
}

export async function revalidateMemesCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('memes');
  revalidateTag('latest-memes');
}


