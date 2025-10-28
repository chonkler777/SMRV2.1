import { notFound } from 'next/navigation';
import TransactionModalClient from './TransactionModalClient';
import type { Meme } from "@/Types";
import { adminDb } from '@/lib/firebase-admin';

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


async function fetchTransactionData(docId: string): Promise<TransactionData | null> {
  try {
    
    const tipsSnapshot = await adminDb
      .collection('tips')
      .where('memeId', '==', docId)
      .orderBy('timestamp', 'desc')
      .get();

    if (tipsSnapshot.empty) {
      return null;
    }

    const firstTipData = tipsSnapshot.docs[0].data();

    const tips = tipsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        transactionId: data.transactionId,
        from: data.senderWallet,
        amount: data.amount,
        token: data.token || 'CHONKER',
        timestamp: data.timestamp,
        priceAtSend: data.priceAtSend,
        username: data.senderUsername || 'Anonymous',
        message: data.message,
      };
    });

    const totalEarnings = tips.reduce((sum, tip) => {
      return sum + (tip.amount * (tip.priceAtSend || 0));
    }, 0);

    let walletAddress = firstTipData.recipientWallet;
    let thumbnailUrl = firstTipData.memeImageUrl;
    let blurDataURL = undefined;
    let memeTag = undefined;
    
    try {
      const memeDoc = await adminDb.collection('memescollection').doc(docId).get();
      if (memeDoc.exists) {
        const memeData = memeDoc.data();
        walletAddress = memeData?.wallet || firstTipData.recipientWallet;
        thumbnailUrl = memeData?.thumbnailUrl || firstTipData.memeImageUrl;
        blurDataURL = memeData?.blurDataURL;
        memeTag = memeData?.tag;
      }
    } catch (error) {
      console.error('⚠️ MODAL SERVER: Error fetching meme doc:', error);
    }

    

    return {
      meme: {
        id: docId,
        tag: memeTag || firstTipData.memeTitle,
        imageUrl: firstTipData.memeImageUrl,
        fileType: firstTipData.memeFileType?.startsWith('video') ? 'video' : 'image',
        wallet: walletAddress,
        thumbnailUrl: thumbnailUrl,
        blurDataURL: blurDataURL,
      } as Meme,
      tips,
      totalEarnings,
      tipCount: tips.length,
    };
  } catch (error) {
    console.error('❌ MODAL SERVER: Error fetching transaction data:', error);
    return null;
  }
}

export default async function TransactionModal({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  
  const transactionData = await fetchTransactionData(docId);
  
  if (!transactionData) {
    notFound();
  }


  return (
    <TransactionModalClient
      docId={docId}
      initialTransactionData={transactionData}
    />
  );
}


export const revalidate = 300;

