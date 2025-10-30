'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getSearchSuggestions, type SearchBy } from '@/lib/search-actions';
import SearchFilterButtons from './SearchFilterButtons';

interface SearchDropdownProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchBy: (searchBy: SearchBy) => void;
  searchBy: SearchBy;
  className?: string;
  isSticky?: boolean;
  exactMatch: boolean;
  setExactMatch: (exactMatch: boolean) => void;
  showFilterButtons?: boolean;
  filterButtonsProps?: {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact' | 'pills';
    showWallet?: boolean;
    className?: string;
  };
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchQuery,
  setSearchQuery,
  setSearchBy,
  searchBy,
  exactMatch,
  setExactMatch,
  className = '',
  isSticky = false,
  showFilterButtons = true,
  filterButtonsProps = {}
}) => {
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [placeholder, setPlaceholder] = useState('Search by username, tag or wallet address');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const hardcodedSuggestions = [
    "SHILL", "SHILLED", "chonkler.com", "CHUNK", "Goombler", "GM", 
    "FAQ", "Proof of meme", "Trading", "Security", "Tools", "Lore", 
    "FED", "SMR", "Elon", "Trump", "Kim"
  ];

  const filteredSuggestions = searchQuery 
  ? hardcodedSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : hardcodedSuggestions;

  const filteredFallbackSuggestions = useMemo(() => {
    if (!searchQuery) return hardcodedSuggestions;
    return hardcodedSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const shouldShowFilterButtons = useMemo(() => {
    return showFilterButtons && searchQuery.trim().length > 0;
  }, [showFilterButtons, searchQuery]);

  const updatePlaceholder = useCallback(() => {
    const isLargeScreen = window.innerWidth >= 1024;
    setPlaceholder(isLargeScreen 
      ? "Search by username, tag or wallet address"
      : "Search by username, tag or address"
    );
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(target) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(target)
    ) {
      setShowSuggestionsDropdown(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (
      event.key === '/' && 
      !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName || '')
    ) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const serverSuggestions = await getSearchSuggestions(query, 8);
      
      const combined = [
        ...serverSuggestions,
        ...filteredFallbackSuggestions.filter(fs => 
          !serverSuggestions.some(ss => ss.toLowerCase() === fs.toLowerCase())
        )
      ].slice(0, 10);
      
      setSuggestions(combined);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(filteredFallbackSuggestions);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [filteredFallbackSuggestions]);

  useEffect(() => {
    updatePlaceholder();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePlaceholder);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePlaceholder);
    };
  }, [handleKeyDown, handleClickOutside, updatePlaceholder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFocused) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isFocused, fetchSuggestions]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSuggestionsDropdown(false);
    setSearchBy('all');
  }, [setSearchQuery, setSearchBy]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (isFocused) {
      setShowSuggestionsDropdown(true);
    }
  }, [setSearchQuery, isFocused]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestionsDropdown(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => {
      setShowSuggestionsDropdown(false);
    }, 150);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestionsDropdown(false);
    setExactMatch(true);  
    inputRef.current?.blur();
  }, [setSearchQuery]);

  const containerClasses = useMemo(() => `
    relative w-full shadow-[0_5px_10px_rgba(12,18,25,0.7)] 
    flex rounded-full overflow-hidden transition-all duration-200
    ${isFocused
      ? 'border border-[#86EFAC]' 
      : isSticky
        ? 'border border-[#C3C8CC]' 
        : 'border border-[#86EFAC]'
    }
  `.trim().replace(/\s+/g, ' '), [isFocused, isSticky]);

  const inputClasses = useMemo(() => `
    px-3 lg:px-6 py-3 w-full text-[16px] 
    focus:outline-none focus:ring-0 border-0
    transition-all duration-200
    ${isSticky
      ? 'text-[#C3C8CC80] bg-[#121C26] placeholder-[#C3C8CC80]'
      : `placeholder-[#86EFAC] placeholder-[#86EFAC]/80 bg-[#152D2D]/20 
         hover:bg-[#152D2D]/40 
         text-[#86EFAC] placeholder-[#86EFAC]/80`
    }
    ${isFocused 
      ? 'focus:text-[#86EFAC] bg-[#152D2D] focus:placeholder-[#86EFAC]' 
      : ''
    }
  `.trim().replace(/\s+/g, ' '), [isSticky, isFocused]);

  return (
    <div className={`flex justify-center w-full pt-6 ${className}`}>
      <div className={`relative w-full lg:max-w-xl 2xl:max-w-3xl ${shouldShowFilterButtons ? 'space-y-' : ''}`}>
        <div className={containerClasses} ref={dropdownRef}>
          <div className="relative w-full flex items-center">
            {/* Mobile Search Icon */}
            <div className="h-full flex lg:hidden items-center justify-center">
              <button 
                type="button"
                className="h-full pl-4 bg-[#152D2D40] items-center justify-center"
                aria-label="Search"
              >
                <span className="text-[#86EFAC]">
                  {isFocused ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>


            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className={inputClasses}
              aria-label="Search memes"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2  cursor-pointer transform -translate-y-1/2 right-2 lg:right-16 group"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 28 28"
                  fill="currentColor"
                  className="text-[#C3C8CC] group-hover:text-[#86EFAC] transition-colors duration-200"
                >
                  <rect width="28" height="28" fill="none" />
                  <path d="M18.28 9.72a.75.75 0 0 1 0 1.06L15.06 14l3.22 3.22a.75.75 0 1 1-1.06 1.06L14 15.06l-3.22 3.22a.75.75 0 1 1-1.06-1.06L12.94 14l-3.22-3.22a.75.75 0 1 1 1.06-1.06L14 12.94l3.22-3.22a.75.75 0 0 1 1.06 0Z M26 14c0-6.627-5.373-12-12-12S2 7.373 2 14s5.373 12 12 12s12-5.373 12-12ZM3.5 14C3.5 8.201 8.201 3.5 14 3.5S24.5 8.201 24.5 14S19.799 24.5 14 24.5S3.5 19.799 3.5 14Z" />
                </svg>
              </button>
            )}

            {/* Desktop Search Icon */}
            <div className="h-full hidden  cursor-pointer lg:flex items-center justify-center">
              <button 
                type="button"
                className={`h-full px-4 flex cursor-pointer items-center justify-center transition-colors duration-200
                  ${isSticky ? 'bg-[#152D2D40]' : 'bg-[#00000040]'} hover:bg-[#121C26]`}
                aria-label="Search"
              >
                <span className="md:w-[24px] md:h-[24px] text-[#86EFAC] dark:text-[#86EFAC]">
                  {isFocused ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className='hidden lg:block'>
        {shouldShowFilterButtons && (
          <SearchFilterButtons
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            exactMatch={exactMatch}
            setExactMatch={setExactMatch}
            {...filterButtonsProps}
          />
        )}
        </div>


        {showSuggestionsDropdown && filteredSuggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className={`absolute top-full left-0 right-0 mt-1 md:hidden ${
              isSticky 
                ? "bg-[#121C26] border border-[#C3C8CC]" 
                : "bg-[#121C26] border border-[#86EFAC] border-opacity-50"
            } rounded-lg shadow-[0_5px_15px_rgba(12,18,25,0.8)] z-50 max-h-64 overflow-y-auto`}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-opacity-60 transition-colors duration-200 ${
                  isSticky
                    ? "text-[#C3C8CC] hover:bg-[#152D2D] border-b border-[#C3C8CC20]"
                    : "text-[#86EFAC] hover:bg-[#1D3C3C] border-b border-[#86EFAC20]"
                } ${index === filteredSuggestions.length - 1 ? 'border-b-0 rounded-b-lg' : ''} ${index === 0 ? 'rounded-t-lg' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[15px]">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;





