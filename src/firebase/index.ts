'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

const CLIENT_APP_NAME = 'qordia-client';

export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore; } {
  // Check if the uniquely named client app is already initialized.
  const existingApp = getApps().find(app => app.name === CLIENT_APP_NAME);

  if (existingApp) {
    // If it exists, get the services from it. This ensures we use the same client instance.
    return getSdks(existingApp);
  }

  // If it doesn't exist, initialize it for the first time with the explicit client config and unique name.
  const clientApp = initializeApp(firebaseConfig, CLIENT_APP_NAME);
  return getSdks(clientApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
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
