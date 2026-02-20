
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useAuthStore } from '@/stores/auth-store';
import { UserProfile, Tenant, SubscriptionPlan } from '@/lib/types';

async function syncUserProfile(firestore: any, user: User) {
  if (!user) return null;
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
    return { ...newUserProfile, id: user.uid } as UserProfile;
  }
  return { ...userDocSnap.data(), id: userDocSnap.id } as UserProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { 
    setUser, 
    setUserProfile,
    setTenant,
    setPlan,
    setIsUserLoading, 
    setIsProfileLoading, 
    clearAll 
  } = useAuthStore();
  
  const userProfile = useAuthStore(state => state.userProfile);
  const tenant = useAuthStore(state => state.tenant);
  const tenantId = userProfile?.tenantId;
  const planId = tenant?.planId;

  // Effect for handling Firebase Authentication state changes
  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsUserLoading(true);
      if (user) {
        setUser(user);
        setIsProfileLoading(true);

        const profile = await syncUserProfile(firestore, user);
        
        const idTokenResult = await user.getIdTokenResult();
        if (profile && idTokenResult.claims.platform_admin === true) {
            profile.role = 'platform_admin';
        }
        
        setUserProfile(profile);
        setIsUserLoading(false);
      } else {
        clearAll();
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore, setUser, setUserProfile, setIsUserLoading, setIsProfileLoading, clearAll]);

  // Effect for fetching Tenant data based on the user's profile
  useEffect(() => {
    if (!firestore || !tenantId) {
      setTenant(null);
      return;
    }
    setIsProfileLoading(true);
    const tenantRef = doc(firestore, 'tenants', tenantId);
    const unsubscribe = onSnapshot(tenantRef, (snap) => {
      const tenantData = snap.exists() ? { ...snap.data(), id: snap.id } as Tenant : null;
      setTenant(tenantData);
      // Let the plan effect handle setting loading to false
    });
    return () => unsubscribe();
  }, [firestore, tenantId, setTenant, setIsProfileLoading]);

  // Effect for fetching Plan data, which depends on the tenant's planId
  useEffect(() => {
    if (!firestore || !planId) {
      setPlan(null);
      setIsProfileLoading(false); // If no planId, loading is finished
      return;
    }
    // Loading is already true from the tenant effect
    const planRef = doc(firestore, 'subscription_plans', planId);
    const unsubscribe = onSnapshot(planRef, (snap) => {
      const planData = snap.exists() ? { ...snap.data(), id: snap.id } as SubscriptionPlan : null;
      setPlan(planData);
      setIsProfileLoading(false); // Loading is complete once the plan is fetched (or not found)
    });
    return () => unsubscribe();
  }, [firestore, planId, setPlan, setIsProfileLoading]);


  return <>{children}</>;
}
