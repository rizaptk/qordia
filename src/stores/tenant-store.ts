import { create } from 'zustand';
import { SubscriptionPlan, Tenant } from '@/lib/types';


interface TenantState {
    tenant: Tenant | null;
    plan: SubscriptionPlan | null;
    tableLimit: number | null;
    hasAnalyticsFeature: boolean;
    hasMenuCustomizationFeature: boolean;
    hasAdvancedMenuStyles: boolean;
    hasAdvancedReportingFeature: boolean;
    hasPrioritySupportFeature: boolean;
    hasApiAccessFeature: boolean;
    hasCustomRolesFeature: boolean;
    hasCashierRoleFeature: boolean;
    hasServiceRoleFeature: boolean;
    setTenant: (tenant: Tenant | null, plan: SubscriptionPlan | null) => void;
}

export const useTenantStore = create<TenantState>()(
    (set) => ({
        tenant: null,
        plan: null,
        tableLimit: null,
        hasAnalyticsFeature: false,
        hasMenuCustomizationFeature: false,
        hasAdvancedMenuStyles: false,
        hasAdvancedReportingFeature: false,
        hasPrioritySupportFeature: false,
        hasApiAccessFeature: false,
        hasCustomRolesFeature: false,
        hasCashierRoleFeature: false,
        hasServiceRoleFeature: false,
        setTenant: (tenant, plan) => {
            const isSubscriptionActive = tenant?.subscriptionStatus === 'active' || tenant?.subscriptionStatus === 'trialing';
            const features = new Set(isSubscriptionActive ? (plan?.features || []) : []);
            const tableLimit = isSubscriptionActive ? (plan?.tableLimit ?? 0) : 5;
            set({
                tenant,
                plan: isSubscriptionActive ? plan : null,
                tableLimit,
                hasAnalyticsFeature: features.has('Analytics'),
                hasMenuCustomizationFeature: features.has('Menu Customization'),
                hasAdvancedMenuStyles: features.has('Advanced Menu Styles'),
                hasAdvancedReportingFeature: features.has('Advanced Reporting'),
                hasPrioritySupportFeature: features.has('Priority Support'),
                hasApiAccessFeature: features.has('API Access'),
                hasCustomRolesFeature: features.has('Staff Roles'),
                hasCashierRoleFeature: features.has('Cashier Role'),
                hasServiceRoleFeature: features.has('Service Role'),
            });
        },
    })
);
