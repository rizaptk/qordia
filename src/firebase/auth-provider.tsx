
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
      // Firebase services not ready, AuthStore will remain in its initial loading state.
      return;
    }

    // Set loading to true when starting the listener setup.
    setIsLoading(true);

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      let allListeners: Unsubscribe[] = [];
      const cleanup = () => allListeners.forEach(unsub => unsub());

      // If user logs out, immediately clear all state and stop.
      if (!authUser) {
        cleanup();
        setAuthData({ user: null, userProfile: null, tenant: null, plan: null });
        return;
      }
      
      try {
        const idTokenResult = await authUser.getIdTokenResult(true);
        // Handle platform admin as a special case
        if (idTokenResult.claims.platform_admin === true) {
            cleanup();
            setAuthData({
              user: authUser,
              userProfile: { id: authUser.uid, email: authUser.email!, name: authUser.displayName || 'Admin', role: 'platform_admin' },
              tenant: null,
              plan: null,
            });
            return;
        }
          
        const profileRef = doc(firestore, 'users', authUser.uid);
        const profileUnsubscribe = onSnapshot(profileRef, (profileSnap) => {
            // Clean up downstream listeners whenever profile changes
            cleanup(); 
            allListeners.push(profileUnsubscribe);

            const userProfile = profileSnap.exists() ? { id: profileSnap.id, ...profileSnap.data() } as UserProfile : null;
            
            if (!userProfile?.tenantId) {
                setAuthData({ user: authUser, userProfile, tenant: null, plan: null });
                return;
            }

            const tenantRef = doc(firestore, 'tenants', userProfile.tenantId);
            const tenantUnsubscribe = onSnapshot(tenantRef, (tenantSnap) => {
                const tenant = tenantSnap.exists() ? { id: tenantSnap.id, ...tenantSnap.data() } as Tenant : null;

                if (!tenant?.planId) {
                    setAuthData({ user: authUser, userProfile, tenant, plan: null });
                    return;
                }

                const planRef = doc(firestore, 'subscription_plans', tenant.planId);
                const planUnsubscribe = onSnapshot(planRef, (planSnap) => {
                    const plan = planSnap.exists() ? { id: planSnap.id, ...planSnap.data() } as SubscriptionPlan : null;
                    setAuthData({ user: authUser, userProfile, tenant, plan });
                });
                allListeners.push(planUnsubscribe);
            });
            allListeners.push(tenantUnsubscribe);
        });
        allListeners.push(profileUnsubscribe);

      } catch (error) {
          console.error("Error setting up auth listeners:", error);
          cleanup();
          setAuthData({ user: null, userProfile: null, tenant: null, plan: null });
      }
    });

    return () => unsubscribeAuth(); // Cleanup on component unmount
  }, [auth, firestore, setAuthData, setIsLoading]);

  return <>{children}</>;
}
