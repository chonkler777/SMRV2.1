import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { wallet, username, clickedNotificationId } = await request.json();
    
    if (!wallet && !username) {
      return NextResponse.json({ error: 'Wallet or username required' }, { status: 400 });
    }


    const userDocId = wallet || username;
    const userRef = adminDb.collection('users').doc(userDocId);

    if (clickedNotificationId) {
      await userRef.set({
        clickedNotifications: FieldValue.arrayUnion(clickedNotificationId)
      }, { merge: true });
      
    } else {
      await userRef.set({
        lastReadNotifications: Date.now()
      }, { merge: true });
      
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
