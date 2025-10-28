'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust this path to your Firebase config

interface MemeTagsProps {
  memeId: string;
}

const MemeTags: React.FC<MemeTagsProps> = ({ memeId }) => {
  const [tag, setTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTag = async () => {
      if (!memeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const memeDoc = await getDoc(doc(db, 'memes', memeId)); // Adjust collection name if different
        
        if (memeDoc.exists()) {
          const data = memeDoc.data();
          setTag(data.tag || null);
        } else {
          setError('Meme not found');
        }
      } catch (err) {
        console.error('Error fetching meme tag:', err);
        setError('Failed to load tag');
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [memeId]);

  // Don't render anything if loading
  if (loading) {
    return (
      <div className="mb-2">
        <div className="inline-block px-3 py-1 bg-gray-200 rounded-full animate-pulse">
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if error or no tag
  if (error || !tag || tag.trim() === '') {
    return null;
  }

  return (
    <div className="mb-2">
      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200 shadow-sm">
        #{tag}
      </div>
    </div>
  );
};

export default MemeTags;