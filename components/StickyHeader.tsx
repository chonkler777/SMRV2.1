"use client";

import React, { useState, useEffect } from 'react';
import SearchDropdown from './SearchEvents/SearchDropdown';
import SearchSuggestions from './SearchEvents/SearchSuggestions';
// import type { SearchBy } from '@/lib/search-actions';
import type { SearchBy } from "@/Types";

interface StickyHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveSuggestion: (suggestion: string | null) => void;
  setSearchBy: (searchBy: SearchBy) => void;
  exactMatch: boolean;  
  setExactMatch: (exactMatch: boolean) => void;  
  searchBy: SearchBy;
  activeSort: string;
  activeSuggestion: string | null;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  setActiveSuggestion,
  setSearchBy,
  exactMatch,  
  setExactMatch,  
  searchBy,
  activeSort,
  activeSuggestion,
}) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const stickyOffset = 0;

      if (scrollPosition > stickyOffset) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`sticky hidden lg:block top-[60px] z-30 transition-all duration-150 ${
        isSticky ? 'bg-[#121C26] shadow-md pb-8' : ''
      }`}
    >
      <div
        className={`flex px-6 flex-col items-center md:flex-row justify-between md:flex-center ${
          isSticky ? 'text-white' : ''
        }`}
      >
        <SearchDropdown
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchBy={setSearchBy}
          exactMatch={exactMatch}  
          setExactMatch={setExactMatch}  
          searchBy={searchBy}
          isSticky={isSticky}
          showFilterButtons={true}
        />
      </div>

      <div className="px-6">
        <div className="">
          {!searchQuery && (
            <SearchSuggestions
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeSuggestion={activeSuggestion}
              setActiveSuggestion={setActiveSuggestion}
              activeSort={activeSort}
              setExactMatch={setExactMatch}  // ✅ Add this
              setSearchBy={setSearchBy}      // ✅ Add this
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyHeader;