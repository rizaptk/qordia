
'use client';

import { create } from 'zustand';
import { type User } from 'firebase/auth';
import { type UserProfile, type Tenant, type SubscriptionPlan } from '@/lib/types';

export interface AuthState {
  // Raw data
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  plan: SubscriptionPlan | null;
  
  // State indicators
  isLoading: boolean;
  
  // Derived booleans for convenience
  isAuthenticated: boolean;
  isManager: boolean;
  isPlatformAdmin: boolean;
  hasAnalyticsFeature: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthData: (data: { userProfile: UserProfile | null, tenant: Tenant | null, plan: SubscriptionPlan | null }) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Raw data
  user: null,
  userProfile: null,
  tenant: null,
  plan: null,
  
  // State indicators
  isLoading: true,

  // Derived booleans
  isAuthenticated: false,
  isManager: false,
  isPlatformAdmin: false,
  hasAnalyticsFeature: false,

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  
  setAuthData: ({ userProfile, tenant, plan }) => {
    const features = new Set(plan?.features || []);
    set({
      userProfile,
      tenant,
      plan,
      isManager: userProfile?.role === 'manager',
      isPlatformAdmin: userProfile?.role === 'platform_admin',
      hasAnalyticsFeature: features.has('Analytics'),
      isLoading: false, // All data is now loaded
    });
  },

  setIsLoading: (isLoading) => set({ isLoading }),

  clearAll: () => set({
    user: null,
    userProfile: null,
    tenant: null,
    plan: null,
    isAuthenticated: false,
    isLoading: false,
    isManager: false,
    isPlatformAdmin: false,
    hasAnalyticsFeature: false,
  }),
}));
