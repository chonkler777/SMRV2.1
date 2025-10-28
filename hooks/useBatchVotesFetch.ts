'use client'
import { useEffect } from "react";
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser } from "@/Types";

interface UseBatchVotesFetchProps {
  currentUser: AppUser | null;
}

const useBatchVotesFetch = ({ currentUser }: UseBatchVotesFetchProps) => {
  
  useEffect(() => {
    const fetchAllUserVotes = async () => {
      if (!currentUser?.username) {
        clearVotesCache();
        return;
      }
      

      const lastFetched = localStorage.getItem('votesLastFetched');
      const lastFetchedUser = localStorage.getItem('lastFetchedUser');
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastFetched && 
          lastFetchedUser === currentUser.username && 
          parseInt(lastFetched) > oneHourAgo) {
        return;
      }

      
      try {

        clearVotesCache();

        const votesQuery = query(
          collectionGroup(db, 'votes'),
          where('voter', '==', currentUser.username) 
        );
        
        const snapshot = await getDocs(votesQuery);
        const votedMemeIds = new Set<string>();
        
        snapshot.forEach(doc => {

          const memeId = doc.ref.parent.parent?.id;
          if (memeId) {
            votedMemeIds.add(memeId);
          }
        });

        

        votedMemeIds.forEach(memeId => {
          localStorage.setItem(`upvotes_${memeId}`, 'true');
        });
        

        localStorage.setItem('votesLastFetched', Date.now().toString());
        localStorage.setItem('lastFetchedUser', currentUser.username);
        localStorage.setItem('userVotedMemes', JSON.stringify([...votedMemeIds]));
        
      } catch (error) {
        console.error('❌ Error batch fetching user votes:', error);
      }
    };


    fetchAllUserVotes();

  }, [currentUser?.username]); 


  const clearVotesCache = () => {

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('upvotes_') || 
          key === 'votesLastFetched' || 
          key === 'userVotedMemes' ||
          key === 'lastFetchedUser') {
        localStorage.removeItem(key);
      }
    });
    
  };

  return { clearVotesCache };
};

export default useBatchVotesFetch;

