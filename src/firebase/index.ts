'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const CLIENT_APP_NAME = 'qordia-client';
let clientApp: FirebaseApp | null = null;
let clientAuth: Auth | null = null;
let clientFirestore: Firestore | null = null;

function initializeClientFirebase() {
  if (!clientApp) {
    const existingApp = getApps().find(app => app.name === CLIENT_APP_NAME);
    if (existingApp) {
      clientApp = existingApp;
    } else {
      clientApp = initializeApp(firebaseConfig, CLIENT_APP_NAME);
    }
    clientAuth = getAuth(clientApp);
    clientFirestore = getFirestore(clientApp);
  }
}

export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore; } {
  initializeClientFirebase();
  return {
    firebaseApp: clientApp!,
    auth: clientAuth!,
    firestore: clientFirestore!,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user-claims';
