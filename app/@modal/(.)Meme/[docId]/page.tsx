import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import MemeModalClient from "./MemeModalClient";



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


export default async function MemePage({ 
  params 
}: { 
  params: Promise<{ docId: string }> 
  
}) {
  const { docId } = await params;
  const initialMemeData = await fetchMemeData(docId);

  return <MemeModalClient docId={docId} initialMemeData={initialMemeData}  />;
}


export const revalidate = 300;
