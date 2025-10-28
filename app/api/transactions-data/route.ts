import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const memeId = request.nextUrl.searchParams.get('memeId');

  if (!memeId) {
    return NextResponse.json({ error: 'MemeId required' }, { status: 400 });
  }


  try {
    const tipsSnapshot = await adminDb
      .collection('tips')
      .where('memeId', '==', memeId)
      .orderBy('timestamp', 'desc')
      .get();


    if (tipsSnapshot.empty) {
      return NextResponse.json({ error: 'No tips found for this meme' }, { status: 404 });
    }

    const firstTipData = tipsSnapshot.docs[0].data();

    const tips = tipsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        transactionId: data.transactionId,
        from: data.senderWallet,
        amount: data.amount,
        token: data.token || 'CHONKER',
        timestamp: data.timestamp,
        priceAtSend: data.priceAtSend,
        username: data.senderUsername || 'Anonymous',
        message: data.message,
      };
    });


    const totalEarnings = tips.reduce((sum, tip) => {
      return sum + (tip.amount * (tip.priceAtSend || 0));
    }, 0);


    let walletAddress = firstTipData.recipientWallet;
    let thumbnailUrl = firstTipData.memeImageUrl;
    let blurDataURL = undefined;
    
    try {
      const memeDoc = await adminDb.collection('memescollection').doc(memeId).get();
      if (memeDoc.exists) {
        const memeData = memeDoc.data();
        walletAddress = memeData?.wallet || firstTipData.recipientWallet;
        thumbnailUrl = memeData?.thumbnailUrl || firstTipData.memeImageUrl;
        blurDataURL = memeData?.blurDataURL;
      }
    } catch (error) {
      
    }

    return NextResponse.json({
      meme: {
        id: memeId,
        title: firstTipData.memeTitle,
        imageUrl: firstTipData.memeImageUrl,
        fileType: firstTipData.memeFileType?.startsWith('video') ? 'video' : 'image',
        wallet: walletAddress,
        thumbnailUrl: thumbnailUrl,
        blurDataURL: blurDataURL,
      },
      tips,
      totalEarnings,
      tipCount: tips.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

