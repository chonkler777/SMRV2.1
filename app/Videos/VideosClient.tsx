'use client';

import { useState, useCallback, useEffect } from "react";
import MemeCard from "@/app/global-components/MemeCard";
import { useAuth } from "@/AuthContext/AuthProvider";
import { fetchMemesServerSide } from "@/lib/meme-server-actions";
import type { SearchBy } from '@/Types'; 
import type { Meme, AppUser } from "@/Types";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { useMemeSearch } from "@/hooks/useMemeSearch"; 
import SearchDropdown from "@/components/SearchEvents/SearchDropdown";
import SearchIcon from "@/public/assets/icons/SearchIcon";
import { useUsernameSearch } from "@/hooks/useUsernameSearch";
import BackToTopButton from "@/components/BacktoTopButton";

interface VideosClientProps {
  initialMemes: Meme[];
  initialHasMore: boolean;
  initialTotal: number;
  initialCursor?: string;
}

export default function VideosClient({ 
  initialMemes, 
  initialHasMore, 
  initialTotal,
  initialCursor 
}: VideosClientProps) {
  const { currentUser }: { currentUser: AppUser | null } = useAuth();
  const [memes, setMemes] = useState(initialMemes);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);


  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('all');
  const [exactMatch, setExactMatch] = useState(false);


  const {
    data: searchData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: searchHasNextPage,
    isLoading: isSearchLoading,
    isSearching,
    isActive: isSearchActive,
  } = useMemeSearch(searchQuery, searchBy, exactMatch, ['video']);


  const searchResults = searchData?.pages.flatMap(page => page.memes) || [];
  const searchTotal = searchData?.pages[0]?.total || 0;


  const displayedMemes = isSearchActive ? searchResults : memes;
  const memeIds = displayedMemes.map(meme => meme.id);
  const voteUpdates = useRealtimeVotes(memeIds);

  const handleShowSignInForm = () => {
  };

  useUsernameSearch(setSearchQuery, setSearchBy);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchBy('tag');
    setExactMatch(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading) return;

    if (isSearchActive) {
      if (searchHasNextPage) {
        fetchNextSearchPage();
      }
    } else {
      if (!hasMore || !nextCursor) return;
      
      setIsLoading(true);
      
      try {
        const result = await fetchMemesServerSide(
          nextCursor, 
          12, 
          ['video']
        );
        
        if (result.memes.length > 0) {
          setMemes(prev => [...prev, ...result.memes]);
          setHasMore(result.hasMore);
          setNextCursor(result.nextCursor);
          setTotal(result.total);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading, isSearchActive, searchHasNextPage, fetchNextSearchPage, hasMore, nextCursor]);


  const memesWithVotes = displayedMemes.map(meme => {
    const update = voteUpdates.get(meme.id);
    return update && update.upvotes !== meme.upvotes
      ? { ...meme, upvotes: update.upvotes }
      : meme;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isSearching) return;
      
      const canLoadMore = isSearchActive ? searchHasNextPage : hasMore;
      if (!canLoadMore) return;

      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadMore();
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [loadMore, isLoading, isSearching, hasMore, searchHasNextPage, isSearchActive]);


  useEffect(() => {
    const checkIfNeedMoreContent = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      const canLoadMore = isSearchActive ? searchHasNextPage : hasMore;
      
      if (scrollHeight <= clientHeight && canLoadMore && !isLoading && !isSearching) {
        loadMore();
      }
    };

    const timer = setTimeout(checkIfNeedMoreContent, 100);
    return () => clearTimeout(timer);
  }, [hasMore, searchHasNextPage, isLoading, isSearching, loadMore, isSearchActive]);

  const isValidSearchBy = (value: string): value is SearchBy => {
    return value === 'all' || value === 'tag' || value === 'username' || value === 'wallet';
  };
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const searchByParam = params.get('searchBy');
    
    if (query && searchByParam && isValidSearchBy(searchByParam)) {
      setSearchQuery(query);
      setSearchBy(searchByParam);
    }
  }, []);

  const displayCount = memesWithVotes.length;
  const displayTotal = isSearchActive ? searchTotal : total;
  const displayHasMore = isSearchActive ? searchHasNextPage : hasMore;
  const isInitialSearch = isSearchActive && searchResults.length === 0 && isSearchLoading;

  return (
    <div className="min-h-screen py-8 pt-24">
      <div className="mb-6 container mx-auto px-4 relative">
        <SearchDropdown
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchBy={setSearchBy}
          searchBy={searchBy}
          exactMatch={exactMatch}  
          setExactMatch={setExactMatch} 
        />
        
        {isSearching && !isInitialSearch && (
          <div className="absolute top-8 right-8 flex items-center gap-2 bg-[#86EFAC]/10 backdrop-blur-sm border border-[#86EFAC]/50 rounded-lg px-3 py-1.5 z-50">
            <div className="w-5 h-5 border-2 border-[#86EFAC] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>


      <div className="mx-3 lg:mx-8 px-4">
        {memesWithVotes.length === 0 && !isLoading && !isSearching && !isInitialSearch ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 flex justify-center">{isSearchActive ? <SearchIcon/> : '🎬'}</div>
            <h3 className="text-xl font-semibold font-roboto mb-2 text-gray-400">
              {isSearchActive ? 'No search results' : 'No videos or GIFs found'}
            </h3>
            <p className="text-gray-500">
              {isSearchActive 
                ? `No results found for "${searchQuery}"`
                : 'Be the first to upload a video or GIF!'}
            </p>
          </div>
        ) : (
          <>
            {!isInitialSearch && memesWithVotes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
                {memesWithVotes.map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    setSearchQuery={setSearchQuery}
                    setSearchBy={(value: string) => setSearchBy(value as SearchBy)}
                    currentUser={currentUser}
                    onShowSignInForm={handleShowSignInForm}
                  />
                ))}
              </div>
            )}


            {(isLoading || isInitialSearch || isSearching) && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {!displayHasMore && memesWithVotes.length > 0 && !isSearching && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">You've reached the end!</div>
              </div>
            )}
          </>
        )}
      </div>
      <BackToTopButton />
    </div>
  );
}












