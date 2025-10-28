"use client";

import { useState, useRef } from "react";
import type { Meme } from "@/Types";
import Image from "next/image";
import ServerSideCopyButton  from "./CopyMeme";
import IconsDropdown from "./MemeIconsDrop";
import { Squircle } from "corner-smoothing";
import ModalDismiss from "@/public/assets/icons/ModalDismiss";



const MemeMedia = ({ meme, index = 0 }: { meme: Meme; index?: number }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = meme.fileType === "video";
  const [isModalVideoPlaying, setIsModalVideoPlaying] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isModalVideoReady, setIsModalVideoReady] = useState(false);

  const shouldPrioritize = index < 4;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    if (isModalVideoPlaying && modalVideoRef.current) {
      const time = modalVideoRef.current.currentTime;
      setCurrentVideoTime(time);
      
      setIsModalVideoPlaying(false);
      setIsModalVideoReady(false);
      setIsModalOpen(false);
      setIsVideoPlaying(true);
      setIsVideoReady(false);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          videoRef.current.play().catch(error => {
            console.error("Error resuming video:", error);
          });
        }
      }, 100);
    } else {
      setIsModalOpen(false);
      setIsModalVideoReady(false);
    }
  };
  


  const handlePlayVideo = async () => {
    setIsVideoLoading(true);
    
    const targetVideoRef = isModalOpen ? modalVideoRef : videoRef;
    const setPlaying = isModalOpen ? setIsModalVideoPlaying : setIsVideoPlaying;
    
    setPlaying(true);
    setVideoError(false);
  
    setTimeout(() => {
      if (targetVideoRef.current) {
        if (currentVideoTime > 0) {
          targetVideoRef.current.currentTime = currentVideoTime;
        } else {
          targetVideoRef.current.currentTime = 0;
        }
        targetVideoRef.current.load();
      }
    }, 100);
  };

  const handleStopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoPlaying(false);
    setIsVideoReady(false);
    setVideoError(false);
    setIsVideoLoading(false);
    setCurrentVideoTime(0);
  };

  const handleVideoEnded = () => {
    if (isModalOpen) {
      setIsModalVideoPlaying(false);
      setIsModalVideoReady(false);
    } else {
      setIsVideoPlaying(false);
      setIsVideoReady(false);
    }
    setIsVideoLoading(false);
    setCurrentVideoTime(0);
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("❌ Video loading error:", e);
    setVideoError(true);
    setIsVideoLoading(false);
    setIsVideoReady(false);
    setIsModalVideoReady(false);
  };

  const handleVideoLoadSuccess = () => {
    setVideoError(false);
    setIsVideoLoading(false);
  };

  const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    
    if (isModalOpen) {
      setIsModalVideoReady(true);
    } else {
      setIsVideoReady(true);
    }
    
    setIsVideoLoading(false);
    
    video.play().catch(error => {
      console.error("Error playing video:", error);
      setVideoError(true);
    });
  };


  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    setCurrentVideoTime(video.currentTime);
  };

  if (isVideo) {
    return (
      <>
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center"
            onClick={closeModal}
          >
            <div
              className="relative flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-w-[90vw] max-h-[90vh]">
                {(!isModalVideoPlaying || !isModalVideoReady) && (
                  <>
                    <Image
                      src={meme.thumbnailUrl || meme.imageUrl}
                      alt={meme.title || "Video thumbnail"}
                      width={1200}
                      height={1200}
                      sizes="90vw"
                      className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain min-w-[300px] min-h-[300px] md:min-w-[350px] md:min-h-[350px] lg:min-w-[400px] lg:min-h-[400px] 2xl:min-w-[600px] 2xl:min-h-[600px]"
                      placeholder={meme.blurDataURL ? "blur" : "empty"}
                      blurDataURL={meme.blurDataURL || undefined}
                      quality={100}
                      priority
                    />

                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        onClick={handlePlayVideo}
                        disabled={isVideoLoading}
                        className="pointer-events-auto bg-black/60 rounded-full p-6 hover:bg-black/80 transition-colors disabled:cursor-not-allowed"
                      >
                        {isVideoLoading ? (
                          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-12 h-12 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {isModalVideoPlaying && (
                  // <DefaultPlayer/>
                  
                  
                  
                  <video
                    ref={modalVideoRef}
                    className={`max-w-[90vw] max-h-[90vh] w-auto h-auto transition-opacity duration-300 ${
                      isModalVideoReady ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                    controls={isModalVideoReady}
                    preload="metadata"
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoadSuccess}
                    onCanPlay={handleCanPlay}
                    onTimeUpdate={handleVideoProgress}
                    playsInline
                    muted={false}
                    src={meme.imageUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}

                <button
                  onClick={closeModal}
                  className="absolute -top-10 -right-10 p-2 transition-colors cursor-pointer"
                  aria-label="Close Modal"
                >
                  <ModalDismiss/>
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
              </div>
            </div>
          </div>
        )}


        <div className="group relative overflow-hidden z-10 cursor-pointer transition-all duration-200 shadow-[0_5px_7px_rgba(12,18,25,0.7)] rounded-[19px]">
          <Squircle 
            cornerRadius={19} 
            cornerSmoothing={1} 
            className="w-full h-[280px] md:h-[256px] overflow-hidden"
          >
            <div className="relative w-full h-full">
              {(!isVideoPlaying || !isVideoReady) && (
                <>
                  <div onClick={openModal} className="absolute inset-0">
                    <Image
                      src={meme.thumbnailUrl || meme.imageUrl}
                      alt={meme.title || "Video thumbnail"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      placeholder={meme.blurDataURL ? "blur" : "empty"}
                      blurDataURL={meme.blurDataURL || undefined}
                      quality={100}
                      loading={shouldPrioritize ? undefined : "lazy"}
                      priority={shouldPrioritize}
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                      onClick={handlePlayVideo}
                      disabled={isVideoLoading}
                      className="pointer-events-auto bg-black/60 rounded-full p-4 hover:bg-black/80 transition-all duration-300 disabled:cursor-not-allowed"
                    >
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
                    </button>
                  </div>

                  
                  <div className="absolute top-2 right-2 z-20">
                    <IconsDropdown imageUrl={meme.imageUrl} docId={meme.id}/>
                  </div>
                </>
              )}

              {isVideoPlaying && (
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  isVideoReady ? 'opacity-100' : 'opacity-0'
                }`}>
                  
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    controls={isVideoReady}
                    preload="metadata"
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoadSuccess}
                    onCanPlay={handleCanPlay}
                    onTimeUpdate={handleVideoProgress}
                    playsInline
                    muted={false}
                    src={meme.imageUrl}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {isVideoReady && (
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
                  )}

                  

                  {isVideoReady && (
                    <div className="absolute top-2 right-12 z-20">
                      <IconsDropdown imageUrl={meme.imageUrl} docId={meme.id}/>
                    </div>
                  )}

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
                </div>
              )}

              {(!isVideoPlaying || videoError) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {meme.title && (
                      <h3 className="text-white font-semibold text-sm truncate mb-1">
                        {meme.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Video</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Squircle>
        </div>
      </>
    );
  }


  return (
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <Image
                src={meme.imageUrl}
                alt={meme.title || "Meme Preview"}
                width={1200}
                height={1200}
                sizes="100vw"
                className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain min-w-[300px] min-h-[300px] md:min-w-[350px] md:min-h-[350px] lg:min-w-[400px] lg:min-h-[400px] 2xl:min-w-[600px] 2xl:min-h-[600px]"
                placeholder={meme.blurDataURL ? "blur" : "empty"}
                blurDataURL={meme.blurDataURL || undefined}
                quality={100}
                priority
              />

              <button
                onClick={closeModal}
                className="absolute -top-10 -right-11 p-2 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <ModalDismiss/>
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="group relative shadow-[0_5px_7px_rgba(12,18,25,0.7)] rounded-[19px] overflow-hidden z-10 cursor-pointer transition-all duration-200">
        <Squircle 
          cornerRadius={19} 
          cornerSmoothing={1} 
          className="w-full h-[280px] md:h-[256px] overflow-hidden"
        >
          <div className="relative w-full h-full" onClick={openModal}>
            <Image
              src={meme.imageUrl}
              alt={meme.title || "Meme"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder={meme.blurDataURL ? "blur" : "empty"}
              blurDataURL={meme.blurDataURL || undefined}
              quality={100}
              loading={shouldPrioritize ? undefined : "lazy"}
              priority={shouldPrioritize}
            />
          </div>
        </Squircle>
        
        <div className="absolute top-2 right-2 z-20">
          <IconsDropdown imageUrl={meme.imageUrl} docId={meme.id}/>
        </div>
    
        <div className="absolute bottom-2 right-2 z-20">
          <ServerSideCopyButton imageUrl={meme.imageUrl} />
        </div>
    
        <div className="absolute inset-0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {meme.title && (
              <h3 className="text-white font-semibold text-sm truncate mb-1">
                {meme.title}
              </h3>
            )}
            
            {meme.fileType === "gif" && (
              <div className="flex items-center gap-1 text-xs text-gray-300">
                <span className="bg-blue-500 px-1 py-0.5 rounded text-xs font-semibold">
                  GIF
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MemeMedia;






