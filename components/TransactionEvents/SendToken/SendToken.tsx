'use client'
import React, { useState} from "react";

import {
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppUser } from "@/Types";

import { useWallet } from "@/AuthContext/WalletProvider";
import {
  Commitment,
  Connection,
  PublicKey,
  Transaction,
  ParsedAccountData,

} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from "@solana/spl-token";

type SendTokenProps = {
  recipient: string;
  docId: string;
  currentUser: AppUser | null; 
  onAuthRequired: () => void;
  memeId: string;
  memeTitle?: string;
  memeImageUrl?: string;
  memeThumbnailUrl?: string;
  memeFileType?: string;
};
import { usePrice } from "@/context/ChonkPrice";

export default function SendToken({
  recipient,
  docId,
  currentUser,
  onAuthRequired,
  memeId,
  memeTitle,
  memeImageUrl,
  memeThumbnailUrl,
  memeFileType,
}: SendTokenProps) {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const wallet = address ? new PublicKey(address) : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>("1");
  const [sliderValue, setSliderValue] = useState<number>(50);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { solPrice, chonkerPrice } = usePrice();
  const { open } = useWallet();

  
  const MIN_VALUE = 0.0001;
  const MAX_VALUE = 6900000;

  const sliderToValue = (sliderPos: number): number => {
    if (sliderPos === 0) return 1;
    if (sliderPos <= 12.5) return Math.round(1 + (sliderPos / 12.5) * 9); 
    if (sliderPos <= 25) return Math.round(10 + ((sliderPos - 12.5) / 12.5) * 90); 
    if (sliderPos <= 37.5) return Math.round(100 + ((sliderPos - 25) / 12.5) * 900); 
    if (sliderPos <= 50) return Math.round(1000 + ((sliderPos - 37.5) / 12.5) * 9000); 
    if (sliderPos <= 62.5) return Math.round(10000 + ((sliderPos - 50) / 12.5) * 90000); 
    if (sliderPos <= 75) return Math.round(100000 + ((sliderPos - 62.5) / 12.5) * 900000); 
    if (sliderPos <= 100) return Math.round(1000000 + ((sliderPos - 75) / 25) * 5900000); 
    return MAX_VALUE;
  };

  const valueToSlider = (value: number): number => {
    const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));
    
    if (clampedValue <= 10) return (clampedValue - 1) / 9 * 12.5;
    if (clampedValue <= 100) return 12.5 + ((clampedValue - 10) / 90) * 12.5;
    if (clampedValue <= 1000) return 25 + ((clampedValue - 100) / 900) * 12.5;
    if (clampedValue <= 10000) return 37.5 + ((clampedValue - 1000) / 9000) * 12.5;
    if (clampedValue <= 100000) return 50 + ((clampedValue - 10000) / 90000) * 12.5;
    if (clampedValue <= 1000000) return 62.5 + ((clampedValue - 100000) / 900000) * 12.5;
    return 75 + ((clampedValue - 1000000) / 5900000) * 25;
  };

  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = Number(e.target.value);
    setSliderValue(newSliderValue);
    const newAmount = sliderToValue(newSliderValue);
    setAmount(Math.round(newAmount).toString());
  };

  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    
    const numericValue = Number(newAmount);
    if (!isNaN(numericValue) && numericValue > 0 && newAmount.trim() !== '') {
      setSliderValue(valueToSlider(numericValue));
    }

  };

  const handleOpenModal = async () => {

    if (!currentUser) {

      onAuthRequired();
      return;
    }

    
    if (!wallet || !walletProvider) {
      try {
        await open();
        return;
      } catch (error) {
        console.error("Error opening wallet connector:", error);

        setShowWalletModal(true);
        return;
      }
    }

    setAmount("69");
    setSliderValue(valueToSlider(69));
    setIsModalOpen(true);
  };

  const handleCloseAllModals = () => {
    setIsModalOpen(false);
    setShowSuccessModal(false);
  };

  const formatNumber = (num: number): string => {
    if (num < 1) {
      // For small numbers, show more decimal places
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6
      });
    }
    return num.toLocaleString();
  };

  const handleTransfer = async () => {
    const commitment: Commitment = "processed";
    const parsedAmount = Number(amount);
    if (!wallet || !walletProvider || parsedAmount <= 0) return;


    try {
      setLoading(true);
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
        { commitment }
      );

      const tokenMintAccount = new PublicKey(
        "ChoNKscpdU3hPd1N3q8a3FPvPcuj5fsg1dA5WnHbTvZV"
      );
      const to = new PublicKey(recipient);

      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenMintAccount,
        wallet,
        true
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        tokenMintAccount,
        to,
        true
      );

      const tx = new Transaction();

      const toInfo = await connection.getAccountInfo(toTokenAccount);
      if (!toInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            wallet,
            toTokenAccount,
            to,
            tokenMintAccount
          )
        );
      }

      const mintInfo = await connection.getParsedAccountInfo(tokenMintAccount);
      const decimals =
        (mintInfo.value?.data as ParsedAccountData)?.parsed?.info?.decimals ||
        0;
      const amountInSmallestUnit = parsedAmount * Math.pow(10, decimals);

      tx.add(
        createTransferCheckedInstruction(
          senderTokenAccount,
          tokenMintAccount,
          toTokenAccount,
          wallet,
          amountInSmallestUnit,
          decimals
        )
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = wallet;

      const signature = await walletProvider.signAndSendTransaction(tx);

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        commitment
      );


      const tipRequestData = {
        recipientWallet: recipient,
        senderWallet: address,
        senderUsername: currentUser?.username || 'Anonymous',
        memeId: memeId,
        memeTitle: memeTitle || 'Untitled Meme',
        memeImageUrl: memeImageUrl || '',
        memeThumbnailUrl: memeThumbnailUrl || memeImageUrl || '',
        memeFileType: memeFileType || 'image/jpeg',
        amount: parsedAmount,
        priceAtSend: chonkerPrice || 0,
        timestamp: Date.now(),
        transactionId: signature || "unknown",
        token: "CHONK",
        message: `Tipped ${parsedAmount} CHONK`,
        
      };


      const tipResponse = await fetch('/api/notifications/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipRequestData),
      });

      if (!tipResponse.ok) {
        let errorMessage = `HTTP error! status: ${tipResponse.status}`;
        try {
          const errorData = await tipResponse.json();
          errorMessage = `Failed to save tip: ${errorData.error || errorData.message}`;
        } catch (parseError) {
          errorMessage = `Failed to save tip - API endpoint may not exist (${tipResponse.status})`;
        }
        throw new Error(errorMessage);
      }

      const tipResult = await tipResponse.json();

      setIsModalOpen(false);

      const triggerTipToast = (recipient: string, amount: string) => {
        toast(
          ({ closeToast }) => (
            <div className="text-md text-black font-Roboto ">
              🎉 Successfully tipped <strong>{formatNumber(Number(amount))} CHONK</strong> to{" "}
              <span
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(recipient);
                    toast.success("Copied to clipboard!");
                    closeToast();
                  } catch (err) {
                    console.error("Copy failed", err);
                  }
                }}
                className="inline-flex items-center gap-1 text-blue-500 text-md cursor-pointer hover:text-blue-700"
              >
                {shortenAddress(recipient)}
              </span>
            </div>
          ),
          { autoClose: 5000 }
        );
      };

      triggerTipToast(recipient, amount);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr: string) =>
    addr.slice(0, 4) + "..." + addr.slice(-4);

  return (
    <>
      <button
        className="py-1 flex items-center cursor-pointer text-[#86EFAC]/80 hover:text-[#86EFAC] transition duration-100 gap-1 group"
        onClick={handleOpenModal}
      >
        <span className="group-hover:fill-[#86EFAC] fill-[#86EFAC]/80 transition duration-100">
          <svg
            width="19"
            height="19"
            viewBox="0 0 19 19"
            
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 1.9C13.7348 1.9 13.4804 1.79991 13.2929 1.62175C13.1054 1.44359 13 1.20196 13 0.95C13 0.698044 13.1054 0.456408 13.2929 0.278249C13.4804 0.100089 13.7348 0 14 0H18C18.2652 0 18.5196 0.100089 18.7071 0.278249C18.8946 0.456408 19 0.698044 19 0.95V4.75C19 5.00196 18.8946 5.24359 18.7071 5.42175C18.5196 5.59991 18.2652 5.7 18 5.7C17.7348 5.7 17.4804 5.59991 17.2929 5.42175C17.1054 5.24359 17 5.00196 17 4.75V3.2433L11.207 8.74665C11.0195 8.92475 10.7652 9.0248 10.5 9.0248C10.2348 9.0248 9.98053 8.92475 9.793 8.74665L7 6.0933L1.707 11.1216C1.5184 11.2947 1.2658 11.3905 1.0036 11.3883C0.741402 11.3861 0.49059 11.2862 0.305182 11.1101C0.119773 10.9339 0.0146044 10.6957 0.012326 10.4466C0.0100476 10.1975 0.110842 9.95752 0.293 9.77835L6.293 4.07835C6.48053 3.90025 6.73484 3.8002 7 3.8002C7.26516 3.8002 7.51947 3.90025 7.707 4.07835L10.5 6.7317L15.586 1.9H14ZM2 15.2V18.05C2 18.302 1.89464 18.5436 1.70711 18.7218C1.51957 18.8999 1.26522 19 1 19C0.734783 19 0.48043 18.8999 0.292893 18.7218C0.105357 18.5436 0 18.302 0 18.05V15.2C0 14.948 0.105357 14.7064 0.292893 14.5282C0.48043 14.3501 0.734783 14.25 1 14.25C1.26522 14.25 1.51957 14.3501 1.70711 14.5282C1.89464 14.7064 2 14.948 2 15.2ZM7 11.4C7 11.148 6.89464 10.9064 6.70711 10.7282C6.51957 10.5501 6.26522 10.45 6 10.45C5.73478 10.45 5.48043 10.5501 5.29289 10.7282C5.10536 10.9064 5 11.148 5 11.4V18.05C5 18.302 5.10536 18.5436 5.29289 18.7218C5.48043 18.8999 5.73478 19 6 19C6.26522 19 6.51957 18.8999 6.70711 18.7218C6.89464 18.5436 7 18.302 7 18.05V11.4ZM11 12.35C11.2652 12.35 11.5196 12.4501 11.7071 12.6282C11.8946 12.8064 12 13.048 12 13.3V18.05C12 18.302 11.8946 18.5436 11.7071 18.7218C11.5196 18.8999 11.2652 19 11 19C10.7348 19 10.4804 18.8999 10.2929 18.7218C10.1054 18.5436 10 18.302 10 18.05V13.3C10 13.048 10.1054 12.8064 10.2929 12.6282C10.4804 12.4501 10.7348 12.35 11 12.35ZM17 8.55C17 8.29804 16.8946 8.05641 16.7071 7.87825C16.5196 7.70009 16.2652 7.6 16 7.6C15.7348 7.6 15.7348 7.6 15.2929 7.87825C15.1054 8.05641 15 8.29804 15 8.55V18.05C15 18.302 15.1054 18.5436 15.2929 18.7218C15.4804 18.8999 15.7348 19 16 19C16.2652 19 16.5196 18.8999 16.7071 18.7218C16.8946 18.5436 17 18.302 17 18.05V8.55Z"
              
            />
          </svg>
        </span>
        Vote
      </button>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        onClick={handleCloseAllModals}
        >
          <div className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-sm shadow-xl text-center relative"
          onClick={(e) => e.stopPropagation()}
          >
            
            <p className="absolute top-4 left-4 text-gray-400 text-sm">
              CHONK: {" "}
              {chonkerPrice ? `$${chonkerPrice.toFixed(8)}` : "Loading..."}
            </p>

            <div className="text-white my-5 mt-8">
              <p className="text-4xl text-gray-200">
                {chonkerPrice && amount
                  ? `$${(Number(amount) * chonkerPrice).toFixed(6)}`
                  : "$0.00"}
              </p>
            </div>


            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{formatNumber(MIN_VALUE)} CHONK</span>
                <span>{formatNumber(MAX_VALUE)} CHONK</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderValue}%, #d1d5db ${sliderValue}%, #d1d5db 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>10</span>
                <span>100</span>
                <span>1K</span>
                <span>10K</span>
                <span>100K</span>
                <span>1M</span>
                <span>6.9M</span>
              </div>
            </div>

            <input
              type="number"
              min={MIN_VALUE}
              step="1"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-2 mb-4 border rounded-md text-center bg-gray-800 text-white"
              placeholder="Enter amount in CHONK"
            />

            <button
              onClick={handleTransfer}
              disabled={
                loading ||
                !amount ||
                isNaN(Number(amount)) ||
                Number(amount) < MIN_VALUE 
              }
              className="w-full py-2 bg-green-600 cursor-pointer text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : `Send ${formatNumber(Number(amount) || 0)} CHONK`}
            </button>

            <button
              onClick={handleCloseAllModals}
              className="mt-4 text-sm cursor-pointer text-gray-300 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #10b981;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #10b981;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `
      }} />
    </>
  );
}




