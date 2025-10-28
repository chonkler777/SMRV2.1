"use client";

import PlusIcon from "@/public/assets/icons/PlusIcon";
import Notifications from "./Notifications/Notification";
import { useAuth } from "@/AuthContext/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ArrowTop from "@/public/assets/icons/ArrowTop";
import Link from "next/link";

const BottomBar = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-800 lg:hidden z-50">
      <div className="flex justify-between items-center h-16 px-2">
        <div className="flex flex-col items-center justify-center h-full relative px-4 hover:text-white transition-colors duration-200">
          <Notifications currentUser={currentUser} />
          <span className="text-xs mt- font-medium text-gray-300">
            Notifications
          </span>
        </div>

        {showBackToTop && (
          <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2">
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-transparent border border-[#86EFAC] text-[#86EFAC] px-4 py-2.5 2xl:px-6 2xl:py-3 rounded-full shadow-lg text-[14px] 2xl:text-[16px]"
            >
              <div className="flex items-center">
                <span>
                  <ArrowTop />
                </span>
                <span>back to top</span>
              </div>
            </motion.button>
          </div>
        )}


        <Link
          href="/Post/Mobile"
          className="flex flex-col items-center justify-center h-full text-gray-300 hover:text-white transition-colors duration-200 px-4"
        >
          <PlusIcon />
          <span className="text-xs mt-1 font-medium">Post</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomBar;
