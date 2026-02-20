
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
  isBarista: boolean;
  isService: boolean;
  isCashier: boolean;
  tableLimit: number | null;
  hasAnalyticsFeature: boolean;
  hasMenuCustomizationFeature: boolean;
  hasAdvancedReportingFeature: boolean;
  hasPrioritySupportFeature: boolean;
  hasApiAccessFeature: boolean;
  hasCustomRolesFeature: boolean;
  hasCashierRoleFeature: boolean;
  hasServiceRoleFeature: boolean;

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
  isBarista: false,
  isService: false,
  isCashier: false,
  tableLimit: null,
  hasAnalyticsFeature: false,
  hasMenuCustomizationFeature: false,
  hasAdvancedReportingFeature: false,
  hasPrioritySupportFeature: false,
  hasApiAccessFeature: false,
  hasCustomRolesFeature: false,
  hasCashierRoleFeature: false,
  hasServiceRoleFeature: false,
  
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
      isBarista: userProfile?.role === 'barista',
      isService: userProfile?.role === 'service',
      isCashier: userProfile?.role === 'cashier',
      tableLimit: plan?.tableLimit ?? null,
      hasAnalyticsFeature: features.has('Analytics'),
      hasMenuCustomizationFeature: features.has('Menu Customization'),
      hasAdvancedReportingFeature: features.has('Advanced Reporting'),
      hasPrioritySupportFeature: features.has('Priority Support'),
      hasApiAccessFeature: features.has('API Access'),
      hasCustomRolesFeature: features.has('Staff Roles'),
      hasCashierRoleFeature: features.has('Cashier Role'),
      hasServiceRoleFeature: features.has('Service Role'),
      isLoading: false, // We have all data, so we are done loading.
    });
  },
}));
