"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemeInfiniteScroll } from "@/hooks/useMemeInfiniteScroll";
import { useMemeRealtime } from "@/hooks/useMemeRealtime";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { useMemeSearch } from "@/hooks/useMemeSearch";
import { useVisibleMemes } from "@/hooks/useVisibleMemes";
import type { Meme } from "@/Types";
import MemeCard from "@/app/global-components/MemeCard";
import { useAuth } from "@/AuthContext/AuthProvider";
import LatestActive from "@/public/assets/icons/LatestActive";
import LatestSvg from "@/public/assets/icons/LatestSvg";
import RandomActive from "@/public/assets/icons/RandomActive";
import RandomSvg from "@/public/assets/icons/RandomSvg";
import HotActive from "@/public/assets/icons/HotActive";
import HotSvg from "@/public/assets/icons/HotSvg";
import StickyHeader from "@/components/StickyHeader";
import type { SearchBy } from "@/Types";
import { InfiniteData } from "@tanstack/react-query";
import SearchIcon from "@/public/assets/icons/SearchIcon";
import BackToTopButton from "@/components/BacktoTopButton";
import { useUsernameSearch } from "@/hooks/useUsernameSearch";
import SearchDropdown from "@/components/SearchEvents/SearchDropdown";
import UploadIcon from "@/public/assets/icons/UploadIcon";
import MemeUserIcon from "@/public/assets/icons/MemeUserIcon";
import { useWallet } from "@/AuthContext/WalletProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SortMode = "latest" | "hot" | "random";
type MemeOrSeparator =
  | Meme
  | { isWeekSeparator: true; weekDiff: number; id: string };

interface ExploreMemeGridProps {
  initialMemes: Meme[];
  initialHasMore: boolean;
  initialTotal: number;
  initialNextCursor?: string;
}

type MemeInfiniteData = InfiniteData<
  {
    memes: MemeOrSeparator[];
    nextCursor?: string;
    hasMore: boolean;
    total: number;
  },
  unknown
>;

export default function ExploreMemeGrid({
  initialMemes,
  initialHasMore,
  initialTotal,
  initialNextCursor,
}: ExploreMemeGridProps) {
  const { currentUser } = useAuth();
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [deletedMemeIds, setDeletedMemeIds] = useState<Set<string>>(new Set());


  const [sortMode, setSortMode] = useState<SortMode>("latest");


  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<SearchBy>("all");
  const [exactMatch, setExactMatch] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  useUsernameSearch(setSearchQuery, setSearchBy);

  

  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMemes,
  } = useMemeInfiniteScroll(
    sortMode,
    sortMode === "latest"
      ? {
          memes: initialMemes,
          nextCursor: initialNextCursor,
          hasMore: initialHasMore,
          total: initialTotal,
        }
      : undefined
  );

  const typedPaginatedData = paginatedData as MemeInfiniteData | undefined;


  const {
    data: searchData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: searchHasNextPage,
    isLoading: isSearchLoading,
    isSearching,
    isActive: isSearchActive,
  } = useMemeSearch(searchQuery, searchBy, exactMatch);


  const { newMemes, newMemesCount, clearNewMemes } = useMemeRealtime(
    sortMode === "latest" && !isSearchActive
  );

  const { visibleIds, observe } = useVisibleMemes(!isSearchActive, 12);


  const visibleMemeIds = useMemo(() => {
    return visibleIds.slice(0, 12);
  }, [visibleIds]);


  const searchMemeIds = useMemo(() => {
    if (!searchData?.pages) return [];
    return searchData.pages
      .flatMap((page) => page.memes)
      .slice(0, 12)
      .map((meme) => meme.id);
  }, [searchData]);

  const voteUpdates = useRealtimeVotes(visibleMemeIds);
  const searchVoteUpdates = useRealtimeVotes(searchMemeIds);


  const allMemes = useMemo(() => {
    if (!paginatedData?.pages) return [];
    return paginatedData.pages.flatMap((page) => page.memes);
  }, [paginatedData]);


  const searchResults = useMemo(() => {
    if (!searchData?.pages) return [];
    return searchData.pages.flatMap((page) => page.memes);
  }, [searchData]);

  const handleMemeDeleted = useCallback((docId: string) => {
    setDeletedMemeIds(prev => new Set(prev).add(docId));
  }, []);

  const displayMemes = useMemo(() => {
    let memes: MemeOrSeparator[];
    
    if (isSearchActive) {
      memes = searchResults;
    } else {
      const paginatedIds = new Set(
        allMemes
          .filter((m) => !("isWeekSeparator" in m))
          .map((m) => (m as Meme).id)
      );
  
      const uniqueNewMemes = newMemes.filter(
        (meme) => !paginatedIds.has(meme.id)
      );
  
      memes = [...uniqueNewMemes, ...allMemes];
    }
    
    return memes.filter(meme => 
      "isWeekSeparator" in meme ? true : !deletedMemeIds.has(meme.id)
    );
  }, [isSearchActive, searchResults, newMemes, allMemes, deletedMemeIds]);


  const memesWithVotes = useMemo(() => {
    const updates = isSearchActive ? searchVoteUpdates : voteUpdates;
    if (updates.size === 0) return displayMemes;

    return displayMemes.map((meme) => {
      if ("isWeekSeparator" in meme) return meme;
      const update = updates.get(meme.id);
      return update && update.upvotes !== meme.upvotes
        ? { ...meme, upvotes: update.upvotes }
        : meme;
    });
  }, [displayMemes, voteUpdates, searchVoteUpdates, isSearchActive]);


  const memesToDisplay = memesWithVotes;
  const displayCount = memesToDisplay.filter(
    (m) => !("isWeekSeparator" in m)
  ).length;
  const displayTotal = isSearchActive
    ? searchData?.pages[0]?.total || 0
    : paginatedData?.pages[0]?.total || initialTotal;
  const displayHasMore = isSearchActive ? searchHasNextPage : hasNextPage;
  const isLoading = isSearchActive ? isSearchLoading : isLoadingMemes;
  const isInitialSearch =
    isSearchActive && searchResults.length === 0 && isSearchLoading;
  const activeSort = isSearchActive ? "search" : sortMode;


  const isSwitchingMode = isLoadingMemes && !typedPaginatedData?.pages?.length;


  const getWeekLabel = (weekDiff: number): string => {
    if (weekDiff === 0) return "This Week";
    if (weekDiff === 1) return "Last Week";


    return `${weekDiff} Weeks Ago`;
  };


  const handleSortChange = (newSort: SortMode) => {

    if (newSort === "random") {
      if (isSearchActive) {
        setSearchQuery("");
      }

      queryClient.invalidateQueries({ queryKey: ["memes", "random"] });


      if (sortMode === "random") {
        clearNewMemes();
        return;
      }

      setSortMode(newSort);
      clearNewMemes();
      return;
    }

    if (newSort === sortMode) return;

    if (isSearchActive) {
      setSearchQuery("");
    }

    setSortMode(newSort);
    clearNewMemes();
  };



  const handleShowSignInForm = () => {
    setAuthModalOpen(true);
  };


  const loadMore = useCallback(() => {
    if (isFetchingNextPage) return;

    if (isSearchActive && searchHasNextPage) {
      fetchNextSearchPage();
    } else if (!isSearchActive && hasNextPage) {
      fetchNextPage();
    }
  }, [
    isSearchActive,
    searchHasNextPage,
    hasNextPage,
    fetchNextSearchPage,
    fetchNextPage,
    isFetchingNextPage,
  ]);

  


  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingNextPage) return;

      const canLoadMore = isSearchActive ? searchHasNextPage : hasNextPage;
      if (!canLoadMore) return;

      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
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

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [
    loadMore,
    isFetchingNextPage,
    hasNextPage,
    searchHasNextPage,
    isSearchActive,
  ]);


  useEffect(() => {
    const checkIfNeedMoreContent = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      const canLoadMore = isSearchActive ? searchHasNextPage : hasNextPage;

      if (scrollHeight <= clientHeight && canLoadMore && !isFetchingNextPage) {
        const mode = isSearchActive ? "search" : sortMode;

        loadMore();
      }
    };

    const timer = setTimeout(checkIfNeedMoreContent, 100);
    return () => clearTimeout(timer);
  }, [
    hasNextPage,
    searchHasNextPage,
    isFetchingNextPage,
    loadMore,
    sortMode,
    isSearchActive,
  ]);

  const shouldUseRealtime = !isSearchActive;

  return (
    <div className="space-y-6 pt-18 lg:pt-24">
      <div className="fixed top-[77px] z-40 -mt-[1px] left-[43px] 2xl:left-[46px] right-0 flex px-6 justify-center lg:justify-between items-center pb-1 pointer-events-none">
        <div className="hidden lg:flex text-[18px] pl-6 space-x-3 text-[#] pointer-events-auto">
          <button
            onClick={() => handleSortChange("hot")}
            disabled={isSwitchingMode}
            className={`${
              sortMode === "hot"
                ? "bg-[#004E1F1A] border border-[#86EFAC] text-[#86EFAC]"
                : "bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors duration-500 dark:border-0 text-[#86EFAC]"
            } ${
              isSwitchingMode ? "opacity-50 cursor-not-allowed" : ""
            } flex cursor-pointer items-center gap-[3px] font-Alexandria bg-[#152D2D] px-2 py-1 2xl:px-4 text-[16px] 2xl:py-3 rounded-b-[12px]`}
          >
            <span className="w-[px]">
              {sortMode === "hot" ? <HotActive /> : <HotSvg />}
            </span>
            Top
          </button>

          <button
            onClick={() => handleSortChange("random")}
            disabled={isSwitchingMode}
            className={`${
              sortMode === "random"
                ? "bg-[#004E1F1A] border border-[#86EFAC] text-[#86EFAC]"
                : "bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors duration-500 dark:border-0 text-[#86EFAC] "
            } ${
              isSwitchingMode ? "opacity-50 cursor-not-allowed" : ""
            } flex cursor-pointer items-center gap-1.5 font-Alexandria bg-[#152D2D] px-2 py-1 2xl:px-4 2xl:py-3 text-[16px] rounded-b-[12px]`}
          >
            <span className="w-[px]">
              {sortMode === "random" ? <RandomActive /> : <RandomSvg />}
            </span>
            Random
          </button>

          <button
            onClick={() => handleSortChange("latest")}
            disabled={isSwitchingMode}
            className={`${
              sortMode === "latest"
                ? "bg-[#004E1F1A] border border-[#86EFAC] text-[#86EFAC]"
                : "bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors duration-500 dark:border-0 text-[#86EFAC]"
            } ${
              isSwitchingMode ? "opacity-50 cursor-not-allowed" : ""
            } flex cursor-pointer items-center text-[16px] font-Alexandria bg-[#152D2D] px-2 py-1 gap-1.5 2xl:px-4 2xl:py-3 rounded-b-[12px]`}
          >
            <span className="w-[px]">
              {sortMode === "latest" ? <LatestActive /> : <LatestSvg />}
            </span>
            Fresh
          </button>
        </div>
      </div>

      <div className="block lg:hidden px-4">
        <SearchDropdown
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchBy={setSearchBy}
          exactMatch={exactMatch}
          setExactMatch={setExactMatch}
          searchBy={searchBy}
          showFilterButtons={true}
        />
        <div className="flex lg:hidden text-[18px] justify-center pl-6 space-x-3 text-[#] pointer-events-auto">
          <button
            onClick={() => handleSortChange("hot")}
            disabled={isSwitchingMode}
            className={`${
              sortMode === "hot"
                ? "bg-[#004E1F1A] border border-[#86EFAC] text-[#86EFAC]"
                : "bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors duration-500 dark:border-0 text-[#86EFAC]"
            } ${
              isSwitchingMode ? "opacity-50 cursor-not-allowed" : ""
            } flex cursor-pointer items-center gap-[3px] font-Alexandria bg-[#152D2D] px-2 py-1 2xl:px-4 text-[16px] 2xl:py-3 rounded-b-[12px]`}
          >
            <span className="w-[px]">
              {sortMode === "hot" ? <HotActive /> : <HotSvg />}
            </span>
            Top
          </button>

          <button
            onClick={() => handleSortChange("random")}
            disabled={isSwitchingMode}
            className={`${
              sortMode === "random"
                ? "bg-[#004E1F1A] border border-[#86EFAC] text-[#86EFAC]"
                : "bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors duration-500 dark:border-0 text-[#86EFAC] "
            } ${
              isSwitchingMode ? "opacity-50 cursor-not-allowed" : ""
            } flex cursor-pointer items-center gap-1.5 font-Alexandria bg-[#152D2D] px-2 py-1 2xl:px-4 2xl:py-3 text-[16px] rounded-b-[12px]`}
          >
            <span className="w-[px]">
              {sortMode === "random" ? <RandomActive /> : <RandomSvg />}
            </span>
            Random
          </button>

          <button
            onClick={() => handleSortChange("latest")}
            disabled={isSwitchingMode}
            className={`${
              sortMode === "latest"
                ? "bg-[#004E1F1A] border border-[#86EFAC] text-[#86EFAC]"
                : "bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors duration-500 dark:border-0 text-[#86EFAC]"
            } ${
              isSwitchingMode ? "opacity-50 cursor-not-allowed" : ""
            } flex cursor-pointer items-center text-[16px] font-Alexandria bg-[#152D2D] px-2 py-1 gap-1.5 2xl:px-4 2xl:py-3 rounded-b-[12px]`}
          >
            <span className="w-[px]">
              {sortMode === "latest" ? <LatestActive /> : <LatestSvg />}
            </span>
            Fresh
          </button>
        </div>
      </div>

      <div className="lg:hidden ">
        <>
          <hr className="border-t border-[#474A57] my-1 w-full mx-auto" />

          <div
            className={`py-2 px-8 gap-6 flex ${
              !currentUser || (currentUser?.username && address)
                ? "justify-center"
                : "justify-between items-center"
            }`}
          >
            {currentUser?.username && !address && (
              <div className="text-[16px] flex items-center gap-1 font-bold text-[#C3C8CC]">
                <div className="w-6 h-6 flex-shrink-0">
                  <MemeUserIcon/>
                </div>
                {currentUser.username}
              </div>
            )}

            <Link 
            href="/Post/Mobile"
            className="bg-[#86EFAC] hover:bg-opacity-80 hover:dark:bg-opacity-90 font-medium text-base flex items-center gap-1 text-black px-12 py-2 rounded-full"
            >
              <UploadIcon />
              Post
            </Link>
            
          </div>

          <hr className="border-t border-[#474A57] my-1 w-full mx-auto" />
        </>
      </div>

      <StickyHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setActiveSuggestion={setActiveSuggestion}
        setSearchBy={setSearchBy}
        searchBy={searchBy}
        exactMatch={exactMatch} 
        setExactMatch={setExactMatch} 
        activeSort={activeSort}
        activeSuggestion={activeSuggestion}
      />

      {isSwitchingMode && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-lg">
            Switching to {sortMode} view...
          </p>
        </div>
      )}

      {!isSwitchingMode && !isInitialSearch && memesToDisplay.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12 gap-12 pt-8">
          {memesToDisplay.map((meme, index) => {
            if (!isSearchActive && "isWeekSeparator" in meme) {
              return (
                <div
                  key={meme.id}
                  className="col-span-full my-6 flex items-center"
                >
                  <div className="h-px bg-gray-600 flex-grow" />
                  <div className="px-4 text-[#86EFAC] text-sm font-medium">
                    {getWeekLabel(meme.weekDiff)}
                  </div>
                  <div className="h-px bg-gray-600 flex-grow" />
                </div>
              );
            }

            if (isSearchActive && "isWeekSeparator" in meme) {
              return null;
            }

            const regularMeme = meme as Meme;
            return (
              <div
                className=""
                key={`${regularMeme.memeId || regularMeme.id}-${index}`}
                data-meme-id={regularMeme.id}
                ref={(el) => {
                  if (el && shouldUseRealtime) {
                    observe(el, regularMeme.id);
                  }
                }}
              >
                <MemeCard
                  meme={regularMeme}
                  currentUser={currentUser}
                  onShowSignInForm={handleShowSignInForm}
                  setSearchQuery={setSearchQuery}
                  onMemeDeleted={handleMemeDeleted}
                  setSearchBy={(value: string) =>
                    setSearchBy(value as SearchBy)
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {(((isLoading || isInitialSearch) && !isSwitchingMode) ||
        isFetchingNextPage ||
        (isSearchActive && searchData && isSearching)) && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!displayHasMore && memesToDisplay.length > 0 && !isSwitchingMode && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">You've reached the end!</div>
          <div className="text-sm text-gray-500">
            {isSearchActive
              ? `All search results shown`
              : sortMode === "hot"
              ? `All hot memes shown`
              : sortMode === "random"
              ? `${displayCount} random memes`
              : `Loaded all ${displayTotal} memes`}
          </div>
        </div>
      )}


      {memesToDisplay.length === 0 &&
        !isLoading &&
        !isSwitchingMode &&
        !isSearching &&
        !isInitialSearch && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl flex justify-center mb-4">
              {isSearchActive ? <SearchIcon /> : "🫥"}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isSearchActive ? "No search results" : "No memes found"}
            </h3>
            <p className="text-gray-500">
              {isSearchActive
                ? `No memes found for "${searchQuery}".`
                : "Be the first to upload a meme!"}
            </p>
          </div>
        )}
     
      <BackToTopButton />
    </div>
  );
}
