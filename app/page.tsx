import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchMemesServerSide } from '@/lib/meme-server-actions';
import ExploreMemeGrid from './ExploreClient/ExploreClient';



async function ExploreScrollWrapper() {
  try {
    
    const { memes, hasMore, total, nextCursor } = await fetchMemesServerSide(undefined, 12);
    
    
    if (!memes || memes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🫥</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-400">No memes found</h3>
          <p className="text-gray-500">Be the first to upload a meme!</p>
        </div>
      );
    }
    
    return (
      <ExploreMemeGrid 
        initialMemes={memes}
        initialHasMore={hasMore}
        initialTotal={total}
        initialNextCursor={nextCursor}
      />
    );
  } catch (error) {
    console.error('❌ Error fetching initial memes:', error);
    
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-400">Failed to load memes</h3>
        <p className="text-gray-500 mb-4">Something went wrong. Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
}


function MemeGridSkeleton() {
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


export default function MemesPage() {
  return (
    <div className="mx-auto py-8">
      <Suspense fallback={<MemeGridSkeleton />}>
        <ExploreScrollWrapper />
      </Suspense>
    </div>
  );
}


export async function generateMetadata(): Promise<Metadata> {
  try {

    const { memes } = await fetchMemesServerSide(undefined, 1);
    
    if (memes && memes.length > 0) {
      const latestMeme = memes[0];
      
      const imageUrl = latestMeme.fileType === 'video' 
        ? (latestMeme.thumbnailUrl || latestMeme.imageUrl)
        : latestMeme.imageUrl;
      
      return {
        title: 'Strategic Meme Reserve',
        description: 'Browse collection of memes and Post Memes',
        openGraph: {
          title: 'Strategic Meme Reserve',
          description: 'Browse collection of memes and Post Memes',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: latestMeme.tag || 'Latest meme',
            },
          ],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Strategic Meme Reserve',
          description: 'Browse collection of memes and Post Memes',
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  

  return {
    title: 'Strategic Meme Reserve',
    description: 'Browse collection of memes and Post Memes',
  };
}

export const revalidate = 300;



