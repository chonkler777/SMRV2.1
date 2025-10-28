import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import MemeDetailClient from "./MemeDetailClient";

interface MemeData {
  id: string;
  docId: string;
  userId: string;
  imageUrl: string;
  username: string;
  tag: string;
  wallet: string;
  timestamp: string | null;
  upvotes: number;
  downvotes: number;
  views: number;
  memeId: string;
  fileType: string;
  blurDataURL: string;
  thumbnailUrl: string;
}

// Helper function to fetch meme data
async function fetchMemeData(docId: string): Promise<MemeData | null> {
  try {
    const memeDocRef = doc(db, "memescollection", docId);
    const memeDoc = await getDoc(memeDocRef);

    if (memeDoc.exists()) {
      const data = memeDoc.data();
      
      let timestampString: string | null = null;
      if (data.timestamp) {
        if (data.timestamp.seconds) {
          timestampString = new Date(data.timestamp.seconds * 1000).toISOString();
        } else if (data.timestamp instanceof Date) {
          timestampString = data.timestamp.toISOString();
        } else if (typeof data.timestamp === 'string') {
          timestampString = data.timestamp;
        }
      }

      const { thumbnailGeneratedAt, ...restData } = data;

      return {
        ...restData,
        id: docId,
        docId: docId,
        userId: data.userId || docId || "",
        blurDataURL: data.blurDataURL || "",
        thumbnailUrl: data.thumbnailUrl || "",
        timestamp: timestampString,
      } as MemeData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching meme:", error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ docId: string }> 
}): Promise<Metadata> {
  const { docId } = await params;
  const memeData = await fetchMemeData(docId);

  if (!memeData) {
    return {
      title: "Meme - Chonkler",
      description: "Check out this meme on Chonkler",
    };
  }

  const pageUrl = `https://www.chonkler.com/meme/${docId}`;
  const title = `${memeData.tag || "Meme"} - Chonkler`;
  const description = `Created by ${memeData.username}. Check out this meme!`;
  
  const imageUrl = memeData.fileType === 'video' 
    ? (memeData.thumbnailUrl || memeData.imageUrl) 
    : memeData.imageUrl;

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
          alt: memeData.tag || "Meme",
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

export default async function MemePage({ 
  params 
}: { 
  params: Promise<{ docId: string }> 
}) {
  const { docId } = await params;
  const initialMemeData = await fetchMemeData(docId);

  return <MemeDetailClient docId={docId} initialMemeData={initialMemeData} />;
}

// Add ISR - Cache for 5 minutes
export const revalidate = 300;









