import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');
  const username = request.nextUrl.searchParams.get('username');
  const cursor = request.nextUrl.searchParams.get('cursor');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

  if (!wallet && !username) {
    return NextResponse.json({ error: 'Wallet or username required' }, { status: 400 });
  }


  try {
    const fetchPromises = [];

    if (wallet) {
      fetchPromises.push(
        adminDb.collection('tips')
          .where('recipientWallet', '==', wallet)
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get()
      );
    } else {
      fetchPromises.push(Promise.resolve({ docs: [] }));
    }

    if (username) {
      fetchPromises.push(
        adminDb.collection('likes')
          .where('recipientUsername', '==', username)
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get()
      );
    } else {
      fetchPromises.push(Promise.resolve({ docs: [] }));
    }

    const [tipsSnapshot, likesSnapshot] = await Promise.all(fetchPromises);

    
    const tips = tipsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: `tip-${data.memeId}-${data.timestamp}-${data.senderWallet}`,
        type: 'tip',
        memeId: data.memeId,
        memeTitle: data.memeTitle,
        imageUrl: data.memeImageUrl,
        thumbnailUrl: data.memeThumbnailUrl || data.memeImageUrl,
        fileType: data.memeFileType,
        priceAtSend: data.priceAtSend,
        from: data.senderWallet,
        amount: data.amount,
        timestamp: data.timestamp,
        message: data.message,
        senderUsername: data.senderUsername
      };
    });


    const likes = likesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: `like-${data.memeId}-${data.timestamp}-${data.likerUsername}`,
        type: 'like',
        memeId: data.memeId,
        memeTitle: data.memeTitle,
        imageUrl: data.memeImageUrl,
        thumbnailUrl: data.memeThumbnailUrl || data.memeImageUrl,
        fileType: data.memeFileType,
        from: data.likerUsername,
        timestamp: data.timestamp,
        likerUsername: data.likerUsername
      };
    });


    let allNotifications = [...tips, ...likes].sort((a, b) => b.timestamp - a.timestamp);


    if (cursor) {
      const cursorTimestamp = parseInt(cursor);
      allNotifications = allNotifications.filter(n => n.timestamp < cursorTimestamp);
    }

    const hasMore = allNotifications.length > limit;
    const paginatedNotifications = allNotifications.slice(0, limit);
    const nextCursor = paginatedNotifications.length > 0 
      ? paginatedNotifications[paginatedNotifications.length - 1].timestamp.toString() 
      : null;


    let unreadCount = 0;
    let clickedNotifications: string[] = [];
    
    if (!cursor) {
      const userDocId = wallet || username || '';
      const userDoc = await adminDb.collection('users').doc(userDocId).get();
      const userData = userDoc.data();
      
      const lastReadTimestamp = userData?.lastReadNotifications 
        ? (userData.lastReadNotifications._seconds * 1000) 
        : 0;
      
      clickedNotifications = userData?.clickedNotifications || [];
    
    
      unreadCount = allNotifications.filter(n => n.timestamp > lastReadTimestamp).length;
      
    }

    return NextResponse.json({ 
      notifications: paginatedNotifications,
      hasMore,
      nextCursor,
      unreadCount: cursor ? undefined : unreadCount,
      clickedNotifications: cursor ? undefined : clickedNotifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}



