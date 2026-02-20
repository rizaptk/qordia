
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
      // Firebase services are not ready yet.
      return;
    }

    setIsLoading(true);

    // This single listener will manage the entire auth flow.
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      // Start with a clean slate of listeners whenever auth state changes.
      let profileUnsubscribe: Unsubscribe | undefined;
      let tenantUnsubscribe: Unsubscribe | undefined;
      let planUnsubscribe: Unsubscribe | undefined;

      const cleanup = () => {
        if (profileUnsubscribe) profileUnsubscribe();
        if (tenantUnsubscribe) tenantUnsubscribe();
        if (planUnsubscribe) planUnsubscribe();
      };

      if (!authUser) {
        // User signed out, clear everything.
        cleanup();
        setAuthData({ user: null, userProfile: null, tenant: null, plan: null });
        return;
      }

      setIsLoading(true);

      // Check for platform admin claim first. This is a separate, simpler path.
      const idTokenResult = await authUser.getIdTokenResult(true);
      if (idTokenResult.claims.platform_admin === true) {
        cleanup(); // Ensure no other listeners are active for an admin
        setAuthData({
          user: authUser,
          userProfile: { id: authUser.uid, email: authUser.email!, name: authUser.displayName || 'Admin', role: 'platform_admin' },
          tenant: null,
          plan: null,
        });
        return;
      }

      // --- Start of the nested listener chain for regular users ---
      const profileRef = doc(firestore, 'users', authUser.uid);
      profileUnsubscribe = onSnapshot(profileRef, (profileSnap) => {
        // When profile changes, reset the downstream listeners (tenant and plan)
        if (tenantUnsubscribe) tenantUnsubscribe();
        if (planUnsubscribe) planUnsubscribe();

        if (!profileSnap.exists()) {
          // User exists in Auth, but not in Firestore `users` collection yet.
          setAuthData({ user: authUser, userProfile: null, tenant: null, plan: null });
          return;
        }
        
        const userProfile = { id: profileSnap.id, ...profileSnap.data() } as UserProfile;
        const tenantId = userProfile.tenantId;

        if (!tenantId) {
          // User has a profile but is not associated with a tenant.
          setAuthData({ user: authUser, userProfile, tenant: null, plan: null });
          return;
        }

        // Now that we have a tenantId, listen to the tenant document.
        const tenantRef = doc(firestore, 'tenants', tenantId);
        tenantUnsubscribe = onSnapshot(tenantRef, (tenantSnap) => {
          // When tenant changes, reset the plan listener.
          if (planUnsubscribe) planUnsubscribe();

          if (!tenantSnap.exists()) {
            setAuthData({ user: authUser, userProfile, tenant: null, plan: null });
            return;
          }

          const tenant = { id: tenantSnap.id, ...tenantSnap.data() } as Tenant;
          const planId = tenant.planId;

          if (!planId) {
            // Tenant exists but has no plan assigned.
            setAuthData({ user: authUser, userProfile, tenant, plan: null });
            return;
          }

          // Finally, listen to the subscription plan document.
          const planRef = doc(firestore, 'subscription_plans', planId);
          planUnsubscribe = onSnapshot(planRef, (planSnap) => {
            const plan = planSnap.exists() ? { id: planSnap.id, ...planSnap.data() } as SubscriptionPlan : null;
            // This is the final state update with all data loaded.
            setAuthData({ user: authUser, userProfile, tenant, plan });
          }, (error) => {
            console.error("Error on plan snapshot:", error);
            setAuthData({ user: authUser, userProfile, tenant, plan: null });
          });
        }, (error) => {
          console.error("Error on tenant snapshot:", error);
          setAuthData({ user: authUser, userProfile, tenant: null, plan: null });
        });
      }, (error) => {
        console.error("Error on profile snapshot:", error);
        setAuthData({ user: authUser, userProfile: null, tenant: null, plan: null });
      });

      // Return a cleanup function for the main auth listener.
      return () => {
        cleanup();
      };
    });

    // Return the cleanup function for the `useEffect` hook itself.
    return () => {
      unsubscribeAuth();
    };
  }, [auth, firestore, setAuthData, setIsLoading]);

  return <>{children}</>;
}
