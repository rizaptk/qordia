
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useAuthStore } from '@/stores/auth-store';
import { UserProfile, Tenant, SubscriptionPlan } from '@/lib/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { setAuthData, setIsLoading } = useAuthStore();

  useEffect(() => {
    if (!auth || !firestore) {
      return;
    }

    setIsLoading(true);

    let profileUnsubscribe: Unsubscribe | undefined;
    let tenantUnsubscribe: Unsubscribe | undefined;
    let planUnsubscribe: Unsubscribe | undefined;

    const cleanup = () => {
      if (profileUnsubscribe) profileUnsubscribe();
      if (tenantUnsubscribe) tenantUnsubscribe();
      if (planUnsubscribe) planUnsubscribe();
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      cleanup();

      if (!authUser) {
        setAuthData({ user: null, userProfile: null, tenant: null, plan: null });
        return;
      }

      setIsLoading(true);

      const idTokenResult = await authUser.getIdTokenResult(true);

      // PLATFORM ADMIN PATH
      if (idTokenResult.claims.platform_admin === true) {
        setAuthData({
          user: authUser,
          userProfile: { id: authUser.uid, email: authUser.email!, name: authUser.displayName || 'Admin', role: 'platform_admin' },
          tenant: null,
          plan: null,
        });
        return;
      }

      // TENANT USER PATH
      const profileRef = doc(firestore, 'users', authUser.uid);
      profileUnsubscribe = onSnapshot(profileRef, (profileSnap) => {
        cleanup(); // Clean up downstream listeners before re-evaluating the chain

        if (!profileSnap.exists()) {
          setAuthData({ user: authUser, userProfile: null, tenant: null, plan: null });
          return;
        }

        const userProfile = { id: profileSnap.id, ...profileSnap.data() } as UserProfile;
        const tenantId = userProfile.tenantId;

        if (!tenantId) {
          setAuthData({ user: authUser, userProfile, tenant: null, plan: null });
          return;
        }

        const tenantRef = doc(firestore, 'tenants', tenantId);
        tenantUnsubscribe = onSnapshot(tenantRef, (tenantSnap) => {
          if (planUnsubscribe) planUnsubscribe();

          if (!tenantSnap.exists()) {
            setAuthData({ user: authUser, userProfile, tenant: null, plan: null });
            return;
          }

          const tenant = { id: tenantSnap.id, ...tenantSnap.data() } as Tenant;
          const planId = tenant.planId;

          if (!planId) {
            setAuthData({ user: authUser, userProfile, tenant, plan: null });
            return;
          }

          const planRef = doc(firestore, 'subscription_plans', planId);
          planUnsubscribe = onSnapshot(planRef, (planSnap) => {
            const plan = planSnap.exists() ? { id: planSnap.id, ...planSnap.data() } as SubscriptionPlan : null;
            setAuthData({ user: authUser, userProfile, tenant, plan });
          });
        });
      }, (error) => {
        console.error("Error on profile snapshot:", error);
        setAuthData({ user: authUser, userProfile: null, tenant: null, plan: null });
      });
    });

    return () => {
      cleanup();
      unsubscribeAuth();
    };
  }, [auth, firestore, setAuthData, setIsLoading]);

  return <>{children}</>;
}
