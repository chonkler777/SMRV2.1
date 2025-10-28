'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { searchClient, MEMES_INDEX } from '@/lib/algolia-client';
import type { Meme } from '@/Types';
import type { SearchBy } from '@/Types';
import type { SearchResponse } from '@algolia/client-search';

interface SearchPageData {
  memes: Meme[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
  currentPage: number;
}

export function useMemeSearch(
  searchQuery: string,
  searchBy: SearchBy,
  exactMatch: boolean,
  fileTypes?: string[]
) {
  const isActive = searchQuery.trim().length > 0;
  
  const query = useInfiniteQuery<SearchPageData>({
    queryKey: ['memes', 'search', searchQuery, searchBy, exactMatch, fileTypes?.join(',') || 'all'],
    
    queryFn: async ({ pageParam = 0 }) => {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      let actualQuery = normalizedQuery;
      if (exactMatch) {

        const words = normalizedQuery.split(/\s+/);
        actualQuery = words.map(word => `"${word}"`).join(' ');
      }
      

      const searchParams: any = {
        hitsPerPage: 12,
        page: pageParam as number,
      };
      

      if (searchBy !== 'all') {
        searchParams.restrictSearchableAttributes = [
          searchBy === 'username' ? 'username' : searchBy
        ];
      }
      

      if (exactMatch) {
        searchParams.advancedSyntax = true;
        searchParams.typoTolerance = false; 
      }
      

      const filters: string[] = [];
      
      if (fileTypes && fileTypes.length > 0) {
        const fileTypeFilters = fileTypes.map(type => `fileType:"${type}"`).join(' OR ');
        filters.push(`(${fileTypeFilters})`);
      }
      
      if (filters.length > 0) {
        searchParams.filters = filters.join(' AND ');
      }
      

      const { results } = await searchClient.search({
        requests: [
          {
            indexName: MEMES_INDEX,
            query: actualQuery, 
            ...searchParams,
          },
        ],
      });
      

      const searchResult = results[0] as SearchResponse<Record<string, any>>;
      

      if (!('hits' in searchResult)) {
        throw new Error('Invalid search response');
      }
      

      const memes = searchResult.hits.map((hit: any) => {
        const { id: userId, objectID, ...rest } = hit;
        return {
          ...rest,
          id: objectID,
          userId: userId
        };
      }) as Meme[];
      
      const total = searchResult.nbHits || 0;
      const currentPage = (searchResult.page || 0) + 1;
      const nbPages = searchResult.nbPages || 0;
      const hasMore = (searchResult.page || 0) < nbPages - 1;
      

      let nextCursor: string | undefined;
      if (hasMore) {
        nextCursor = String((searchResult.page || 0) + 1);
      }
      
      return {
        memes,
        hasMore,
        total,
        currentPage,
        nextCursor
      };
    },
    
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? Number(lastPage.nextCursor) : undefined;
    },
    
    initialPageParam: 0,
    
    enabled: isActive,

    staleTime: 30_000,
    gcTime: 5 * 60_000, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false, 
    retry: 1, 
    
    retryDelay: 500,
  });
  
  return {
    ...query,
    isSearching: query.isFetching && query.fetchStatus !== 'idle',
    isActive,
  };
}












