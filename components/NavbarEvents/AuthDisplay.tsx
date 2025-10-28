"use client";

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/AuthContext/AuthProvider";
import { useWallet } from "@/AuthContext/WalletProvider";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import { useWalletSync } from "@/hooks/useWalletSync";
import ConnectButton from "./ConnectButton";
import UserDisplay from "./UserDisplay";
import GuestUserDisplay from "./GuestUserDisplay";
import Link from 'next/link';
import useBatchVotesFetch from "@/hooks/useBatchVotesFetch";
import UploadIcon from "@/public/assets/icons/UploadIcon";

const AuthDisplay: React.FC = () => {
  const { currentUser } = useAuth();
  const { clearVotesCache } = useBatchVotesFetch({ currentUser });
  const { address, isConnected, open, walletHydrated } = useWallet();

  useAutoLogout(currentUser, isConnected, walletHydrated);
  useWalletSync(address, isConnected);

  const isFullyAuthenticated = Boolean(
    currentUser?.username && address && isConnected
  );

  const isGuestUser = Boolean(currentUser?.username && !isConnected);

  const handleLogout = async () => {
    try {
      clearVotesCache();
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUsernameClick = () => {
    if (isConnected && address) {
      open();
    }
  };

  const handleGuestConnectWallet = () => {
    open();
  };

  return (
    <div className="flex items-center gap-4">
      {isFullyAuthenticated ? (
        <UserDisplay
          username={currentUser?.username || ""}
          walletAddress={address || ""}
          onLogout={handleLogout}
          onUsernameClick={handleUsernameClick}
        />
      ) : isGuestUser ? (
        <GuestUserDisplay
          username={currentUser?.username || ""}
          onConnectWallet={handleGuestConnectWallet}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <Link prefetch={true} scroll={false} href="/Post">
            <button className="hidden lg:flex border border-[#C3C8CC] bg-[#86EFAC]/90 hover:bg-[#86EFAC] cursor-pointer transition duration-200 text-black font-medium font-roboto text-base px-8 py-1.5 rounded-full items-center gap-2">
              <UploadIcon />
              Post
            </button>
          </Link>
          <ConnectButton />
        </>
      )}
    </div>
  );
};

export default AuthDisplay;
