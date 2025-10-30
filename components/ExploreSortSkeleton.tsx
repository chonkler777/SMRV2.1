"use client";

import { motion } from "framer-motion";

interface ExploreSortSkeletonProps {
  isShuffling?: boolean;
}

export default function ExploreSortSkeleton({ isShuffling = false }: ExploreSortSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12 gap-12 pt-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            isShuffling
              ? { scale: [1, 0.7, 1], rotate: [0, -5, 5, 0] }
              : {}
          }
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            repeat: 0, // ✅ Changed from Infinity to 0 (play once)
          }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="space-y-3">
            <div className="relative w-full h-[320px] sm:h-[280px] md:h-[256px] bg-gradient-to-br from-[#1e3a4a] to-[#15242e] rounded-[19px] overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                <div className="w-20 h-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
              </div>
              <div className="w-12 h-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}



















// export default function ExploreSortSkeleton() {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12 gap-12 pt-8">
//         {Array.from({ length: 12 }).map((_, i) => (
//           <div key={i} className="w-full max-w-sm mx-auto">
//             <div className="space-y-3">
//               <div className="relative w-full h-[320px] sm:h-[280px] md:h-[256px] bg-gradient-to-br from-[#1e3a4a] to-[#15242e] rounded-[19px] overflow-hidden">
//                 <div className="absolute inset-0 -translate-x-full animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
//               </div>
              
//               <div className="flex items-center justify-between px-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
//                   <div className="w-20 h-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
//                 </div>
//                 <div className="w-12 h-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }