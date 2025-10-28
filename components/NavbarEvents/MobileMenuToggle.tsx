"use client";
import React, { useState } from "react";
import UserGuide from "./UserGuide";
import LinksDropdown from "./LinksDropdown";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/AuthContext/AuthProvider";
import { useWallet } from "@/AuthContext/WalletProvider";
import useBatchVotesFetch from "@/hooks/useBatchVotesFetch";
import HamburgerClose from "@/public/assets/icons/HamburgerClose";
import HamburgerOpen from "@/public/assets/icons/HamburgerOpen";
import LogOutSvg from "@/public/assets/icons/LogOutSvg";

interface MobileMenuToggleProps {
  className?: string;
  authDisplay: React.ReactNode;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  className = "",
  authDisplay,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { isConnected } = useWallet();
  const { clearVotesCache } = useBatchVotesFetch({ currentUser });

  const isGuestUser = Boolean(currentUser?.username && !isConnected);

  const handleGuestLogout = async () => {
    try {
      clearVotesCache();
      await signOut(auth);
      setIsOpen(false);
    } catch (err) {
      console.error("Guest logout failed:", err);
    }
  };

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "text-[#86EFAC] duration-300 text-[18px] font-roboto"
      : "hover:text-[#86EFAC] duration-300 text-[18px] font-roboto text-[#C3C8CC]";
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className={`items-center ${isOpen ? "hidden" : ""}`}>
          {authDisplay}
        </div>

        <button
          onClick={toggleMenu}
          className={`focus:outline-none ${className}`}
        >
          <span className="w-[25px] h-[25px] block">
            {isOpen ? (
              <HamburgerClose/>
            ) : (
              <HamburgerOpen/>
            )}
          </span>
        </button>
      </div>

      {isOpen && (
  <div className="absolute top-full left-0 w-full bg-[#0C1219] border-t border-gray-800 lg:hidden z-50">
    <div className="px-3 py-6 relative">
      <div className="flex flex-col items-center space-y-4">
        <Link
          href="/"
          className={getLinkClasses("/")}
          onClick={() => setIsOpen(false)}
        >
          Explore
        </Link>

        <Link
          href="/Videos"
          className={getLinkClasses("/Videos")}
          onClick={() => setIsOpen(false)}
        >
          Videos
        </Link>

        <Link
          href="/Gifs"
          className={getLinkClasses("/Gifs")}
          onClick={() => setIsOpen(false)}
        >
          Gifs
        </Link>

        <UserGuide />
        <LinksDropdown />
      </div>

      {isGuestUser && (
        <button
          onClick={handleGuestLogout}
          className="absolute bottom-4 left-4 flex items-center gap-1 border border-gray-800 rounded-full px-3 py-2 text-[14px] text-[#C3C8CC]"
        >
          <LogOutSvg />
          Log out
        </button>
      )}
    </div>
  </div>
)}

    </>
  );
};

export default MobileMenuToggle;
