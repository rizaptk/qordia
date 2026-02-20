
'use client';

import { create } from 'zustand';
import { type User } from 'firebase/auth';
import { type UserProfile, type Tenant, type SubscriptionPlan } from '@/lib/types';

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  plan: SubscriptionPlan | null;
  
  isLoading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  isPlatformAdmin: boolean;
  hasAnalyticsFeature: boolean;

  setAuthData: (data: { 
    user: User | null, 
    userProfile: UserProfile | null, 
    tenant: Tenant | null, 
    plan: SubscriptionPlan | null 
  }) => void;
  
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  tenant: null,
  plan: null,
  isLoading: true, // Start in loading state
  isAuthenticated: false,
  isManager: false,
  isPlatformAdmin: false,
  hasAnalyticsFeature: false,
  
  setIsLoading: (loading) => set({ isLoading: loading }),

  setAuthData: ({ user, userProfile, tenant, plan }) => {
    const features = new Set(plan?.features || []);
    set({
      user,
      userProfile,
      tenant,
      plan,
      isAuthenticated: !!user,
      isManager: userProfile?.role === 'manager',
      isPlatformAdmin: userProfile?.role === 'platform_admin',
      hasAnalyticsFeature: features.has('Analytics'),
      isLoading: false, // We have all data, so we are done loading.
    });
  },
}));
