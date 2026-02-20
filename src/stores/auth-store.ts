
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
  isUserLoading: boolean; // Covers initial user check from Firebase Auth
  isProfileLoading: boolean; // Covers profile, tenant, and plan fetching
  
  // Derived booleans for convenience
  isAuthenticated: boolean;
  isManager: boolean;
  isPlatformAdmin: boolean;
  hasAnalyticsFeature: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (userProfile: UserProfile | null) => void;
  setTenantAndPlan: (data: { tenant: Tenant | null; plan: SubscriptionPlan | null; }) => void;
  setIsUserLoading: (isLoading: boolean) => void;
  setIsProfileLoading: (isLoading: boolean) => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Raw data
  user: null,
  userProfile: null,
  tenant: null,
  plan: null,
  
  // State indicators
  isUserLoading: true,
  isProfileLoading: true,

  // Derived booleans
  isAuthenticated: false,
  isManager: false,
  isPlatformAdmin: false,
  hasAnalyticsFeature: false,

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  
  setUserProfile: (userProfile) => {
    set({
      userProfile,
      isManager: userProfile?.role === 'manager',
      isPlatformAdmin: userProfile?.role === 'platform_admin',
    });
  },
  
  setTenantAndPlan: ({ tenant, plan }) => {
    const features = new Set(plan?.features || []);
    set({
      tenant,
      plan,
      hasAnalyticsFeature: features.has('Analytics'),
    });
  },

  setIsUserLoading: (isUserLoading) => set({ isUserLoading }),
  setIsProfileLoading: (isProfileLoading) => set({ isProfileLoading }),

  clearAll: () => set({
    user: null,
    userProfile: null,
    tenant: null,
    plan: null,
    isAuthenticated: false,
    isUserLoading: false,
    isProfileLoading: false,
    isManager: false,
    isPlatformAdmin: false,
    hasAnalyticsFeature: false,
  }),
}));
