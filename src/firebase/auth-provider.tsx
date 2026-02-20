
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
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
    setProfileData, 
    setIsUserLoading, 
    setIsProfileLoading, 
    clearAll 
  } = useAuthStore();

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsUserLoading(true);
      if (user) {
        setUser(user);
        setIsProfileLoading(true);
        const profile = await syncUserProfile(firestore, user);
        setProfileData({ userProfile: profile, tenant: null, plan: null });
        setIsUserLoading(false);
      } else {
        clearAll();
        setIsUserLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore, setUser, setProfileData, setIsUserLoading, setIsProfileLoading, clearAll]);

  const userProfile = useAuthStore(state => state.userProfile);
  const tenantId = userProfile?.tenantId;

  useEffect(() => {
    if (!firestore || !tenantId) {
        // If there's no tenantId, ensure tenant and plan are null
        if (useAuthStore.getState().tenant || useAuthStore.getState().plan) {
           setProfileData({ 
               userProfile: useAuthStore.getState().userProfile, 
               tenant: null, 
               plan: null 
            });
        }
        setIsProfileLoading(false);
        return;
    }

    const tenantRef = doc(firestore, 'tenants', tenantId);
    const unsubscribeTenant = onSnapshot(tenantRef, (tenantSnap) => {
        const tenantData = tenantSnap.exists() ? { ...tenantSnap.data(), id: tenantSnap.id } as Tenant : null;
        const currentStoreData = useAuthStore.getState();

        if (tenantData?.planId) {
            const planRef = doc(firestore, 'subscription_plans', tenantData.planId);
            const unsubscribePlan = onSnapshot(planRef, (planSnap) => {
                const planData = planSnap.exists() ? { ...planSnap.data(), id: planSnap.id } as SubscriptionPlan : null;
                setProfileData({ userProfile: currentStoreData.userProfile, tenant: tenantData, plan: planData });
                setIsProfileLoading(false);
            });
            return () => unsubscribePlan();
        } else {
            setProfileData({ userProfile: currentStoreData.userProfile, tenant: tenantData, plan: null });
            setIsProfileLoading(false);
        }
    });

    return () => unsubscribeTenant();

  }, [firestore, tenantId, setProfileData, setIsProfileLoading]);

  return <>{children}</>;
}
