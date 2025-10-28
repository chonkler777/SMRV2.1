'use client';

import { useRouter } from 'next/navigation';
import TransactionDetailClient from '@/app/TransactionsData/[docId]/TransactionDetailClient';
import type { Meme } from "@/Types";

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

interface TransactionModalClientProps {
  docId: string;
  initialTransactionData: TransactionData | null; // ✅ Add | null

}

export default function TransactionModalClient({
  docId,
  initialTransactionData,
}: TransactionModalClientProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 "
      onClick={handleClose}
    >
      <div 
        className="lg:w-auto w-[100vw] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Reuse the same TransactionDetailClient component */}
        <TransactionDetailClient
          docId={docId}
          initialTransactionData={initialTransactionData}
          isModal={true}
          onClose={handleClose} 
        />
      </div>
    </div>
  );
}