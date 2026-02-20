
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
    setTenantAndPlan,
    setIsUserLoading, 
    setIsProfileLoading, 
    clearAll 
  } = useAuthStore();
  
  const userProfile = useAuthStore(state => state.userProfile);
  const tenantId = userProfile?.tenantId;

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsUserLoading(true);
      if (user) {
        setUser(user);
        setIsProfileLoading(true);

        const profile = await syncUserProfile(firestore, user);
        
        // This makes the security claim the single source of truth for platform admin status.
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


  useEffect(() => {
    if (!firestore || !tenantId) {
        setTenantAndPlan({ tenant: null, plan: null });
        setIsProfileLoading(false);
        return;
    }
    
    setIsProfileLoading(true);
    let unsubscribePlan: Unsubscribe | null = null;

    const tenantRef = doc(firestore, 'tenants', tenantId);
    const unsubscribeTenant = onSnapshot(tenantRef, (tenantSnap) => {
        // Clean up any previous plan listener when tenant data changes
        if (unsubscribePlan) {
            unsubscribePlan();
            unsubscribePlan = null;
        }

        const tenantData = tenantSnap.exists() ? { ...tenantSnap.data(), id: tenantSnap.id } as Tenant : null;

        if (tenantData?.planId) {
            const planRef = doc(firestore, 'subscription_plans', tenantData.planId);
            unsubscribePlan = onSnapshot(planRef, (planSnap) => {
                const planData = planSnap.exists() ? { ...planSnap.data(), id: planSnap.id } as SubscriptionPlan : null;
                setTenantAndPlan({ tenant: tenantData, plan: planData });
                setIsProfileLoading(false);
            });
        } else {
            // If there's no planId, update the store accordingly
            setTenantAndPlan({ tenant: tenantData, plan: null });
            setIsProfileLoading(false);
        }
    });

    return () => {
        unsubscribeTenant();
        if (unsubscribePlan) {
            unsubscribePlan();
        }
    };
  }, [firestore, tenantId, setTenantAndPlan, setIsProfileLoading]);

  return <>{children}</>;
}
