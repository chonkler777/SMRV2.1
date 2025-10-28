import React, { Suspense } from "react";
import MobileMenuToggle from "@/components/NavbarEvents/MobileMenuToggle";
import Link from "next/link";
import UserGuide from "@/components/NavbarEvents/UserGuide";
import LinksDropdown from "@/components/NavbarEvents/LinksDropdown";
import MemeCounter from "./MemeCount/MemeCounter";
import MemeCountSkeleton from "@/components/NavbarEvents/MemeCountSkeleton";
import AuthDisplay from "@/components/NavbarEvents/AuthDisplay";
import NavbarLinks from "@/components/NavbarEvents/NavbarLink";
import TrendlineSvg from "@/public/assets/icons/TrendlineSvg";
import LogoSvg from "@/public/assets/icons/LogoSvg";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  return (
    <div
      className={`px-3 lg:px-6 py-4 bg-[#0C1219] shadow-[0_5px_5px_rgba(12,18,25,0.4)] transition-colors duration-500 z-50 fixed w-full ${className}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex space-x-6 items-center">
          <span className="cursor-pointer flex gap-[3px] lg:gap-5 items-center">
            <Link href="/" className="no-underline">
              <LogoSvg />
            </Link>

            <div className="relative hidden lg:block group">
              <h1 className="flex items-center text-white font-montserrat text-[28px] font-extrabold gap-2">
                <span>CHONK</span>
                <span className="relative">
                  SMR
                  <div className="absolute font-semibold bottom-full -mb-2 left-0 px-2 py-1 bg-[#C3C8CC] text-[#25394E] text-[12px] 2xl:text-[16px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                    Strategic Meme Reserve
                    <div className="absolute top-full left-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
                  </div>
                </span>
              </h1>

              {/* Tagline is absolutely positioned; does not affect the row layout */}
              <span className="absolute left-0 top-full -mt-2 font-roboto text-[12px] text-[#C3C8CC] whitespace-nowrap">
                Crypto & Clown World Memes
              </span>
            </div>

            <span className="flex flex-col lg:hidden">
              <h1 className="flex lg:hidden text-white font-montserrat text-[18px] font-extrabold">
                CHONK SMR
              </h1>
              <span className="flex lg:hidden items-center gap-1 font-roboto text-[16px] font-bold text-white">
                <TrendlineSvg />
                <Suspense fallback={<MemeCountSkeleton />}>
                  <MemeCounter />
                </Suspense>{" "}
                Memes
              </span>
            </span>

            <span className="hidden lg:flex items-center gap-1 font-roboto text-[20px] font-bold text-white">
              <TrendlineSvg />
              <Suspense fallback={<MemeCountSkeleton />}>
                <MemeCounter />
              </Suspense>{" "}
              Memes
            </span>
          </span>

          <NavbarLinks />

          <div className="hidden lg:flex">
            <UserGuide />
          </div>

          <div className="relative hidden lg:flex">
            <LinksDropdown />
          </div>
        </div>

        <div className="lg:flex items-center hidden">
          <AuthDisplay />
        </div>

        <div className="flex lg:hidden items-center ">
          <MobileMenuToggle authDisplay={<AuthDisplay />} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
