"use client";

import React from "react";
import type { SearchBy } from "@/lib/search-actions";

interface SearchFilterButtonsProps {
  searchBy: SearchBy;
  setSearchBy: (searchBy: SearchBy) => void;
  exactMatch: boolean;
  setExactMatch: (exactMatch: boolean) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "pills";
  showWallet?: boolean;
}

const SearchFilterButtons: React.FC<SearchFilterButtonsProps> = ({
  searchBy,
  setSearchBy,
  exactMatch,
  setExactMatch,
  className = "",
  size = "md",
  variant = "default",
  showWallet = false,
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const getButtonClasses = (isActive: boolean) => {
    const baseClasses = `font-medium rounded-lg transition-all duration-200 ${sizeClasses[size]}`;

    if (variant === "compact") {
      return `${baseClasses} ${
        isActive
          ? "bg-[#86EFAC] text-[#152D2D] shadow-sm"
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      }`;
    }

    if (variant === "pills") {
      return `${baseClasses} rounded-full ${
        isActive
          ? "bg-[#86EFAC] text-[#152D2D] shadow-md"
          : "bg-[#152D2D] bg-opacity-20 text-[#86EFAC] hover:bg-[#152D2D] hover:bg-opacity-40 border border-[#86EFAC] border-opacity-20"
      }`;
    }

    // Default variant
    return `${baseClasses} ${
      isActive
        ? "bg-[#86EFAC] text-[#152D2D] shadow-md transform scale-105"
        : "bg-[#152D2D] bg-opacity-40 text-[#86EFAC] hover:bg-[#152D2D] hover:bg-opacity-60 hover:scale-105 border border-[#86EFAC] border-opacity-30"
    }`;
  };

  const buttons = [
    { key: "all" as SearchBy, label: "All" },
    { key: "username" as SearchBy, label: "Username" },
    { key: "tag" as SearchBy, label: "Tag" },
    ...(showWallet
      ? [{ key: "wallet" as SearchBy, label: "₿ Wallets", icon: "₿" }]
      : []),
  ];

  return (
    <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-center gap-3 lg:gap-4 2xl:gap-5 px-4 lg:px-0 ${className}`}>
      {/* Filter Buttons */}
      <div className="flex gap-4 2xl:gap-5">
        {buttons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSearchBy(key)}
            className={`px-4 py-1.5 cursor-pointer 2xl:px-6 2xl:py-2 rounded-full lg:rounded-none lg:rounded-b-[12px] text-[15px] transition duration-300 ${
              searchBy === key
                ? "bg-[#152D2D] border border-[#86EFAC] lg:border-x lg:border-b lg:border-b-[#86EFAC] lg:border-x-[#86EFAC] text-white"
                : " border-[#C1C9C9] border-0 bg-[#152D2D] hover:bg-[#152D2D]/70 text-[#C3C8CC]"
            }`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Exact Match Checkbox - New row on mobile, same row on desktop */}
      <div className="flex items-center gap-2 lg:ml-4 whitespace-nowrap">
        <label className="flex items-center gap-2 cursor-pointer text-[15px] text-[#C3C8CC]">
          <input
            type="checkbox"
            checked={exactMatch}
            onChange={(e) => setExactMatch(e.target.checked)}
            style={{
              accentColor: '#86EFAC',
              colorScheme: 'light'
            }}
            className="w-4 h-4 text-[#86EFAC] cursor-pointer bg-transparent border-[#86EFAC] rounded focus:ring-[#86EFAC] checked:bg-[#86EFAC] checked:border-[#86EFAC]"
          />
          <span>Exact Match</span>
        </label>
      </div>
    </div>
  );
};

export default SearchFilterButtons;

















// "use client";

// import React from "react";
// import type { SearchBy } from "@/lib/search-actions";

// interface SearchFilterButtonsProps {
//   searchBy: SearchBy;
//   setSearchBy: (searchBy: SearchBy) => void;
//   className?: string;
//   size?: "sm" | "md" | "lg";
//   variant?: "default" | "compact" | "pills";
//   showWallet?: boolean;
// }

// const SearchFilterButtons: React.FC<SearchFilterButtonsProps> = ({
//   searchBy,
//   setSearchBy,
//   className = "",
//   size = "md",
//   variant = "default",
//   showWallet = false,
// }) => {
//   const sizeClasses = {
//     sm: "px-2 py-1 text-xs",
//     md: "px-4 py-2 text-sm",
//     lg: "px-6 py-3 text-base",
//   };

//   const getButtonClasses = (isActive: boolean) => {
//     const baseClasses = `font-medium rounded-lg transition-all duration-200 ${sizeClasses[size]}`;

//     if (variant === "compact") {
//       return `${baseClasses} ${
//         isActive
//           ? "bg-[#86EFAC] text-[#152D2D] shadow-sm"
//           : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
//       }`;
//     }

//     if (variant === "pills") {
//       return `${baseClasses} rounded-full ${
//         isActive
//           ? "bg-[#86EFAC] text-[#152D2D] shadow-md"
//           : "bg-[#152D2D] bg-opacity-20 text-[#86EFAC] hover:bg-[#152D2D] hover:bg-opacity-40 border border-[#86EFAC] border-opacity-20"
//       }`;
//     }

//     // Default variant
//     return `${baseClasses} ${
//       isActive
//         ? "bg-[#86EFAC] text-[#152D2D] shadow-md transform scale-105"
//         : "bg-[#152D2D] bg-opacity-40 text-[#86EFAC] hover:bg-[#152D2D] hover:bg-opacity-60 hover:scale-105 border border-[#86EFAC] border-opacity-30"
//     }`;
//   };

//   const buttons = [
//     { key: "all" as SearchBy, label: "All" },
//     { key: "username" as SearchBy, label: "Username" },
//     { key: "tag" as SearchBy, label: "Tag" },
//     ...(showWallet
//       ? [{ key: "wallet" as SearchBy, label: "₿ Wallets", icon: "₿" }]
//       : []),
//   ];

//   return (
//     <div className={`flex justify-center gap-4 2xl:gap-5 ${className}`}>
//       {buttons.map(({ key, label }) => (
//         <button
//           key={key}
//           onClick={() => setSearchBy(key)}
//           className={`px-4 py-1.5 cursor-pointer 2xl:px-6 2xl:py-2 rounded-full lg:rounded-none lg:rounded-b-[12px] text-[15px] transition duration-300 ${
//             searchBy === key
//               ? "bg-[#152D2D] border-x border-b border-b-[#86EFAC] border-x-[#86EFAC] text-white"
//               : " border-[#C1C9C9] border-0 bg-[#152D2D] hover:bg-[#152D2D]/70 text-[#C3C8CC]"
//           }`}
//           type="button"
//         >
//           {label}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default SearchFilterButtons;
