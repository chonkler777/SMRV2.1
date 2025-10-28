'use client';

import React, { useState, memo } from "react";
import dynamic from 'next/dynamic';
import LikeButton from "./LikeButton";
import Form from "@/app/global-components/AuthForm";
import EarningsDisplay from "../TransactionEvents/EarningsDisplay";
import VoteButton from "@/public/assets/icons/VoteButton";
import { Squircle } from "corner-smoothing";


const SendToken = dynamic(() => import("../TransactionEvents/SendToken/SendToken"), {
  ssr: false,
  loading: () => (
    <div className="relative group flex flex-row gap-1 cursor-pointer">
      <VoteButton/>
      <span className="text-[#C3C8CC] text-[16px]">Vote</span>
    </div>
  ),
});



interface MemeActionsProps {
  upvotes: number;
  docId: string;
  memeId: string;
  currentUser: any;
  wallet?: string;
  handleShowSignInForm?: () => void;
  setSearchQuery: (query: string) => void;
  username?: string;
  memeTitle?: string;
  memeImageUrl?: string;
  memeThumbnailUrl?: string;
  memeFileType?: string;
  senderUsername?: string;
}

const MemeActions = memo(({
  upvotes,
  docId,
  currentUser,
  wallet,
  memeId,
  setSearchQuery,
  username,
  memeTitle,
  memeImageUrl, 
  memeThumbnailUrl,
  memeFileType, 
}: MemeActionsProps) => {
  const [isAuthFormOpen, setIsAuthFormOpen] = useState<boolean>(false);

  const openAuthForm = (): void => {
    setIsAuthFormOpen(true);
  };

  const closeAuthForm = (): void => {
    setIsAuthFormOpen(false);
  };

  const isAnonymous = username?.startsWith("Anonymous");
  const effectiveWallet = isAnonymous ? "1nc1nerator11111111111111111111111111111111" : wallet;

  return (
    <div className="flex flex-row items-center">
      <div
        className={`flex items-center gap- ${
          wallet
            ? "justify-between "
            : "justify-between "
        } w-full`}
      >
        <div className="ml-[4px]">
          <LikeButton
            upvotes={upvotes}
            docId={docId}
            memeOwnerUsername={username}
            currentUser={currentUser}
            onShowSignInForm={openAuthForm}
            memeImageUrl={memeImageUrl}
            memeThumbnailUrl={memeThumbnailUrl}
            memeFileType={memeFileType}
          />
        </div>

        {effectiveWallet ? (
          <EarningsDisplay
            docId={docId}
            setSearchQuery={setSearchQuery}
            wallet={effectiveWallet}
          />
        ) : (
          <Squircle
            cornerRadius={0}
            bottomRightCornerRadius={12}
            bottomLeftCornerRadius={12}
            cornerSmoothing={1}
          >
            <div className="px-5 py-2 bg-[#152D2D] text-[16px] cursor-pointer font-semibold text-[#86EFAC80] inline-flex flex-row items-center transition-all duration-300 rounded-b-[px]">
              <span>Votes: $0.00</span>
            </div>
          </Squircle>
        )}

        <div className="h-[px] flex items-center justify-center mr-[2px]">
          {effectiveWallet ? (
            <SendToken
              recipient={effectiveWallet}
              docId={docId}
              currentUser={currentUser}
              onAuthRequired={openAuthForm}
              memeId={memeId} 
              memeTitle={memeTitle || "Unknown"}
              memeImageUrl={memeImageUrl || ""}
              memeThumbnailUrl={memeThumbnailUrl}
              memeFileType={memeFileType || "image/jpeg"}
            />
          ) : (
            <div className="relative group flex flex-row gap-1 cursor-pointer">
              <VoteButton/>
              <span className="text-[#C3C8CC59] text-[16px]">Vote</span>

              <div className="absolute top-full right-0 z-50 mt-1 px-2 py-1 bg-[#C3C8CC] hidden md:flex text-[#25394E] text-[12px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {isAnonymous
                  ? "This post was made anonymously"
                  : "User didn't provide an address"}
                <div className="absolute bottom-full right-4 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#C3C8CC]"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Form
        buttonLabel="Sign In"
        isOpen={isAuthFormOpen}
        onClose={closeAuthForm}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.upvotes === nextProps.upvotes &&
    prevProps.docId === nextProps.docId &&
    prevProps.currentUser?.uid === nextProps.currentUser?.uid &&
    prevProps.wallet === nextProps.wallet &&
    prevProps.username === nextProps.username
  );
});

MemeActions.displayName = 'MemeActions';

export default MemeActions;



