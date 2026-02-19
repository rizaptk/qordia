'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';

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

export function useUserClaims(): UseUserClaimsResult {
  const { user, isUserLoading } = useUser();
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setClaims(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    user.getIdTokenResult(true) // Force refresh to get latest claims
      .then((idTokenResult) => {
        setClaims(idTokenResult.claims as UserClaims);
      })
      .catch((error) => {
        console.error("Error getting user claims:", error);
        setClaims(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [user, isUserLoading]);

  return { claims, isLoading: isUserLoading || isLoading };
}
