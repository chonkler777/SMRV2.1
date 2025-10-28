import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      recipientWallet,
      senderWallet,
      senderUsername,
      memeId,
      memeTitle,
      memeImageUrl,
      memeThumbnailUrl,
      memeFileType,
      amount,
      priceAtSend,
      timestamp,
      transactionId,
      token,
      message
    } = body;

    if (!recipientWallet || !senderWallet || !memeId || !amount || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tipData = {
      recipientWallet,
      senderWallet,
      senderUsername: senderUsername || 'Anonymous',
      memeId,
      memeTitle: memeTitle || 'Untitled Meme',
      memeImageUrl: memeImageUrl || '',
      memeThumbnailUrl: memeThumbnailUrl || memeImageUrl || '',
      memeFileType: memeFileType || 'image/jpeg',
      amount: Number(amount),
      priceAtSend: Number(priceAtSend) || 0,
      timestamp: timestamp || Date.now(),
      transactionId,
      token: token || 'CHONK',
      message: message || `Tipped ${amount} ${token || 'CHONK'}`,
      createdAt: Date.now(),
      read: false, 
    };


    const tipDoc = await adminDb.collection('tips').add(tipData);


    try {
      await adminDb.collection('memescollection').doc(memeId).update({
        hasTips: true,
        lastTipAt: Date.now(), 
      });

    } catch (updateError) {
      console.error('⚠️ Failed to update meme hasTips flag:', updateError);
    }


    return NextResponse.json({
      success: true,
      tipId: tipDoc.id,
      message: 'Tip created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating tip:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
