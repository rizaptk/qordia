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
  status: 'Placed' | 'In Progress' | 'Ready' | 'Served' | 'Completed';
  timestamp: Date | { seconds: number; nanoseconds: number }; // Support both Date and Firestore Timestamp
  total: number;
  customerId?: string;
  totalAmount?: number;
  orderedAt?: any;
};

export type OrderItem = {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    customizations: { [key: string]: string };
    specialNotes: string;
}

export type AnalyticsData = {
  bestSellers: { item: string, sales: number }[];
  peakHours: { hour: string, orders: number }[];
  salesPerformance: { month: string, revenue: number }[];
  tableTurnover: { table: string, count: number }[];
}
