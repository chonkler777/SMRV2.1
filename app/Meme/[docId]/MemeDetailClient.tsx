"use client";

import React, { useEffect, useState, useRef } from "react";
import MemeCard from "@/app/global-components/MemeCard";
import { fetchRandomMemes } from "@/lib/meme-sorting-actions";
import { useAuth } from "@/AuthContext/AuthProvider";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import MemeArrowLeft from "@/public/assets/icons/MemeArrowLeft";
import MemeArrowRight from "@/public/assets/icons/MemeArrowRight";
import { X } from "lucide-react";

interface MemeData {
  id: string;
  docId: string;
  userId: string;
  imageUrl: string;
  username: string;
  tag: string;
  wallet: string;
  timestamp: any;
  upvotes: number;
  downvotes: number;
  views: number;
  memeId: string;
  fileType: string;
  blurDataURL: string;
  thumbnailUrl: string;
}

interface MemeDetailClientProps {
  docId: string;
  initialMemeData: MemeData | null;
  isModal?: boolean;
  onClose?: () => void;
}

export default function MemeDetailClient({
  docId,
  initialMemeData,
  isModal = false,
  onClose,
}: MemeDetailClientProps) {
  const [memeData, setMemeData] = useState<MemeData | null>(initialMemeData);
  const [isLoading, setIsLoading] = useState(!initialMemeData);
  const [error, setError] = useState<string | null>(null);
  const [randomMemes, setRandomMemes] = useState<MemeData[]>([]);
  const { currentUser, authLoading } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const mainMemeVoteUpdates = useRealtimeVotes([docId]);

  const carouselMemeIds = randomMemes.map((meme) => meme.id);
  const carouselVoteUpdates = useRealtimeVotes(carouselMemeIds);

  const handleShowSignInForm = () => {};

  const handleSetSearchQuery = (query: string) => {};

  const handleSetSearchBy = (searchBy: string) => {};

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const memeCard = container.querySelector("div > div") as HTMLElement;
    const scrollAmount = memeCard ? memeCard.offsetWidth + 16 : 300;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (randomMemes.length === 0) return;
    if (hasCenteredRef.current) return; 

    const container = scrollRef.current;

    const center = () => {
      if (container.scrollWidth <= container.clientWidth) return; 
      container.scrollLeft =
        (container.scrollWidth - container.clientWidth) / 2;
      hasCenteredRef.current = true; 
    };

    
    let frames = 0;
    let raf = 0;
    const tick = () => {
      frames++;
      center();
      if (frames < 3) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [randomMemes.length]); 

  useEffect(() => {
    const loadRandomMemes = async () => {
      try {
        const { memes } = await fetchRandomMemes(undefined, 12);

        const filtered = memes
          .filter((meme) => meme.id !== docId)
          .map(
            (meme) =>
              ({
                ...meme,
                docId: meme.id,
                userId: meme.userId || meme.id || "",
                blurDataURL: meme.blurDataURL || "",
                thumbnailUrl: meme.thumbnailUrl || "",
              } as MemeData)
          );

        setRandomMemes(filtered);
      } catch (error) {
        console.error("Error fetching random memes:", error);
      }
    };

    if (docId) {
      loadRandomMemes();
    }
  }, [docId]);

  useEffect(() => {
    if (!memeData || mainMemeVoteUpdates.size === 0) return;

    const update = mainMemeVoteUpdates.get(docId);
    if (update && update.upvotes !== memeData.upvotes) {
      setMemeData((prev) =>
        prev ? { ...prev, upvotes: update.upvotes } : null
      );
    }
  }, [mainMemeVoteUpdates, docId, memeData]);

  useEffect(() => {
    if (carouselVoteUpdates.size === 0) return;

    setRandomMemes((prevMemes) =>
      prevMemes.map((meme) => {
        const update = carouselVoteUpdates.get(meme.id);
        if (update && update.upvotes !== meme.upvotes) {
          return { ...meme, upvotes: update.upvotes };
        }
        return meme;
      })
    );
  }, [carouselVoteUpdates]);


  if (error) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }


  if (!memeData) {
    return null;
  }

  return (
    <div className="relative px-[2%] min-h-screen bg-lightbg dark:bg-darkbg md:px-[0%] flex flex-col items-center py-24">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full cursor-pointer bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-[#C3C8CC]" />
        </button>
      )}
      <div className="w-full max-w-md mx-auto my-2 lg:my-8">
        <MemeCard
          meme={memeData}
          currentUser={currentUser}
          onShowSignInForm={handleShowSignInForm}
          setSearchQuery={handleSetSearchQuery}
          setSearchBy={handleSetSearchBy}
        />
      </div>

      <hr className="w-full border-t border-gray-600 " />

      {randomMemes.length > 0 && (
        <div className="w-full mt-12 max-w-6xl px-4">
          <h2 className="text-[24px] font-bold mb-6 text-center text-[#199145] dark:text-green-300">
            Discover More
          </h2>

          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4">
            <div className="flex justify-center gap-4 lg:hidden">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full "
              >
                <MemeArrowLeft />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full shadow cursor-pointer"
              >
                <MemeArrowRight />
              </button>
            </div>

            <div className="hidden lg:flex items-center">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full shadow cursor-pointer"
              >
                <MemeArrowLeft />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="overflow-x-auto scroll-smooth flex gap-4 w-full scrollbar-hide "
            >
              {randomMemes.map((meme) => (
                <div
                  key={meme.id}
                  className="flex-none snap-start basis-[clamp(280px,40vw,300px)]"
                >
                  <div className="min-w-0 overflow-hidden rounded-lg">
                    {" "}
                    <MemeCard
                      meme={meme}
                      currentUser={currentUser}
                      onShowSignInForm={handleShowSignInForm}
                      setSearchQuery={handleSetSearchQuery}
                      setSearchBy={handleSetSearchBy}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center">
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full dark:bg-gray-700 shadow cursor-pointer"
              >
                <MemeArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
