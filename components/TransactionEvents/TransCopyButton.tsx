"use client"

import { useState } from "react";
import TransIdCopy from "@/public/assets/icons/TransIdCopy";
import TransIdDone from "@/public/assets/icons/TransIdDone";


interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-blue-500 cursor-pointer hover:text-blue-700 text-sm p-1"
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? <TransIdDone/> : <TransIdCopy />}
    </button>
  );
};

export default CopyButton;