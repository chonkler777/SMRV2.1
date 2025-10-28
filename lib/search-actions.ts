'use server';

import { client, MEMES_INDEX } from '@/lib/algolia';
import type { Meme } from '@/Types';
import { SearchResponse } from 'algoliasearch';

export type SearchBy = 'username' | 'tag' | 'wallet' | 'all';


export async function searchMemes(
  query: string,
  searchBy: SearchBy = 'all',
  exactMatch: boolean = false,
  page: number = 1,
  limit: number = 12,
  unlimited: boolean = false,
  cursor?: string,
  fileTypes?: string[] 
): Promise<{
  memes: Meme[];
  hasMore: boolean;
  total: number;
  currentPage: number;
  nextCursor?: string;
}> {
  try {
    let actualPage = page;
    if (cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
        actualPage = cursorData.page || page;
      } catch (error) {
        console.warn('Invalid cursor, using page parameter');
      }
    }
    
    if (!query.trim()) {
      return { memes: [], hasMore: false, total: 0, currentPage: actualPage };
    }

    const normalizedQuery = query.toLowerCase().trim();

    const searchParams: any = {
      hitsPerPage: unlimited ? 1000 : limit,
      page: actualPage - 1,
    };

    if (searchBy !== 'all') {
      searchParams.restrictSearchableAttributes = [searchBy === 'username' ? 'username' : searchBy];
    }

    const filters: string[] = [];
    
    if (exactMatch) {
      const filterField = searchBy === 'all' ? '' : searchBy;
      if (filterField && filterField !== 'wallet') {
        filters.push(`${filterField}:"${query}"`);
      }
    }
    
    if (fileTypes && fileTypes.length > 0) {
      const fileTypeFilters = fileTypes.map(type => `fileType:"${type}"`).join(' OR ');
      filters.push(`(${fileTypeFilters})`);
    }
    
    if (filters.length > 0) {
      searchParams.filters = filters.join(' AND ');
    }

    const { results } = await client.search({
      requests: [
        {
          indexName: MEMES_INDEX,
          query: normalizedQuery,
          ...searchParams,
        },
      ],
    });


    const searchResult = results[0] as SearchResponse<Record<string, any>>;
    const rawHits = searchResult.hits;

    const memes = rawHits.map((hit: any) => {
      const { id: userId, objectID, ...rest } = hit;
      return {
        ...rest,
        id: objectID,  
        userId: userId  
      };
    }) as Meme[];
    
    const total = searchResult.nbHits || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = unlimited ? false : actualPage < totalPages;

    let nextCursor: string | undefined;
    if (hasMore) {
      const cursorData = { page: actualPage + 1 };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    return {
      memes,
      hasMore,
      total,
      currentPage: actualPage,
      nextCursor,
    };

  } catch (error) {
    console.error('❌ Algolia search error:', error);
    return { memes: [], hasMore: false, total: 0, currentPage: page };
  }
}

// REMOVED: searchMemesServerSide with unstable_cache
// Now just use searchMemes directly

export async function getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
  try {
    if (!query.trim()) return [];
    
    const { results } = await client.search({
      requests: [
        {
          indexName: MEMES_INDEX,
          query: query.toLowerCase().trim(),
          hitsPerPage: 20,
          attributesToRetrieve: ['username', 'tag'],
        },
      ],
    });

    const suggestions = new Set<string>();
    const searchResult = results[0] as SearchResponse<Record<string, any>>;
    const hits = searchResult.hits;


    hits.forEach((hit) => {
      if (hit.username) suggestions.add(hit.username);
      if (hit.tag) {
        const words = hit.tag.toLowerCase().split(' ');
        words.forEach((word: string) => {
          if (word.includes(query.toLowerCase()) && word.length > 2) {
            suggestions.add(word);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, limit);
    
  } catch (error) {
    console.error('Algolia suggestions error:', error);
    return [];
  }
}














// 'use server';

// import { client, MEMES_INDEX } from '@/lib/algolia';
// import type { Meme } from '@/Types';
// import { unstable_cache } from 'next/cache';
// import { SearchResponse } from 'algoliasearch';

// export type SearchBy = 'username' | 'tag' | 'wallet' | 'all';


// export async function searchMemes(
//   query: string,
//   searchBy: SearchBy = 'all',
//   exactMatch: boolean = false,
//   page: number = 1,
//   limit: number = 12,
//   unlimited: boolean = false,
//   cursor?: string,
//   fileTypes?: string[] 
// ): Promise<{
//   memes: Meme[];
//   hasMore: boolean;
//   total: number;
//   currentPage: number;
//   nextCursor?: string;
// }> {
//   try {
//     let actualPage = page;
//     if (cursor) {
//       try {
//         const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
//         actualPage = cursorData.page || page;
//       } catch (error) {
//         console.warn('Invalid cursor, using page parameter');
//       }
//     }
    
//     if (!query.trim()) {
//       return { memes: [], hasMore: false, total: 0, currentPage: actualPage };
//     }

//     const normalizedQuery = query.toLowerCase().trim();

//     const searchParams: any = {
//       hitsPerPage: unlimited ? 1000 : limit,
//       page: actualPage - 1,
//     };

//     if (searchBy !== 'all') {
//       searchParams.restrictSearchableAttributes = [searchBy === 'username' ? 'username' : searchBy];
//     }

//     const filters: string[] = [];
    
//     if (exactMatch) {
//       const filterField = searchBy === 'all' ? '' : searchBy;
//       if (filterField && filterField !== 'wallet') {
//         filters.push(`${filterField}:"${query}"`);
//       }
//     }
    
//     if (fileTypes && fileTypes.length > 0) {
//       const fileTypeFilters = fileTypes.map(type => `fileType:"${type}"`).join(' OR ');
//       filters.push(`(${fileTypeFilters})`);
//     }
    
//     if (filters.length > 0) {
//       searchParams.filters = filters.join(' AND ');
//     }

//     const { results } = await client.search({
//       requests: [
//         {
//           indexName: MEMES_INDEX,
//           query: normalizedQuery,
//           ...searchParams,
//         },
//       ],
//     });


//     const searchResult = results[0] as SearchResponse<Record<string, any>>;
//     const rawHits = searchResult.hits;

//     const memes = rawHits.map((hit: any) => {
//       const { id: userId, objectID, ...rest } = hit;
//       return {
//         ...rest,
//         id: objectID,  
//         userId: userId  
//       };
//     }) as Meme[];
    
//     const total = searchResult.nbHits || 0;
//     const totalPages = Math.ceil(total / limit);
//     const hasMore = unlimited ? false : actualPage < totalPages;

//     let nextCursor: string | undefined;
//     if (hasMore) {
//       const cursorData = { page: actualPage + 1 };
//       nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
//     }

//     return {
//       memes,
//       hasMore,
//       total,
//       currentPage: actualPage,
//       nextCursor,
//     };

//   } catch (error) {
//     console.error('❌ Algolia search error:', error);
//     return { memes: [], hasMore: false, total: 0, currentPage: page };
//   }
// }


// export const searchMemesServerSide = unstable_cache(
//   async (
//     query: string, 
//     searchBy: SearchBy = 'all', 
//     exactMatch: boolean = false, 
//     page: number = 1, 
//     limit: number = 12,
//     unlimited: boolean = false,
//     cursor?: string,
//     fileTypes?: string[] 
//   ) => {
//     return await searchMemes(query, searchBy, exactMatch, page, limit, unlimited, cursor, fileTypes);
//   },
//   ['memes-algolia-search'],
//   {
//     revalidate: 300, 
//     tags: ['memes', 'search', 'algolia']
//   }
// );

// export async function getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
//   try {
//     if (!query.trim()) return [];
    
//     const { results } = await client.search({
//       requests: [
//         {
//           indexName: MEMES_INDEX,
//           query: query.toLowerCase().trim(),
//           hitsPerPage: 20,
//           attributesToRetrieve: ['username', 'tag'],
//         },
//       ],
//     });

//     const suggestions = new Set<string>();
//     const searchResult = results[0] as SearchResponse<Record<string, any>>;
//     const hits = searchResult.hits;


//     hits.forEach((hit) => {
//       if (hit.username) suggestions.add(hit.username);
//       if (hit.tag) {
//         const words = hit.tag.toLowerCase().split(' ');
//         words.forEach((word: string) => {
//           if (word.includes(query.toLowerCase()) && word.length > 2) {
//             suggestions.add(word);
//           }
//         });
//       }
//     });
    
//     return Array.from(suggestions).slice(0, limit);
    
//   } catch (error) {
//     console.error('Algolia suggestions error:', error);
//     return [];
//   }
// }


