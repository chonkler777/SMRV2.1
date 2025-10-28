export default function Loading() {
    return (
      <div className="min-h-screen bg-lightbg dark:bg-darkbg">
        <div className="pt-24 px-4 lg:px-12 flex flex-col items-center">
          {/* Main meme card */}
          <div className="w-full max-w-sm xl:max-w-md mx-auto my-6 xl:my-8 space-y-3 xl:space-y-4">
            <div className="relative w-full h-[240px] xl:h-[280px] 2xl:h-[320px] bg-gradient-to-br from-[#1e3a4a] to-[#15242e] rounded-[19px] overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
  
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 xl:gap-3">
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                <div className="space-y-1.5 xl:space-y-2">
                  <div className="w-20 xl:w-24 h-3 xl:h-3.5 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
                  <div className="w-14 xl:w-16 h-2 xl:h-2.5 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="w-12 xl:w-14 h-3 xl:h-3.5 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
            </div>
          </div>
  
          {/* Divider */}
          <hr className="w-full border-t border-gray-600 my-8" />
  
          {/* Related memes section */}
          <div className="w-full max-w-6xl mt-12 px-4">
            <div className="h-6 w-48 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full mb-6 mx-auto animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-none basis-[clamp(240px,40vw,360px)] space-y-3"
                >
                  <div className="relative h-[240px] 2xl:h-[300px] bg-gradient-to-br from-[#1e3a4a] to-[#15242e] rounded-[19px] overflow-hidden">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  </div>
  
                  {/* User info on left, small display on right */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                      <div className="w-20 h-3 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
                    </div>
                    <div className="w-14 h-3 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }