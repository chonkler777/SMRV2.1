
import { Metadata } from "next";
import TransactionDetailClient from "./TransactionDetailClient";
import type { Meme } from "@/Types";
import { adminDb } from "@/lib/firebase-admin";

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


async function fetchTransactionData(
  docId: string
): Promise<TransactionData | null> {
  try {

    const tipsSnapshot = await adminDb
      .collection("tips")
      .where("memeId", "==", docId)
      .orderBy("timestamp", "desc")
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
        token: data.token || "CHONKER",
        timestamp: data.timestamp,
        priceAtSend: data.priceAtSend,
        username: data.senderUsername || "Anonymous",
        message: data.message,
      };
    });

    const totalEarnings = tips.reduce((sum, tip) => {
      return sum + tip.amount * (tip.priceAtSend || 0);
    }, 0);

    let walletAddress = firstTipData.recipientWallet;
    let thumbnailUrl = firstTipData.memeImageUrl;
    let blurDataURL = undefined;
    let memeTag = undefined; 

    try {
      const memeDoc = await adminDb
        .collection("memescollection")
        .doc(docId)
        .get();
      if (memeDoc.exists) {
        const memeData = memeDoc.data();
        walletAddress = memeData?.wallet || firstTipData.recipientWallet;
        thumbnailUrl = memeData?.thumbnailUrl || firstTipData.memeImageUrl;
        blurDataURL = memeData?.blurDataURL;
        memeTag = memeData?.tag; 
      }
    } catch (error) {
      console.error("⚠️ SERVER: Error fetching meme doc:", error);
    }


    return {
      meme: {
        id: docId,
        tag: memeTag || firstTipData.memeTitle, 
        imageUrl: firstTipData.memeImageUrl,
        fileType: firstTipData.memeFileType?.startsWith("video")
          ? "video"
          : "image",
        wallet: walletAddress,
        thumbnailUrl: thumbnailUrl,
        blurDataURL: blurDataURL,
      } as Meme,
      tips,
      totalEarnings,
      tipCount: tips.length,
    };
  } catch (error) {
    console.error("❌ SERVER: Error fetching transaction data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ docId: string }>;
}): Promise<Metadata> {
  const { docId } = await params;
  const transactionData = await fetchTransactionData(docId);

  if (!transactionData) {
    return {
      title: "Transactions - Chonkler",
      description: "View meme earnings and transaction details on Chonkler",
    };
  }

  const { meme, totalEarnings, tipCount } = transactionData;
  const pageUrl = `https://www.chonkler.com/transactions/${docId}`;

  const title = `${meme.tag || "Meme"} Earnings - Chonkler`;
  const description = `Earned $${totalEarnings.toFixed(
    2
  )} from ${tipCount} tip${tipCount !== 1 ? "s" : ""}`;

  const imageUrl =
    meme.fileType === "video"
      ? meme.thumbnailUrl || meme.imageUrl
      : meme.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: meme.tag || "Meme earnings",
        },
      ],
      url: pageUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;

  const initialTransactionData = await fetchTransactionData(docId);


  return (
    <div className="pt-28">
      <TransactionDetailClient
        docId={docId}
        initialTransactionData={initialTransactionData}
      />
    </div>
  );
}


export const revalidate = 300;











