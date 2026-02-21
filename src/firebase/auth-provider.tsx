
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe, Firestore } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useAuthStore } from '@/stores/auth-store';
import { UserProfile, Tenant, SubscriptionPlan } from '@/lib/types';

/**
 * Sets up a chain of nested Firestore listeners (profile -> tenant -> plan).
 * Returns a single unsubscribe function that tears down all listeners in the chain.
 * @param firestore - The Firestore instance.
 * @param user - The authenticated Firebase user.
 * @param setAuthData - The function to update the global auth store.
 * @returns A single function that, when called, unsubscribes from all created listeners.
 */
function setupNestedListeners(
  firestore: Firestore,
  user: User,
  setAuthData: (data: any) => void
): Unsubscribe {
  let listeners: Unsubscribe[] = [];

  const profileRef = doc(firestore, 'users', user.uid);
  const profileUnsubscribe = onSnapshot(profileRef, (profileSnap) => {
    // When the profile updates, clean up only the downstream listeners (tenant and plan)
    listeners.slice(1).forEach(unsub => unsub());
    listeners = listeners.slice(0, 1); // Keep only the profile listener in the array

    const userProfile = profileSnap.exists() ? { id: profileSnap.id, ...profileSnap.data() } as UserProfile : null;

    if (!userProfile?.tenantId) {
      setAuthData({ user, userProfile, tenant: null, plan: null });
      return;
    }

    const tenantRef = doc(firestore, 'tenants', userProfile.tenantId);
    const tenantUnsubscribe = onSnapshot(tenantRef, (tenantSnap) => {
      const tenant = tenantSnap.exists() ? { id: tenantSnap.id, ...tenantSnap.data() } as Tenant : null;

      // When tenant updates, clean up the plan listener if it exists
      listeners.slice(2).forEach(unsub => unsub());
      listeners = listeners.slice(0, 2);

      if (!tenant?.planId) {
        setAuthData({ user, userProfile, tenant, plan: null });
        return;
      }

      const planRef = doc(firestore, 'subscription_plans', tenant.planId);
      const planUnsubscribe = onSnapshot(planRef, (planSnap) => {
        const plan = planSnap.exists() ? { id: planSnap.id, ...planSnap.data() } as SubscriptionPlan : null;
        setAuthData({ user, userProfile, tenant, plan });
      });
      listeners.push(planUnsubscribe); // Add plan listener
    });
    listeners.push(tenantUnsubscribe); // Add tenant listener
  });
  
  listeners.push(profileUnsubscribe); // Add profile listener

  // Return a single cleanup function that unsubscribes from all nested listeners
  return () => {
    listeners.forEach(unsub => unsub());
  };
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { setAuthData, setIsLoading } = useAuthStore();

  useEffect(() => {
    if (!auth || !firestore) {
      // Firebase services not ready, AuthStore will remain in its initial loading state.
      return;
    }

    setIsLoading(true);
    let unsubscribeNested: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      // Always clean up previous nested listeners when auth state changes.
      if (unsubscribeNested) {
        unsubscribeNested();
        unsubscribeNested = null;
      }

      // If user logs out, clear all state and stop.
      if (!authUser) {
        setAuthData({ user: null, userProfile: null, tenant: null, plan: null });
        return;
      }

      // SAFETY NET: If the user is an email/password user but their email is not verified,
      // treat them as logged out to prevent permission errors from downstream listeners.
      const isEmailPasswordUser = authUser.providerData.some(p => p.providerId === 'password');
      if (isEmailPasswordUser && !authUser.emailVerified) {
          // Signing out will trigger onAuthStateChanged again with `null`, which will
          // correctly clear the application state.
          await auth.signOut();
          return;
      }
      
      try {
        const idTokenResult = await authUser.getIdTokenResult(true);
        // Handle platform admin as a special case
        if (idTokenResult.claims.platform_admin === true) {
            setAuthData({
              user: authUser,
              userProfile: { id: authUser.uid, email: authUser.email!, name: authUser.displayName || 'Admin', role: 'platform_admin' },
              tenant: null,
              plan: null,
            });
            return;
        }
          
        // Set up the new chain of listeners for the newly authenticated user.
        unsubscribeNested = setupNestedListeners(firestore, authUser, setAuthData);

      } catch (error) {
          console.error("Error setting up auth state:", error);
          setAuthData({ user: null, userProfile: null, tenant: null, plan: null });
      }
    });

    // Main cleanup for the entire provider
    return () => {
        unsubscribeAuth();
        if (unsubscribeNested) {
            unsubscribeNested();
        }
    };
  }, [auth, firestore, setAuthData, setIsLoading]);

  return <>{children}</>;
}
