"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowTop from "@/public/assets/icons/ArrowTop";

interface BackToTopButtonProps {

  threshold?: number;
  bottomPosition?: string;

  className?: string;

  buttonText?: string;

  desktopOnly?: boolean;
}

export default function BackToTopButton({
  threshold = 300,
  bottomPosition = "bottom-16",
  className = "",
  buttonText = "back to top",
  desktopOnly = true,
}: BackToTopButtonProps) {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScrollToTop(scrollTop > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {showScrollToTop && (
        <div
          className={`fixed ${bottomPosition} z-40 ${
            desktopOnly ? "hidden lg:flex" : "flex"
          } left-1/2 transform -translate-x-1/2`}
        >
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className={
              className ||
              "bg-[#364097] text-white flex items-center cursor-pointer px-4 py-2.5 2xl:px-6 2xl:py-3 rounded-full shadow-lg text-[14px] 2xl:text-[16px]"
            }
          >
            <ArrowTop/>
            {buttonText}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}