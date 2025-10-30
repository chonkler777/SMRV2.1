"use client";

import React, { useState, useEffect, useRef } from "react";
import FrontArrow from "@/public/assets/icons/FrontArrow";
import type { SearchBy } from "@/Types";

interface SearchSuggestionsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredMemes?: any[];
  activeSuggestion: string | null;
  setActiveSuggestion: (suggestion: string | null) => void;
  activeSort: string;
  setExactMatch: (exactMatch: boolean) => void;
  setSearchBy: (searchBy: SearchBy) => void;  // ✅ Change from string to SearchBy
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  searchQuery,
  setSearchQuery,
  filteredMemes = [],
  activeSuggestion,
  setActiveSuggestion,
  activeSort,
  setExactMatch,
  setSearchBy,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [is2XL, setIs2XL] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isManualPageChange = useRef(false); 

  const hardcodedSuggestions = [
    "SHILL",
    "SHILLED",
    "Proof of meme",
    "chonkler.com",
    "GM",
    "FAQ",
    "CHUNK",
    "Goombler",
    "Trading",
    "Security",
    "Tools",
    "Lore",
    "FED",
    "SMR",
    "Elon",
    "Trump",
    "Kim",
  ];

  const allSuggestions = hardcodedSuggestions;

  const ITEMS_PER_PAGE = is2XL ? 6 : 4;
  const totalPages = Math.ceil(allSuggestions.length / ITEMS_PER_PAGE);

  const currentSuggestions = isMobile
    ? allSuggestions
    : allSuggestions.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
      );

  useEffect(() => {
    setCurrentPage(0);
  }, [is2XL, isMobile]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIs2XL(window.innerWidth >= 1536);
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [is2XL]);

  const handleClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveSuggestion(suggestion);
    setSearchBy("all" as SearchBy);  // ✅ Cast to SearchBy type
    setExactMatch(true);
  };

  const goToNextPage = () => {
    isManualPageChange.current = true; 
    const currentActive = activeSuggestion;
    setCurrentPage((prev) => (prev + 1) % totalPages);

    if (currentActive) {
      setActiveSuggestion(currentActive);
    }
  };

  useEffect(() => {
    if (!searchQuery || activeSort !== "search") {
      setActiveSuggestion(null);
    }
  }, [searchQuery, activeSort, setActiveSuggestion]);

  useEffect(() => {
    if (!activeSuggestion && !isManualPageChange.current) {
      setCurrentPage(0);
    }

    isManualPageChange.current = false;
  }, [searchQuery, filteredMemes, activeSuggestion]);

  return (
    <div className="w-full transition-colors duration-500" ref={containerRef}>
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-4 2xl:gap-5 2xl:mr-[32px] overflow-x-auto custom-scrollbar whitespace-nowrap no-scrollbar">
          {currentSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleClick(suggestion)}
              className={`px-4 py-1.5 2xl:px-6 2xl:py-2 cursor-pointer font-alexandria rounded-full lg:rounded-none lg:rounded-b-[12px] text-[12px] transition duration-300 ${
                activeSuggestion === suggestion
                  ? "bg-[#152D2D] border border-[#86EFAC] lg:border-x lg:border-b lg:border-b-[#86EFAC] lg:border-x-[#86EFAC] text-white"
                  : "border-[#C1C9C9] border-0 hover:bg-[#1D3C3C] hover:text-[#ffffff] transition duration-300 bg-[#152D2D] text-[#C3C8CC]"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {!isMobile && totalPages > 1 && (
          <div className="absolute left-1/2 cursor-pointer transform translate-x-[245px] 2xl:translate-x-[338px] mt-[6px] z-10">
            <button
              onClick={goToNextPage}
              className="p-1 cursor-pointer  hover:bg-[#E5E7EB1A] rounded-full"
              aria-label="Next suggestions"
            >
              <FrontArrow />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;
















// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import FrontArrow from "@/public/assets/icons/FrontArrow";
// import type { SearchBy } from "@/Types";

// interface SearchSuggestionsProps {
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   filteredMemes?: any[];
//   activeSuggestion: string | null;
//   setActiveSuggestion: (suggestion: string | null) => void;
//   activeSort: string;
//   setExactMatch: (exactMatch: boolean) => void;  // ✅ Add this
//   setSearchBy: (searchBy: string) => void;  // ✅ Add this
// }

// const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
//   searchQuery,
//   setSearchQuery,
//   filteredMemes = [],
//   activeSuggestion,
//   setActiveSuggestion,
//   activeSort,
//   setExactMatch,  // ✅ Add this
//   setSearchBy,  // ✅
// }) => {
//   const [currentPage, setCurrentPage] = useState(0);
//   const [is2XL, setIs2XL] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const isManualPageChange = useRef(false); 

//   const hardcodedSuggestions = [
//     "SHILL",
//     "SHILLED",
//     "Proof of meme",
//     "chonkler.com",
//     "GM",
//     "FAQ",
//     "CHUNK",
//     "Goombler",
//     "Trading",
//     "Security",
//     "Tools",
//     "Lore",
//     "FED",
//     "SMR",
//     "Elon",
//     "Trump",
//     "Kim",
//   ];

//   const allSuggestions = hardcodedSuggestions;

//   const ITEMS_PER_PAGE = is2XL ? 5 : 4;
//   const totalPages = Math.ceil(allSuggestions.length / ITEMS_PER_PAGE);

//   const currentSuggestions = isMobile
//     ? allSuggestions
//     : allSuggestions.slice(
//         currentPage * ITEMS_PER_PAGE,
//         (currentPage + 1) * ITEMS_PER_PAGE
//       );

//   useEffect(() => {
//     setCurrentPage(0);
//   }, [is2XL, isMobile]);

//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIs2XL(window.innerWidth >= 1536);
//       setIsMobile(window.innerWidth < 1024);
//     };

//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);

//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   useEffect(() => {
//     setCurrentPage(0);
//   }, [is2XL]);

//   const handleClick = (suggestion: string) => {
//     setSearchQuery(suggestion);
//     setActiveSuggestion(suggestion);
//     setSearchBy("all");  // ✅ Set to "all"
//     setExactMatch(true);  // ✅ Enable exact match
//   };

//   const goToNextPage = () => {
//     isManualPageChange.current = true; 
//     const currentActive = activeSuggestion;
//     setCurrentPage((prev) => (prev + 1) % totalPages);

//     if (currentActive) {
//       setActiveSuggestion(currentActive);
//     }
//   };


//   useEffect(() => {
//     if (!searchQuery || activeSort !== "search") {
//       setActiveSuggestion(null);
//     }
//   }, [searchQuery, activeSort, setActiveSuggestion]);


//   useEffect(() => {
//     if (!activeSuggestion && !isManualPageChange.current) {
//       setCurrentPage(0);
//     }

//     isManualPageChange.current = false;
//   }, [searchQuery, filteredMemes, activeSuggestion]);


//   return (
//     <div className="w-full transition-colors duration-500" ref={containerRef}>
//       <div className="flex items-center justify-center gap-2">
//         <div className="flex gap-4 2xl:gap-5 2xl:mr-[32px] overflow-x-auto custom-scrollbar whitespace-nowrap no-scrollbar">
//           {currentSuggestions.map((suggestion, index) => (
//             <button
//               key={index}
//               onClick={() => handleClick(suggestion)}
//               className={`px-4 py-1.5 2xl:px-6 2xl:py-2 cursor-pointer rounded-full lg:rounded-none lg:rounded-b-[12px] text-[15px] transition duration-300 ${
//                 activeSuggestion === suggestion
//                   ? "bg-[#152D2D] border border-[#86EFAC] lg:border-x lg:border-b lg:border-b-[#86EFAC] lg:border-x-[#86EFAC] text-white"
//                   : "border-[#C1C9C9] border-0 hover:bg-[#1D3C3C] hover:text-[#ffffff] transition duration-300 bg-[#152D2D] text-[#C3C8CC]"
//               }`}
//             >
//               {suggestion}
//             </button>
//           ))}
//         </div>

//         {!isMobile && totalPages > 1 && (
//           <div className="absolute left-1/2 cursor-pointer transform translate-x-[245px] 2xl:translate-x-[338px] mt-[6px] z-10">
//             <button
//               onClick={goToNextPage}
//               className="p-1 cursor-pointer  hover:bg-[#E5E7EB1A] rounded-full"
//               aria-label="Next suggestions"
//             >
//               <FrontArrow />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchSuggestions;



