'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

interface UserClaims {
  role?: 'manager' | 'barista' | 'service' | 'customer' | 'platform_admin';
  tenantId?: string;
  platform_admin?: boolean;
  [key: string]: any;
}

interface UseUserClaimsResult {
  claims: UserClaims | null;
  isLoading: boolean;
  roleSource: 'token' | 'firestore' | null;
}

export function useUserClaims(): UseUserClaimsResult {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleSource, setRoleSource] = useState<'token' | 'firestore' | null>(null);

  useEffect(() => {
    const resolveClaims = async () => {
      if (isUserLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setClaims(null);
        setRoleSource(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
        
        // Primary source of truth: token claims
        if (idTokenResult.claims.role || idTokenResult.claims.platform_admin) {
          setClaims(idTokenResult.claims as UserClaims);
          setRoleSource('token');
          setIsLoading(false);
          return;
        }

        // Fallback for new users: check Firestore database if claims are not yet set
        if (firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userProfile = userDocSnap.data() as UserProfile;
            const dbClaims: UserClaims = {
              role: userProfile.role,
              tenantId: userProfile.tenantId,
            };
            setClaims(dbClaims);
            setRoleSource('firestore');
          } else {
            // User exists in Auth, but not in Firestore yet.
            setClaims({ role: 'customer' }); // Default to customer
            setRoleSource('firestore');
          }
        } else {
            // Firestore not available, default to customer
             setClaims({ role: 'customer' });
             setRoleSource(null);
        }
      } catch (error) {
        console.error("Error resolving user claims:", error);
        setClaims(null);
        setRoleSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolveClaims();

  }, [user, isUserLoading, firestore]);

  return { claims, isLoading, roleSource };
}
