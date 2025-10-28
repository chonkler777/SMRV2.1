"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { howItWorks } from "@/public/assets/images";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserGuideProps {
  className?: string;
  showOnMount?: boolean; 
}


const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const animateTimer = setTimeout(() => setShouldAnimate(true), 10);
      return () => clearTimeout(animateTimer);
    } else {
      setShouldAnimate(false);
      const hideTimer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(hideTimer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      setShouldAnimate(false);
      setIsVisible(false);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 flex px-4 lg:px-0 items-center justify-center bg-black/80 z-50 transition-opacity duration-300 ${
      shouldAnimate ? 'opacity-100' : 'opacity-0'
    }`}>
      <div
        className="relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-guide-title"
      >
        <div className="relative">
          <Image
            src={howItWorks}
            alt="user guide"
            width={974}
            height={908}
            className={`lg:h-[90vh] 2xl:h-[70vh] w-auto transition-all duration-200 transform ${
              shouldAnimate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            style={{ objectFit: "contain" }}
            quality={90}
            priority
            fetchPriority="high"
          />

          <button
            onClick={onClose}
            className={`absolute left-1/2 transform -translate-x-1/2 bg-[#86EFAC] font-roboto cursor-pointer hover:bg-opacity-90 shadow-[0_5px_7px_rgba(12,18,25,0.9)] text-black px-10 py-1 xl:px-16 xl:py-2 rounded-full font-medium transition-all duration-300 ${
              shouldAnimate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            style={{ bottom: "5%" }}
            aria-label="Close user guide"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

const UserGuide: React.FC<UserGuideProps> = ({
  className = "",
  showOnMount = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(showOnMount);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenHowItWorksModal");
    if (!hasSeenModal) {
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    localStorage.setItem("hasSeenHowItWorksModal", "true");
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`text-[#C3C8CC] text-[18px] font-roboto hover:text-[#86EFAC] transition-colors duration-300 cursor-pointer ${className}`}
        aria-label="Open user guide"
      >
        How it works
      </button>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default UserGuide;






