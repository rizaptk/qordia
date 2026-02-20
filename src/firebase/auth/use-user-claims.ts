'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface UserClaims {
  role?: 'manager' | 'barista' | 'service' | 'customer' | 'platform_admin';
  tenantId?: string;
  platform_admin?: boolean;
  [key: string]: any;
}

interface UseUserClaimsResult {
  claims: UserClaims | null;
  isLoading: boolean;
}

/**
 * A hook to resolve a user's custom claims from their ID token.
 * This is the single source of truth for user roles and permissions.
 */
export function useUserClaims(): UseUserClaimsResult {
  const { user, isUserLoading } = useAuthStore();
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If the user object is still loading, we are also loading.
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    // If there is no user, there are no claims.
    if (!user) {
      setClaims(null);
      setIsLoading(false);
      return;
    }

    // User object is available, now we fetch their claims.
    setIsLoading(true);
    let isMounted = true;

    const resolveClaims = async () => {
      try {
        // Force a refresh of the ID token to ensure we have the latest claims.
        // This is important for new users whose claims may have just been set.
        const idTokenResult = await user.getIdTokenResult(true);
        if (isMounted) {
          setClaims(idTokenResult.claims as UserClaims);
        }
      } catch (error) {
        console.error("Error fetching user claims:", error);
        if (isMounted) {
          setClaims(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    resolveClaims();

    return () => {
      isMounted = false;
    };
  }, [user, isUserLoading]);

  return { claims, isLoading };
}
