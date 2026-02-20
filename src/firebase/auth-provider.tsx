
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useAuthStore } from '@/stores/auth-store';
import { UserProfile } from '@/lib/types';

async function syncUserProfileOnLogin(firestore: any, user: User): Promise<UserProfile> {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    const newUserProfile: Partial<UserProfile> = {
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
      role: 'customer',
      createdAt: Timestamp.now(),
    };
    await setDoc(userDocRef, newUserProfile, { merge: true });
    return { id: user.uid, ...newUserProfile } as UserProfile;
  }
  return { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, setUser, setAuthData, setIsLoading, clearAll } = useAuthStore();

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribeAuth();
  }, [auth, setUser]);

  useEffect(() => {
    if (!firestore || !user) {
      clearAll();
      return;
    }

    setIsLoading(true);

    let profileUnsubscribe: Unsubscribe | undefined;
    let tenantUnsubscribe: Unsubscribe | undefined;
    let planUnsubscribe: Unsubscribe | undefined;

    const setupListeners = async () => {
      // 1. Check for Platform Admin claim first
      const idTokenResult = await user.getIdTokenResult();
      if (idTokenResult.claims.platform_admin === true) {
        setAuthData({
          userProfile: { id: user.uid, email: user.email!, name: user.displayName || 'Admin', role: 'platform_admin' },
          tenant: null,
          plan: null,
        });
        return; // Stop here for platform admins
      }

      // 2. For non-admins, listen to user profile
      const profileRef = doc(firestore, 'users', user.uid);
      profileUnsubscribe = onSnapshot(profileRef, (profileSnap) => {
        if (!profileSnap.exists()) {
          // This can happen briefly on first login. syncUserProfile will create it.
          // Or if a user doc is deleted.
          syncUserProfileOnLogin(firestore, user).then(profile => {
            setAuthData({ userProfile: profile, tenant: null, plan: null });
          });
          return;
        }

        const userProfile = { id: profileSnap.id, ...profileSnap.data() } as UserProfile;
        const tenantId = userProfile.tenantId;

        // Clean up old tenant/plan listeners if tenantId changes
        if (tenantUnsubscribe) tenantUnsubscribe();
        if (planUnsubscribe) planUnsubscribe();

        if (!tenantId) {
          // User has no tenant, loading is complete for them
          setAuthData({ userProfile, tenant: null, plan: null });
          return;
        }

        // 3. User has a tenant, so listen to the tenant document
        const tenantRef = doc(firestore, 'tenants', tenantId);
        tenantUnsubscribe = onSnapshot(tenantRef, (tenantSnap) => {
          if (!tenantSnap.exists()) {
            setAuthData({ userProfile, tenant: null, plan: null });
            return;
          }

          const tenant = { id: tenantSnap.id, ...tenantSnap.data() } as any;
          const planId = tenant.planId;

          // Clean up old plan listener if planId changes
          if (planUnsubscribe) planUnsubscribe();

          if (!planId) {
            setAuthData({ userProfile, tenant, plan: null });
            return;
          }

          // 4. Tenant has a plan, so listen to the plan document
          const planRef = doc(firestore, 'subscription_plans', planId);
          planUnsubscribe = onSnapshot(planRef, (planSnap) => {
            const plan = planSnap.exists() ? { id: planSnap.id, ...planSnap.data() } as any : null;
            // This is the final step in the data chain, loading is complete.
            setAuthData({ userProfile, tenant, plan });
          });
        });
      }, (error) => {
          console.error("Error listening to user profile:", error);
          clearAll();
      });
    };

    setupListeners();

    // Cleanup function to unsubscribe from all listeners on unmount or user change
    return () => {
      if (profileUnsubscribe) profileUnsubscribe();
      if (tenantUnsubscribe) tenantUnsubscribe();
      if (planUnsubscribe) planUnsubscribe();
    };
  }, [firestore, user, setAuthData, setIsLoading, clearAll]);

  return <>{children}</>;
}
