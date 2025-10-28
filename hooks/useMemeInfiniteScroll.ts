'use client';

import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { fetchMemesServerSide } from '@/lib/meme-server-actions';
import { fetchHotMemes, fetchRandomMemes } from '@/lib/meme-sorting-actions';
import type { Meme } from '@/Types';

type SortMode = 'latest' | 'hot' | 'random';
type MemeOrSeparator = Meme | { isWeekSeparator: true; weekDiff: number; id: string };

interface MemePageData {
  memes: MemeOrSeparator[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export function useMemeInfiniteScroll(
  sortMode: SortMode,
  initialData?: {
    memes: MemeOrSeparator[];
    nextCursor?: string;
    hasMore: boolean;
    total: number;
  }
) {
  return useInfiniteQuery<MemePageData>({
    queryKey: ['memes', sortMode],
    
    queryFn: async ({ pageParam }) => {
      
      const skipCount = !!pageParam;
      
      let result;
      
      if (sortMode === 'latest') {
        result = await fetchMemesServerSide(pageParam as string | undefined, 12);
      } else if (sortMode === 'hot') {
        result = await fetchHotMemes(pageParam as string | undefined, 12, skipCount); 
      } else if (sortMode === 'random') {
        result = await fetchRandomMemes(pageParam as string | undefined, 12, skipCount);
      }
      
      if (!result) {
        throw new Error(`Failed to fetch ${sortMode} memes`);
      }
      
      
      return result as MemePageData;
    },
    
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    
    initialPageParam: undefined,
    

    ...(initialData && {
      initialData: {
        pages: [{
          memes: initialData.memes,
          nextCursor: initialData.nextCursor,
          hasMore: initialData.hasMore,
          total: initialData.total,
        }],
        pageParams: [undefined],
      } as InfiniteData<MemePageData, unknown>,
    }),
    
    staleTime: sortMode === 'hot' ? 60_000 :
    sortMode === 'latest' ? 10_000 :
    0,
    
    gcTime: sortMode === 'random' ? 0 : 5 * 60_000,
    refetchOnWindowFocus: sortMode === 'latest',
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}



