"use client";

import React, { useState, } from "react";
import Link from "next/link";
import AuthUserIcon from "@/public/assets/icons/AuthUserIcon";
import WalletArrow from "@/public/assets/icons/WalletArrow";
import WalletIcon from "@/public/assets/icons/WalletIcon";
import useClickOutside from "@/hooks/useClickOutside";
import { UserDisplayProps } from "@/Types";
import NotificationWrapper from "../Notifications/NotificationsWrapper";
import UploadIcon from "@/public/assets/icons/UploadIcon";



const UserDisplay: React.FC<UserDisplayProps> = ({
  username,
  walletAddress,
  onUsernameClick,
}) => {
  const [isWalletArrowRotated, setIsWalletArrowRotated] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsWalletArrowRotated(false);
  });

  const shortenAddress = (addr: string) =>
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "";

  const handleUsernameAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsWalletArrowRotated(!isWalletArrowRotated);

    onUsernameClick();
  };

  return (
    <div className="flex items-center lg:gap-8">
      <Link prefetch={true} scroll={false} href="/Post">
        <button className="border border-[#C3C8CC] bg-[#86EFAC]/90 hover:bg-[#86EFAC] hidden lg:flex cursor-pointer transition duration-200 text-black font-medium font-roboto text-base px-8 py-1.5 rounded-full  items-center gap-2">
          
          <UploadIcon/>
          Post
        </button>
      </Link>

      <span className="border-r border-[#57674A] hidden lg:flex dark:border-[#C3C8CC] w-px h-5"></span>


      <div className="hidden lg:block">
        <NotificationWrapper />
      </div>
      

      <div className="relative" ref={dropdownRef}>
        <div
          className="flex flex-col cursor-pointer hover:opacity-80 transition"
          onClick={handleUsernameAreaClick}
        >
          <span className="font-semibold lg:text-[18px] flex items-center gap-1 text-[#C3C8CC]">
            <AuthUserIcon/>
            {username}
            <span className="pl-2 hidden lg:flex">
              <div
                className={`transition-transform duration-300 ${
                  isWalletArrowRotated ? "rotate-180 " : ""
                }`}
              >
                <WalletArrow/>
              </div>
            </span>
          </span>

          <span className="ml-1 text-[#C8C8CC] flex items-center text-[12px]">
            <WalletIcon/>
            {shortenAddress(walletAddress)}
            <span className="pl-1 block lg:hidden">
              <WalletArrow/>
            </span>

          </span>
        </div>
      </div>
    </div>
  );
};

export default UserDisplay;
