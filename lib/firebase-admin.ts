import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECTID,
      clientEmail: process.env.NEXT_FIREBASE_ADMIN_SDK,
      privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    
    storageBucket: `${process.env.FIREBASE_ADMIN_PROJECTID}.appspot.com`,
  });
}

export const adminDb = getFirestore();
export const adminStorage = getStorage();
export { FieldValue };

