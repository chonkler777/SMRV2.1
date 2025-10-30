'use client';

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PriceArrow from "@/public/assets/icons/PriceArrow";
import TransactionPreview from "../TransactionEvents/TransactionsPreview";
import { usePrice } from "@/context/ChonkPrice"; 
import TransactionsIcon from "@/public/assets/icons/TransactionsIcon";
import { Squircle } from "corner-smoothing";

interface Tip {
  recipientWallet: string;
  senderWallet: string;
  senderUsername?: string;
  memeId: string;
  amount: number;
  token?: string;
  timestamp: number;
  priceAtSend?: number;
  transactionId: string;
  message?: string;
}

interface EarningsDisplayProps {
  docId: string;
  setSearchQuery: (query: string) => void;
  wallet?: string;
}

const EarningsDisplay: React.FC<EarningsDisplayProps> = ({ 
  docId, 
  setSearchQuery, 
  wallet 
}) => {
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);                  
  const [totalTips, setTotalTips] = useState<number>(0);
  const [displayedValue, setDisplayedValue] = useState<number>(0);
  const [temporaryTipUSD, setTemporaryTipUSD] = useState<number | null>(null);
  const [isGlowing, setIsGlowing] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [showTxDropdown, setShowTxDropdown] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [dropdownWidth, setDropdownWidth] = useState<number>(0);
  const [motion, setMotion] = useState<any>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { solPrice, chonkPrice, loading, chonkerPrice } = usePrice();  

  const hasEarnings = totalTips > 0;

  useEffect(() => {
    if (docId) {
      router.prefetch(`/TransactionsData/${docId}`);
    }
  }, [router, docId]);

  
  useEffect(() => {
    import('framer-motion').then((mod) => {
      setMotion(() => mod.motion);
    });
  }, []);

  useEffect(() => {
    if (!docId || (solPrice === 0 && chonkPrice === 0)) return;

    const setupFirestoreListener = async () => {
      const [{ db }, { collection, query, where, onSnapshot }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/firestore')
      ]);

      const tipsRef = collection(db, "tips");
      const tipsQuery = query(tipsRef, where("memeId", "==", docId));
      
      const unsubscribe = onSnapshot(tipsQuery, (snapshot) => {
        const newTips: Tip[] = [];
        let totalAmount = 0;
        
        snapshot.forEach((doc) => {
          const tipData = doc.data() as Tip;
          newTips.push(tipData);
          totalAmount += tipData.amount || 0;
        });

        setTips(newTips);
        setTotalTips(totalAmount);

        const newTotalUSD = newTips.reduce((sum, tip) => {
          const price = tip.token === "SOL" ? solPrice : chonkerPrice;
          return sum + tip.amount * price;
        }, 0);

        if (hasInitialized && newTotalUSD > displayedValue) {
          const delta = newTotalUSD - displayedValue;
          setTemporaryTipUSD(delta);

          setTimeout(() => {
            setDisplayedValue(newTotalUSD);
            setTemporaryTipUSD(null);
            setIsGlowing(true);
            setTimeout(() => setIsGlowing(false), 2000);
          }, 4000);
        } else {
          setDisplayedValue(newTotalUSD);
        }

        if (!hasInitialized) setHasInitialized(true);
      });

      return unsubscribe;
    };

    let cleanup: (() => void) | undefined;
    setupFirestoreListener().then(unsub => {
      cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [
    docId,
    solPrice,
    chonkPrice,
    chonkerPrice,
    displayedValue,
    hasInitialized,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showTxDropdown &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTxDropdown(false);
      }
    };

    if (showTxDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTxDropdown]);

  useEffect(() => {
    if (containerRef.current) {
      setDropdownWidth(containerRef.current.offsetWidth);
    }
  }, [showTxDropdown]);

  const handleToggle = (): void => {
    if (totalTips > 0) {
      setShowTxDropdown((prev) => !prev);
    }
  };

  const handleViewTransactions = () => {
    router.push(`/TransactionsData/${docId}`, { scroll: false });
  };

  return (
    <div className="py- text-center">
      <div className="relative inline-block">
        <Squircle
          cornerRadius={0}
          bottomRightCornerRadius={12}
          bottomLeftCornerRadius={12}
          cornerSmoothing={1}
        >
          <div
            ref={containerRef}
            onClick={handleToggle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`inline-block px-3.5 py-2 bg-[#152D2D] font-Roboto ${
              hasEarnings ? "hover:bg-[#1D3C3C] cursor-pointer" : ""
            } text-[16px] inline-flex justify-center font-semibold text-[#86EFAC]  flex-row items-center transition-all duration-300`}
          >
            {temporaryTipUSD !== null && motion ? (
              <>
                Vote:&nbsp;
                <motion.span
                  className="text-lg font-bold text-[#86EFAC]"
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 30 }}
                >
                  +${temporaryTipUSD.toFixed(4)}
                </motion.span>
                <span
                  className={`transform transition-transform duration-300 ${
                    showTxDropdown ? "rotate-180" : ""
                  }`}
                >
                  <PriceArrow />
                </span>
              </>
            ) : (
              <>
                Votes:&nbsp;
                <span
                  style={{
                    textShadow: isGlowing
                      ? "0 0 5px #86EFAC, 0 0 10px #86EFAC, 0 0 15px #86EFAC, 0 0 20px #86EFAC"
                      : "none",
                    filter: isGlowing ? "brightness(1.2)" : "brightness(1)",
                    transition: "text-shadow 2s ease-out, filter 2s ease-out",
                  }}
                >
                  ${displayedValue.toFixed(4)}
                </span>
                {hasEarnings && motion && (
                  <motion.span
                    className="ml-[4px]"
                    initial={{ rotate: 0 }}
                    animate={{
                      rotate: showTxDropdown ? 180 : 0,
                      y: isHovering ? [0, 3, 0] : 0,
                    }}
                    transition={{
                      rotate: { duration: 0.3 },
                      y: { duration: 1.2, repeat: isHovering ? Infinity : 0, ease: "easeInOut" },
                    }}
                  >
                    <PriceArrow />
                  </motion.span>
                )}
              </>
            )}
          </div>
        </Squircle>

        {hasEarnings && (
          <div
            ref={dropdownRef}
            className={`absolute -left-16 top-full mt-[2px] w-64 bg-[#202933] rounded-[6px] shadow-[3px_3px_3px_rgba(12,18,25,0.7)] transition-opacity duration-200 z-25 ${
              showTxDropdown
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <TransactionPreview docId={docId} setSearchQuery={setSearchQuery} />
            <div className="w-full px-4 py-2 text-[12px] text-[#86EFAC]/80 transition duration-100 border-t border-[#364097]">
              <button 
                onClick={handleViewTransactions}
                className="w-full block"
              >
                <span className="px-3 py-1.5 inline-flex shadow-[-3px_3px_10px_rgba(12,18,25,0.7)] flex-row font-Roboto gap-1 justify-center items-center bg-[#0C1219B2]/80 hover:bg-[#0C1219] transition duration-100 rounded-[6px] cursor-pointer w-full">
                  <TransactionsIcon/>
                  View Transactions
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EarningsDisplay);




