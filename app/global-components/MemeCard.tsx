'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import MemeMedia from '@/components/MemeCardEvents/MemeMedia';
import CopyToClipboard from '@/components/MemeCardEvents/CopyAdress';
import type { Meme } from '@/Types';
import MemeUserIcon from '@/public/assets/icons/MemeUserIcon';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import useClickOutside from '@/hooks/useClickOutside';
import { AppUser } from '@/Types';
import MemeActions from '@/components/MemeCardEvents/MemeActions';
import AdminControl from '@/components/Admin/AdminControl';



interface MemeCardProps {
  meme: Meme;
  setSearchQuery?: (query: string) => void;
  setSearchBy?: (searchBy: string) => void;
  currentUser: AppUser | null;
  onShowSignInForm: () => void;
  index?: number;
  onMemeDeleted?: (docId: string) => void;

}

const MemeCard = memo(({ meme, setSearchQuery, setSearchBy, currentUser, index = 0, onMemeDeleted }: MemeCardProps) => {
  const [isTagExpanded, setIsTagExpanded] = useState(false);
  const [shouldTruncateTag, setShouldTruncateTag] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const tagTextRef = useRef<HTMLSpanElement>(null);
  const [currentTag, setCurrentTag] = useState(meme.tag);
  const [currentWallet, setCurrentWallet] = useState(meme.wallet);

  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    if (!isSelecting) {
      setIsTagExpanded(false);
    }
  });

  const handleMemeDelete = (docId: string) => {
    if (onMemeDeleted) {
      onMemeDeleted(docId);
    }
  };

  const {
    username: RealUsername,
    timestamp,
    docId,
    imageUrl,
    fileType,

  } = meme;

  const { formatExactDate, formatRelativeTime } = useDateFormatter();

  useEffect(() => {
    setCurrentTag(meme.tag);
    setCurrentWallet(meme.wallet);
  }, [meme.tag, meme.wallet]);

  
  useEffect(() => {
    const checkTextOverflow = () => {
      if (tagContainerRef.current && tagTextRef.current && currentTag) {
        const containerWidth = tagContainerRef.current.offsetWidth;
        const availableWidth = containerWidth - 32;
        
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.fontSize = '12px';
        tempSpan.style.fontFamily = 'Roboto, sans-serif';
        tempSpan.textContent = currentTag;
        
        document.body.appendChild(tempSpan);
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        
        setShouldTruncateTag(textWidth > availableWidth);
      } else {
        setShouldTruncateTag(false);
      }
    };

    checkTextOverflow();
    window.addEventListener('resize', checkTextOverflow);
    
    return () => {
      window.removeEventListener('resize', checkTextOverflow);
    };
  }, [currentTag]);


  const handleUsernameClick = () => {
    const searchParams = new URLSearchParams({
      query: RealUsername,
      searchBy: 'username'
    });
    
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.open(newUrl, '_blank');
  };

  

  const handleMouseDown = () => {
    setIsSelecting(true);
  };

  const handleMouseUp = () => {
  
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleTagUpdate = (newTag: string) => {
    setCurrentTag(newTag);
  };

  // Handler for wallet updates from OwnerControls
  const handleWalletUpdate = (newWallet: string) => {
    setCurrentWallet(newWallet);
  };

  const handleTagContainerClick = (e: React.MouseEvent) => {
    if (!currentTag) return;
    
  
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    
    setIsTagExpanded(!isTagExpanded);
  };

  return (
    <div className="border border-transparent w-full max-w-sm mx-auto relative">
      <div className="py- flex flex-row items-center justify-between">
        <div className="flex items-center text-center space-x-1 ml-[7px]">
          <div className="w-4 h-4 flex-shrink-0">
            <MemeUserIcon/>
          </div>

          <h3
            onClick={handleUsernameClick}
            className="text-[13px] font-bold text-[#EAEBEC] cursor-pointer hover:underline relative group"
          >
            {RealUsername}
            <div className="absolute font-semibold bottom-full left-[20px] px-2 py-1 bg-[#C3C8CC] text-[#25394E] text-[12px] 2xl:text-[16px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                View {RealUsername} posts
              <div className="absolute top-full left-3 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
            </div>
          </h3>

          {!RealUsername?.startsWith("Anonymous") ? (
            <CopyToClipboard textToCopy={currentWallet} />
          ) : (
            <CopyToClipboard textToCopy="1nc1nerator11111111111111111111111111111111" />
          )}
        </div>
        
        <div className="text-[12px] mr-[7px] text-[#C3C8CC] relative group cursor-pointer">
          {formatRelativeTime(timestamp)}
          <div className="absolute font-semibold bottom-full right-0 px-2 py-1 bg-[#C3C8CC] text-[#25394E] text-[12px] 2xl:text-[16px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
            {formatExactDate(timestamp)}
            <div className="absolute top-full right-3 transform translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
          </div>
        </div>
      </div>

      <div 
        ref={dropdownRef} 
        onClick={handleTagContainerClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`pb-8 z-50 ${currentTag ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div 
          ref={tagContainerRef}
          className='bg-[#19233D] cursor-pointer hover:bg-[#202A53] py-1 px-2 z-20 absolute rounded-[8px] text-[#7FB4FA] font-roboto text-[12px] w-full'
        >
          <span 
            ref={tagTextRef}
            className={`${isTagExpanded ? 'select-text' : shouldTruncateTag ? 'block truncate' : 'block'} ${shouldTruncateTag ? 'pr-6' : ''}`}
          >
            {currentTag || '#'}
          </span>
          
          {shouldTruncateTag && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTagExpanded(!isTagExpanded);
              }}
              className="absolute z-30 right-2 top-[3px]"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform duration-200 ${isTagExpanded ? 'rotate-180' : ''}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="">
        <MemeMedia meme={meme} index={index} />
      </div>
      <div className=''>
        <MemeActions
          upvotes={meme.upvotes}
          docId={meme.id}
          memeId={meme.id}
          currentUser={currentUser}
          wallet={currentWallet}
          setSearchQuery={setSearchQuery || (() => {})}
          username={RealUsername}
          memeTitle={currentTag}
          memeImageUrl={imageUrl} 
          memeThumbnailUrl={meme.thumbnailUrl} 
          memeFileType={fileType}  
        />
      </div>
      <AdminControl
        currentName={currentUser?.username}
        currentUser={currentUser}
        docId={meme.id}
        tag={currentTag ?? ""}
        wallet={currentWallet}
        onTagUpdate={handleTagUpdate}
        onWalletUpdate={handleWalletUpdate}
        onMemeDeleted={handleMemeDelete}
        />
    </div>
  );
}, (prevProps, nextProps) => {

  return (
    prevProps.meme.id === nextProps.meme.id &&
    prevProps.meme.upvotes === nextProps.meme.upvotes &&
    prevProps.meme.username === nextProps.meme.username &&
    prevProps.meme.tag === nextProps.meme.tag &&
    prevProps.meme.wallet === nextProps.meme.wallet &&
    prevProps.currentUser?.uid === nextProps.currentUser?.uid
  );
});


MemeCard.displayName = 'MemeCard';

export default MemeCard;
