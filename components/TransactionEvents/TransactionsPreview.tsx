'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { formatRelativeTime } from '@/utils/timestamp';


// Type definitions
interface TipDocument {
  amount: number;
  memeFileType: string;
  memeId: string;
  memeImageUrl: string;
  memeTitle: string;
  message: string;
  migratedAt?: number;
  originalMemeDoc: string;
  priceAtSend: number;
  recipientWallet: string;
  senderUsername: string;
  senderWallet: string;
  timestamp: number;
  token: string;
  transactionId: string;
}

interface TransactionPreviewProps {
  docId: string;
  setSearchQuery: (query: string) => void;
}

const TransactionPreview: React.FC<TransactionPreviewProps> = ({ 
  docId, 
  setSearchQuery 
}) => {
  const [tips, setTips] = useState<TipDocument[]>([]);
  
  const handleUserClick = (username: string): void => {
    if (username === 'Anonymous' || !username) return;
    
    const searchParams = new URLSearchParams({
      query: username,
      searchBy: 'username'
    });

    const newUrl = `/?${searchParams.toString()}`;
    window.open(newUrl, '_blank');
  };

  useEffect(() => {
    if (!docId) return;

    // Query the tips collection where memeId matches the docId
    const tipsQuery = query(
      collection(db, 'tips'),
      where('memeId', '==', docId),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(tipsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedTips: TipDocument[] = snapshot.docs.map(doc => ({
        ...doc.data() as TipDocument
      }));

      setTips(fetchedTips);
    }, (error) => {
      console.error('Error fetching tips:', error);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [docId]);

  // Helper function to format timestamp using your utility
  const formatTimestamp = (timestamp: number): string => {
    return formatRelativeTime(timestamp);
  };

  if (!tips.length) {
    return (
      <p className="text-xs text-gray-500 px-4 py-2">
        No transactions
      </p>
    );
  }

  return (
    <div className="font-Roboto p-3 w-full h-full max-h-40 overflow-y-auto">
      {tips.map((tip: TipDocument, i: number) => {
        const timeAgo = formatTimestamp(tip.timestamp);

        return (
          <div
            key={`${tip.transactionId}-${i}`}
            className="mb-2 border-b-1 flex flex-row justify-center items-center border-[#C3C8CC]/10 pb-1 truncate"
          >
            <div className="flex items-center">
              <span 
                className="font-semibold flex text-[12px] text-[#C3C8CC] truncate cursor-pointer hover:underline"
                onClick={() => handleUserClick(tip.senderUsername)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleUserClick(tip.senderUsername);
                  }
                }}
              >
                {tip.senderUsername || 'Anonymous'}
              </span>
              <span className="mx-1 text-[#D9D9D9]">•</span>
              <span className="text-[#86EFAC] text-[12px] font-medium">
                {tip.priceAtSend && typeof tip.priceAtSend === 'number'
                  ? `+$${(tip.amount * tip.priceAtSend).toFixed(3)}`
                  : "N/A"}
              </span>
              <span className="mx-1 text-[#D9D9D9]">•</span>
              <span className="text-[#C3C8CC] text-[10px]">
                {timeAgo}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionPreview;









