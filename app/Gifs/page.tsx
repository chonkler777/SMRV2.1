// app/gifs/page.tsx
import { Suspense } from 'react';
import GifsClient from "./GifsClient";
import { fetchMemesServerSide } from "@/lib/meme-server-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GIFs - Strategic Meme Reserve",
  description: "Browse our collection of GIFs meme",
};

function GifGridSkeleton() {
  return (
    <div className="min-h-screen py-8 pt-24">
      <div className="mb-6 container mx-auto px-4">
        {/* Empty space for search bar */}
        <div className="h-12" />
      </div>
      
      <div className="mx-3 lg:mx-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12 xl:gap-16 pt-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full max-w-sm mx-auto">
              <div className="space-y-3">
                <div className="relative w-full h-[320px] sm:h-[280px] md:h-[256px] bg-gradient-to-br from-[#1e3a4a] to-[#15242e] rounded-[19px] overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
                
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                    <div className="w-20 h-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
                  </div>
                  <div className="w-12 h-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



async function GifDataWrapper() {
  const { memes, hasMore, total, nextCursor } = await fetchMemesServerSide(
    undefined,
    12,
    ['gif'] 
  );

  return (
    <GifsClient 
      initialMemes={memes}
      initialHasMore={hasMore}
      initialTotal={total}
      initialCursor={nextCursor}
    />
  );
}

export default function GifsPage() {
  return (
    <Suspense fallback={<GifGridSkeleton />}>
      <GifDataWrapper />
    </Suspense>
  );
}

export const revalidate = 300;