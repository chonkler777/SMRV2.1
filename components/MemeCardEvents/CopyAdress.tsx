"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/public/assets/icons/CopyButton";
import PasteButton from "@/public/assets/icons/PasteButton";

interface CopyToClipboardProps {
  textToCopy: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isWalletAddress = textToCopy.length > 8;

  return (
    <div className="flex flex-row items-center gap-1">
      {isWalletAddress ? (
        <Link
          href={`https://solscan.io/account/${textToCopy}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group text-[#C3C8CC] hover:text-white cursor-pointer text-[10px] font-semibold no-underline"
        >
          {`${textToCopy.slice(0, 4)}...${textToCopy.slice(-4)}`}

          <div className="absolute font-semibold bottom-full left-[20px] px-2 py-1 bg-[#C3C8CC] text-[#25394E] text-[12px] 2xl:text-[16px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
            View on Solscan
            <div className="absolute top-full left-3 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
          </div>
        </Link>
      ) : (
        <span className="text-[#C3C8CC] hover:text-white text-[10px] font-semibold">
          {textToCopy}
        </span>
      )}

      {isWalletAddress && (
        <button
          onClick={copyText}
          className="relative group transition cursor-pointer"
          type="button"
          aria-label={copied ? "Copied!" : "Copy wallet address"}
        >
          <span className="">{copied ? <PasteButton /> : <CopyButton />}</span>

          <div className="absolute font-semibold bottom-full left-0 px-2 py-1 bg-[#C3C8CC] text-[#25394E] text-[12px] 2xl:text-[16px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
            {copied ? "Copied!" : "Copy address"}
            <div className="absolute top-full left-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#C3C8CC]"></div>
          </div>
        </button>
      )}
    </div>
  );
};

export default CopyToClipboard;
