'use client'

import React, { useState, useEffect, memo } from "react";
import HeartSvg from "@/public/assets/icons/HeartSvg";
import FilledHeartSvg from "@/public/assets/icons/FilledHeartSvg";
import { AppUser } from "@/Types";

interface Vote {
  voter: string;
  type: "upvotes";
}

interface VotingSystemProps {
  currentUser: AppUser | null;
  upvotes: number;
  docId: string;
  memeOwnerUsername?: string;
  onShowSignInForm: () => void;
  memeImageUrl?: string;
  memeThumbnailUrl?: string;
  memeFileType?: string;
}

const LikeButton = memo(({
  currentUser, 
  upvotes, 
  docId,
  memeOwnerUsername,
  onShowSignInForm,
  memeImageUrl,
  memeThumbnailUrl,
  memeFileType
}: VotingSystemProps) => {
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(`upvotes_${docId}`) || 'false');
    }
    return false;
  });
  
  const [votingInProgress, setVotingInProgress] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const displayCount = upvotes;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`upvotes_${docId}`, JSON.stringify(hasUpvoted));
    }
  }, [hasUpvoted, docId]);

  useEffect(() => {
    const fetchVoteStatus = async (): Promise<void> => {
      if (!currentUser?.username || !docId) return;

      const lastBatchFetch = localStorage.getItem('votesLastFetched');
      const lastFetchedUser = localStorage.getItem('lastFetchedUser');
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      if (lastBatchFetch && 
          lastFetchedUser === currentUser.username && 
          parseInt(lastBatchFetch) > fiveMinutesAgo) {
        const stored = localStorage.getItem(`upvotes_${docId}`);
        if (stored === null) {
          setHasUpvoted(false);
        }
        return;
      }

      try {
        const [{ db }, { doc, getDoc }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/firestore')
        ]);

        const userVoteRef = doc(db, "memescollection", docId, "votes", currentUser.username);
        const voteSnap = await getDoc(userVoteRef);
        
        const shouldBeUpvoted = voteSnap.exists();
        
        if (hasUpvoted !== shouldBeUpvoted) {
          setHasUpvoted(shouldBeUpvoted);
        }
      } catch (err) {
        console.error("Error checking vote status:", err);
      }
    };

    fetchVoteStatus();
  }, [currentUser, docId, hasUpvoted]);

  const updateVote = async (): Promise<void> => {
    if (!currentUser || !currentUser.username) {
      onShowSignInForm();
      return;
    }

    if (votingInProgress) return;
    setVotingInProgress(true);

    const isRemoving = hasUpvoted;


    try {
      const [{ db }, { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, setDoc, deleteDoc }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/firestore')
      ]);

      const memeRef = doc(db, "memescollection", docId);
      const userVoteRef = doc(db, "memescollection", docId, "votes", currentUser.username);

      setHasUpvoted(!isRemoving);

      if (isRemoving) {
        await Promise.all([
          deleteDoc(userVoteRef),
          updateDoc(memeRef, {
            upvotes: increment(-1),
            votes: arrayRemove({ voter: currentUser.username, type: "upvotes" }),
          })
        ]);
      } else {
        setIsAnimating(true);
        
        await Promise.all([
          setDoc(userVoteRef, {
            type: "upvotes",
            timestamp: Date.now(),
            voter: currentUser.username
          }),
          updateDoc(memeRef, {
            upvotes: increment(1),
            votes: arrayUnion({ voter: currentUser.username, type: "upvotes" }),
          })
        ]);

        if (memeOwnerUsername && memeOwnerUsername !== currentUser.username) {
          try {
            const memeSnap = await getDoc(memeRef);
            const memeData = memeSnap.data();


            await fetch('/api/notifications/like', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                memeId: docId,
                memeOwnerUsername: memeOwnerUsername,
                likerUsername: currentUser.username,
                memeTitle: memeData?.title || 'Untitled',
                memeImageUrl: memeImageUrl || memeData?.imageUrl || '',
                memeThumbnailUrl: memeThumbnailUrl || memeData?.thumbnailUrl || memeData?.imageUrl || '',
                memeFileType: memeFileType || memeData?.fileType || 'image/jpeg',
                timestamp: Date.now()
              })
            });
          } catch (notificationError) {
            console.error('Error sending like notification:', notificationError);
          }
        }
        
        setTimeout(() => setIsAnimating(false), 600);
      }

      
    } catch (error) {
      console.error("Error updating vote:", error);
      setHasUpvoted(isRemoving);
      
    } finally {
      setVotingInProgress(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center gap-1">
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            updateVote();
          }}
          disabled={votingInProgress}
          className={`like-button flex items-center gap-1 group relative transition-colors duration-200  ${
            hasUpvoted ? 'liked' : ''
          } ${isAnimating ? 'animate' : ''}`}
        >
          <span className="heart-container relative cursor-pointer">
            {hasUpvoted ? <FilledHeartSvg /> : <HeartSvg />}
            
            <div className="particles absolute top-1/2 left-1/2 pointer-events-none">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
              <div className="particle particle-5"></div>
              <div className="particle particle-6"></div>
              <div className="particle particle-7"></div>
              <div className="particle particle-8"></div>
            </div>
          </span>
        </button>
        <span className="text-[16px] text-opacity-80 text-[#C3C8CCE5] transition-colors duration-300">
          {displayCount}
        </span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.upvotes === nextProps.upvotes &&
    prevProps.docId === nextProps.docId &&
    prevProps.currentUser?.uid === nextProps.currentUser?.uid &&
    prevProps.memeOwnerUsername === nextProps.memeOwnerUsername
  );
});

LikeButton.displayName = 'LikeButton';

export default LikeButton;



