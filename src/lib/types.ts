
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // The text name of the category
  categoryId?: string; // The ID from firestore, optional for mock data
  image: string; // the ID for the placeholder image
  imageUrl?: string; // The actual URL, optional for mock data
  isAvailable: boolean;
  isPopular: boolean;
  options?: {
    [key: string]: string[];
  };
};

export type CartItem = {
  id: string; // Unique ID for the cart item instance
  menuItem: MenuItem;
  quantity: number;
  customizations: { [key: string]: string };
  specialNotes: string;
  price: number;
};

export type Order = {
  id: string;
  tableId: string;
  items: CartItem[] | OrderItem[];
  status: 'Placed' | 'In Progress' | 'Ready' | 'Served' | 'Completed' | 'Refunded';
  timestamp: Date | { seconds: number; nanoseconds: number }; // Support both Date and Firestore Timestamp
  total: number;
  customerId?: string;
  totalAmount?: number;
  orderedAt?: any;
  refundDetails?: {
    refundAmount: number;
    reason: string;
    processedAt: { seconds: number; nanoseconds: number };
    processedByUid: string;
  };
};

export type OrderItem = {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    customizations: { [key: string]: string };
    specialNotes: string;
}

export type Tenant = {
    id: string;
    name: string;
    ownerId: string;
    createdAt: { seconds: number; nanoseconds: number };
    planId?: string;
    subscriptionStatus?: 'active' | 'trialing' | 'overdue' | 'canceled';
    nextBillingDate?: { seconds: number; nanoseconds: number };
    staffUids?: string[];
    shopType?: 'cafe' | 'coffee_shop' | 'food_court' | 'small_restaurant';
    logoUrl?: string;
    priceOverride?: number;
    notes?: string;
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'barista' | 'service' | 'cashier' | 'manager' | 'platform_admin';
  tenantId?: string;
};


export type AnalyticsData = {
  bestSellers: { item: string, sales: number }[];
  peakHours: { hour: string, orders: number }[];
  salesPerformance: { month: string, revenue: number }[];
  tableTurnover: { table: string, count: number }[];
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  tableLimit?: number;
};

export type CustomRole = {
  id: string;
  name: string;
  permissions: string[];
};

export type TenantInvitation = {
    id: string;
    tenantId: string;
    tenantName: string;
    email: string;
    role: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: { seconds: number; nanoseconds: number; };
}

export type ApiKey = {
    id: string;
    name: string;
    keyPrefix: string;
    keyTruncated: string;
    createdAt: { seconds: number; nanoseconds: number; };
}

export type SupportTicket = {
    id: string;
    tenantId: string;
    tenantName: string;
    submittedByUid: string;
    subject: string;
    message: string;
    priority: 'normal' | 'high' | 'urgent';
    status: 'new' | 'in-progress' | 'resolved';
    createdAt: { seconds: number; nanoseconds: number; };
    resolvedAt?: { seconds: number; nanoseconds: number; };
}
