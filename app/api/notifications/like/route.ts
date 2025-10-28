import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const {
      memeId,
      memeOwnerUsername,
      likerUsername,
      memeTitle,
      memeImageUrl,
      memeThumbnailUrl,
      memeFileType,
      timestamp
    } = await request.json();

    if (!memeId || !memeOwnerUsername || !likerUsername) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (memeOwnerUsername === likerUsername) {
      return NextResponse.json({ 
        success: true, 
        message: 'Self-like, no notification sent' 
      });
    }


    const likeNotification = {
      type: 'like',
      memeId,
      memeTitle: memeTitle || 'Untitled',
      memeImageUrl: memeImageUrl || '',
      memeFileType: memeFileType || 'image/jpeg',
      memeThumbnailUrl: memeThumbnailUrl || memeImageUrl || '',
      recipientUsername: memeOwnerUsername,
      likerUsername,
      timestamp: timestamp || Date.now(),
      read: false
    };


    await adminDb.collection('likes').add(likeNotification);


    return NextResponse.json({ 
      success: true,
      message: 'Like notification created'
    });

  } catch (error) {
    console.error('Error creating like notification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create notification', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}


