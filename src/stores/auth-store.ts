
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
  setProfileData: (data: { userProfile: UserProfile | null; tenant: Tenant | null; plan: SubscriptionPlan | null; }) => void;
  setIsUserLoading: (isLoading: boolean) => void;
  setIsProfileLoading: (isLoading: boolean) => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Raw data
  user: null,
  userProfile: null,
  tenant: null,
  plan: null,
  
  // State indicators
  isUserLoading: true,
  isProfileLoading: false,

  // Derived booleans
  isAuthenticated: false,
  isManager: false,
  isPlatformAdmin: false,
  hasAnalyticsFeature: false,

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  
  setProfileData: ({ userProfile, tenant, plan }) => {
    const isManager = userProfile?.role === 'manager';
    const isPlatformAdmin = userProfile?.role === 'platform_admin';
    const features = new Set(plan?.features || []);
    const hasAnalyticsFeature = features.has('Analytics');

    set({
      userProfile,
      tenant,
      plan,
      isManager,
      isPlatformAdmin,
      hasAnalyticsFeature,
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
