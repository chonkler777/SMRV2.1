import { Timestamp } from "firebase/firestore";


export interface Meme {
    id: string; // Firestore document ID
    userId: string;
    timestamp: Timestamp | null;
    memeId: string;
    imageUrl: string;
    blurDataURL: string;
    thumbnailUrl: string;
    Type?: string;
    fileType?: string;
    title?: string;
    tag?: string;
    username: string;
    wallet: string;
    upvotes: number;
    docId: string;
    weekNumber?: number;
  
  }