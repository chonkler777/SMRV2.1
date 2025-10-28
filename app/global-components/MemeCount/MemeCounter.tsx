import { adminDb } from "@/lib/firebase-admin";
import { unstable_noStore as noStore } from 'next/cache';

async function fetchMemeCount(): Promise<number> {
    noStore();
    try {
      const memesRef = adminDb.collection("memescollection");
      const snapshot = await memesRef.count().get();
      return snapshot.data().count;
    } catch (err) {
      console.error("Failed to fetch meme count:", err);
      return 0;
    }
  }
  
  export default async function MemeCounter() {
    const memeCount = await fetchMemeCount();
    return <>{memeCount.toLocaleString()}</>;
  }