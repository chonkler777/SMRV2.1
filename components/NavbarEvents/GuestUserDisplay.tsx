'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthUserIcon from '@/public/assets/icons/AuthUserIcon';
import WalletArrow from '@/public/assets/icons/WalletArrow';
import useClickOutside from '@/hooks/useClickOutside';
import { GuestUserDisplayProps } from '@/Types';
import NotificationWrapper from '../Notifications/NotificationsWrapper';
import UploadIcon from '@/public/assets/icons/UploadIcon';


const GuestUserDisplay: React.FC<GuestUserDisplayProps> = ({
  username,
  onConnectWallet,
  onLogout
}) => {
  const [isWalletArrowRotated, setIsWalletArrowRotated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsWalletArrowRotated(false);
    setIsDropdownOpen(false);
  });

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWalletArrowRotated(!isWalletArrowRotated);
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex items-center lg:gap-4">
      
      <Link prefetch={true} scroll={false} href="/Post">
        <button className="hidden lg:flex border border-[#C3C8CC] bg-[#86EFAC]/90 hover:bg-[#86EFAC] cursor-pointer transition duration-200 text-black font-medium font-roboto text-base px-8 py-1.5 rounded-full items-center gap-2">
          <UploadIcon/>
          Post
        </button>
      </Link>


      
      <button
        onClick={onConnectWallet} 
        className="border border-[#9C9C9C] cursor-pointer rounded-full text-black font-semibold font-roboto bg-[linear-gradient(90deg,_#8B5CF6,_#6366F1,_#3B82F6,_#10B981,_#FACC15,_#F97316,_#EF4444)] hover:opacity-90 transition px-2 py-2 lg:px-4 lg:py-1.5 text-[14px] lg:text-base"
      >
        Connect Wallet
      </button>

      {/* Separator */}
      <span className="border-r border-[#57674A] hidden lg:flex dark:border-[#C3C8CC] w-px h-5"></span>

      <div className="hidden lg:block">
        <NotificationWrapper />
      </div>
      
      <div className="relative hidden lg:flex" ref={dropdownRef}>
        <span
          className="font-semibold lg:text-[18px] flex items-center gap-1 text-[#C3C8CC] cursor-pointer hover:opacity-80 transition"
          onClick={handleUsernameClick}
        >
          <AuthUserIcon/>
          {username}
          <div 
            className={`transition-transform duration-300 ${
              isWalletArrowRotated ? "rotate-180" : ""
            }`}
          >
            <WalletArrow/>
          </div>
        </span>

        
        {isDropdownOpen && (
          <div
            className="absolute top-full mt-2 left-0 cursor-pointer right-0 bg-[#0C1219] p-5 rounded-bl-[19px] shadow-lg z-50"
            style={{
              minWidth: dropdownRef.current?.offsetWidth || "auto",
              width: dropdownRef.current
                ? `calc(100vw - ${dropdownRef.current.getBoundingClientRect().left}px)`
                : "auto",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="w-full flex items-center cursor-pointer justify-center whitespace-nowrap gap-1 border border-[#C3C8CC] rounded-full px-3 py-1 text-[14px] text-[#C3C8CC]"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestUserDisplay;