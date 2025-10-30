"use client";

import { useEffect, useState } from "react";
import { usePrice } from "@/context/ChonkPrice";
import CopyButton from "@/components/TransactionEvents/TransCopyButton";
import { motion } from "framer-motion";
import TransactionsMedia from "@/components/TransactionEvents/TransactionsMedia";
import type { Meme } from "@/Types";
import Currencylogo from "@/public/assets/icons/CurrencyLogo";
import { X } from "lucide-react";


interface Tip {
  transactionId: string;
  timestamp: number;
  from: string;
  amount: number;
  token: string;
  priceAtSend?: number;
  username?: string;
  message?: string;
}

interface TransactionData {
  meme: Meme;
  tips: Tip[];
  totalEarnings: number;
  tipCount: number;
}

interface TransactionDetailClientProps {
  docId: string;
  initialTransactionData: TransactionData | null;
  isModal?: boolean;
  onClose?: () => void;
}

const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = hours.toString().padStart(2, "0");

  return (
    <div className="flex flex-row gap-[3px] font-Roboto items-baseline">
      <span className="text-white text-[16px] 2xl:text-[18px]">{`${month}/${day}/${year}`}</span>{" "}
      <span className="text-[10px] 2xl:text-[14px] text-white whitespace-nowrap">{`${hoursStr}:${minutes}:${seconds} ${ampm}`}</span>
    </div>
  );
};

const handleUsernameClick = (username: string) => {

  if (username === "Anonymous") return;


  const searchParams = new URLSearchParams({
    query: username,
    searchBy: "username",
  });


  const newUrl = `/?${searchParams.toString()}`;
  window.open(newUrl, "_blank");
};

const truncateString = (str: string, startChars = 4, endChars = 4) => {
  if (!str) return "N/A";
  if (str.length <= startChars + endChars) return str;
  return `${str.substring(0, startChars)}...${str.substring(
    str.length - endChars
  )}`;
};

const getSolscanUrl = (txId: string) => {
  if (!txId) return "";
  return `https://solscan.io/tx/${txId}`;
};

const getSolscanAccount = (address: string) => {
  if (!address) return "";
  return `https://solscan.io/account/${address}`;
};

interface SolscanTooltipProps {
  children: React.ReactNode;
  show: boolean;
}

const SolscanTooltip: React.FC<SolscanTooltipProps> = ({ children, show }) => {
  return (
    <div className="relative inline-block">
      {children}
      {show && (
        <div className="absolute bottom-full left-[80px] 2xl:left-[100px] transform -translate-x-1/2 mb- z-50">
          <div className="bg-[#C3C8CC] text-[#25394E] text-xs px-2 py-1 rounded-md whitespace-nowrap">
            View on Solscan
            <div className="absolute top-full left-3 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TransactionDetailClient({
  docId,
  initialTransactionData,
  isModal = false,
  onClose,
}: TransactionDetailClientProps) {
  const [tipsData, setTipsData] = useState<Tip[]>(
    initialTransactionData?.tips || []
  );
  const [memeData, setMemeData] = useState<Meme | null>(
    initialTransactionData?.meme || null
  );
  const [isLoading, setIsLoading] = useState(!initialTransactionData);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [hoveredTxId, setHoveredTxId] = useState<string | null>(null);
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);

  const { solPrice, chonkerPrice } = usePrice();


  const [earning, setEarning] = useState(() => {
    if (!initialTransactionData) return 0;
    return initialTransactionData.tips.reduce((sum: number, tip: Tip) => {
      const livePrice = tip.token === "SOL" ? solPrice : chonkerPrice;
      return sum + tip.amount * livePrice;
    }, 0);
  });


  useEffect(() => {
    if (tipsData.length > 0) {
      const totalUsd = tipsData.reduce((sum: number, tip: Tip) => {
        const livePrice = tip.token === "SOL" ? solPrice : chonkerPrice;
        return sum + tip.amount * livePrice;
      }, 0);
      setEarning(totalUsd);
    }
  }, [tipsData, solPrice, chonkerPrice]);



  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareTooltip(true);
        setIsShared(true);

        setTimeout(() => {
          setShareTooltip(false);
          setIsShared(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  };


  const ShareButton = () => (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors ${
          isShared ? "text-green-400" : "text-gray-300 hover:text-white"
        }`}
        aria-label="Share"
      >
        {isShared ? (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
          </svg>
        )}
      </button>

      {shareTooltip && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          URL copied!
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!memeData || tipsData.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          No transaction data found.
        </p>
      </div>
    );
  }


  return (
    <div className=" px-4 w-full flex justify-center">
      <div className="relative border border-[#152D2D] py-6 w-full max-w-7xl 2xl:max-w-[1600px] 2xl:py-6 mx-4 bg-[#0C1219] rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex mb-8 lg:mb-0 sticky top-0 left-0 bg-[#0C1219] z-20 w-full">
          <div className="pl-6 -mb-[26px]">
            <h1 className="text-[#FFFFFF] font-bold text-[24px] 2xl:text-[28px]">
              Meme Earnings
            </h1>
            <span className="flex flex-row items-baseline gap-1">
              <span className="text-[14px] 2xl:text-[16px] text-[#ffffff] font-medium">
                Receiver Address
              </span>
              <span className="inline-flex items-center text-[12px] 2xl:text-[14px] text-[#C3C8CC]">
                <span>
                  {memeData && memeData.wallet
                    ? truncateString(memeData.wallet)
                    : "Address not available"}
                </span>
                {memeData && memeData.wallet && (
                  <span className="inline-flex ml-1 z-20">
                    <CopyButton text={memeData.wallet} />
                  </span>
                )}
              </span>
            </span>
          </div>

          <div className="absolute -top-[15px] lg:-top-[20px] right-3 z-30 flex items-center gap-3">
            <ShareButton />
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-full cursor-pointer bg-[#152D2D] hover:bg-[#1D3C3C] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-[#C3C8CC]" />
              </button>
            )}
          </div>
        </div>


        <div className="px-6 py- md:flex gap-10 flex-nowrap">
          <div className="hidden md:flex font-Roboto flex-col w-[30%] gap-0">
            <div className="w-full mt-[26px] z-20 shadow-[0_3px_5px_rgba(0,96,57,0.5)]">
              {memeData && (
                <div className="overflow-hidden">
                  <TransactionsMedia meme={memeData} />
                </div>
              )}
            </div>


            <div className="flex justify-center w-full">
              <div className="inline-block px-6 py-2 text-[16px] font-semibold -mt-[1px] text-[#86EFAC] bg-[#152D2D] rounded-b-[20px] relative overflow-visible">
                Earnings:&nbsp;
                <motion.span
                  className="inline-block"
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 30,
                    delay: 0.2,
                  }}
                >
                  ${earning.toFixed(4)}
                </motion.span>
              </div>
            </div>
          </div>

          <div className="w-fit overflow-x-auto 2xl:overflow-x-visible">
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto shadow-[4px_4px_7px_rgba(0,0,0,0.4)]">
              <table className="min-w-full overflow-hidden">
                <thead className="bg-transparent">
                  <tr className="text-[12px] 2xl:text-[14px] font-Roboto text-[#C3C8CC] tracking-wider">
                    <th className="px-4 py-1 text-left font-normal">#</th>
                    <th className="px-4 py-1 text-left font-normal">
                      Timestamp
                    </th>
                    <th className="px-4 py-1 text-left font-normal">
                      Transaction ID
                    </th>
                    <th className="px-4 py-1 text-left font-normal">
                      Sender Address
                    </th>
                    <th className="px-4 py-1 text-left font-normal">
                      Username
                    </th>
                    <th className="px-4 py-1 text-left font-normal">Amount</th>
                    <th className="px-4 py-1 text-left font-normal flex 2xl:hidden whitespace-nowrap">
                      Fiat (VAS)
                    </th>
                    <th className="px-4 py-1 text-left font-normal hidden 2xl:flex whitespace-nowrap">
                      Fiat Value at Send
                    </th>
                    <th className="px-4 py-1 2xl:hidden font-normal text-left whitespace-nowrap">
                      Value Now
                    </th>
                    <th className="px-4 py-1 hidden font-normal 2xl:table-cell text-left whitespace-nowrap">
                      Fiat Value Now
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-[#202933]/40 rounded-3px">
                  {tipsData.map((tip, index) => {
                    const livePrice =
                      tip.token === "SOL" ? solPrice : chonkerPrice;
                    return (
                      <tr
                        key={tip.transactionId || index}
                        className={`py-6 hover:bg-[#202933] ${
                          index !== tipsData.length - 1
                            ? "border-b border-[#C3C8CC]/10"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-5 text-[#ffffff] font-Roboto text-[14px] 2xl:text-[18px]">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          {formatTimestamp(tip.timestamp)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-row items-center gap-3">
                            <SolscanTooltip
                              show={hoveredTxId === tip.transactionId}
                            >
                              <a
                                href={getSolscanUrl(tip.transactionId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group text-[14px] 2xl:text-[18px] cursor-pointer overflow-x-auto whitespace-nowrap flex scrollbar-thin font-mono text-[#364097] hover:text-[#7FB4FA] datahide-scrollbar"
                                onMouseEnter={() =>
                                  setHoveredTxId(tip.transactionId)
                                }
                                onMouseLeave={() => setHoveredTxId(null)}
                              >
                                <span className="inline-block min-w-full truncate">
                                  {truncateString(tip.transactionId)}
                                </span>
                              </a>
                            </SolscanTooltip>
                            <div>
                              <CopyButton text={tip.transactionId || "N/A"} />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-row items-center gap-3">
                            <SolscanTooltip show={hoveredAddress === tip.from}>
                              <a
                                href={getSolscanAccount(tip.from)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group text-[14px] 2xl:text-[18px] cursor-pointer text-[#C3C8CC] hover:text-[#FFFFFF] max-w-[120px] overflow-x-auto whitespace-nowrap scrollbar-thin font-mono datahide-scrollbar"
                                onMouseEnter={() => setHoveredAddress(tip.from)}
                                onMouseLeave={() => setHoveredAddress(null)}
                              >
                                <span className="inline-block min-w-full">
                                  {truncateString(tip.from)}
                                </span>
                              </a>
                            </SolscanTooltip>
                            <div>
                              <CopyButton text={tip.from} />
                            </div>
                          </div>
                        </td>

                        <td
                          className="px-4 py-3 text-[14px] 2xl:text-[18px] cursor-pointer text-[#C3C8CC] hover:text-[#ffffff] hover:underline relative group"
                          onClick={() =>
                            handleUsernameClick(tip.username || "Anonymous")
                          }
                        >
                          {tip.username || "Anonymous"}


                          {tip.username && tip.username !== "Anonymous" && (
                            <div className="absolute font-semibold -mb-4 bottom-full left-0 px-2 py-1 bg-[#C3C8CC] text-[#25394E] text-[12px] 2xl:text-[12px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                              View {tip.username} posts
                              <div className="absolute top-full left-3 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[14px] 2xl:text-[18px] text-[#ffffff]">
                          <div className="flex gap-[2px] items-center">
                            <Currencylogo />
                            {tip.amount}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#ffffff] text-center font-Roboto text-[14px] 2xl:text-[18px]">
                          {tip.priceAtSend
                            ? `$${(
                                parseFloat(tip.amount.toString()) *
                                tip.priceAtSend
                              ).toFixed(2)}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-[#ffffff] font-Roboto text-center text-[14px] 2xl:text-[18px]">
                          $
                          {(
                            parseFloat(tip.amount.toString()) * livePrice
                          ).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


