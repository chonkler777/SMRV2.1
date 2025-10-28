"use client"

import { useState, useRef } from "react";
import Image from "next/image";
import type { Meme } from "@/Types";

interface TransactionsMediaProps {
  meme: Meme;
}

const TransactionsMedia: React.FC<TransactionsMediaProps> = ({ meme }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = meme.fileType === "video";
  const isImage = meme.fileType === "image" || meme.fileType === "gif";

  const handlePlayVideo = async () => {
    setIsVideoLoading(true);
    setIsVideoPlaying(true);
    setVideoError(false);

    setTimeout(async () => {
      if (videoRef.current) {
        try {
          videoRef.current.currentTime = 0;
          const playPromise = videoRef.current.play();

          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (error) {
          console.error("❌ Video play error:", error);
          setVideoError(true);
        } finally {
          setIsVideoLoading(false);
        }
      }
    }, 100);
  };

  const handleStopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoPlaying(false);
    setVideoError(false);
    setIsVideoLoading(false);
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setIsVideoLoading(false);
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("❌ Video loading error:", e);
    setVideoError(true);
    setIsVideoLoading(false);
  };

  const handleVideoLoadSuccess = () => {
    setVideoError(false);
    setIsVideoLoading(false);
  };

  if (isVideo) {
    return (
      <div className="relative w-full overflow-hidden">
        <div className="relative w-full">
          {!isVideoPlaying ? (
            <>
              <Image
                src={meme.thumbnailUrl || meme.imageUrl}
                alt="Video thumbnail"
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                quality={100}
              />

              <button
                onClick={handlePlayVideo}
                disabled={isVideoLoading}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all duration-300 disabled:cursor-not-allowed"
              >
                <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors">
                  {isVideoLoading ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </button>
            </>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-auto object-cover"
                controls
                preload="metadata"
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onLoadedData={handleVideoLoadSuccess}
                onCanPlay={handleVideoLoadSuccess}
                playsInline
                muted={false}
                src={meme.imageUrl}
              >
                Your browser does not support the video tag.
              </video>

              {/* Close button */}
              <button
                onClick={handleStopVideo}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors z-10"
                title="Back to thumbnail"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white p-4">
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="text-sm mb-3">Video failed to load</div>
                    <button
                      onClick={handlePlayVideo}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="bg-black/60 rounded-full p-4">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="relative shadow-xl">
        <Image
          src={meme.imageUrl}
          alt="Meme"
          width={300}
          height={300}
          className="w-full object-cover shadow-[0_3px_7px_rgba(12,18,25,0.7)] border border-transparent hover:border-[#86EFAC]"
          placeholder={meme.blurDataURL ? "blur" : "empty"}
          blurDataURL={meme.blurDataURL || undefined}
          quality={100}
        />
      </div>
    );
  }

  return null;
};

export default TransactionsMedia;