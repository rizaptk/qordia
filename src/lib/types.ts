export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Coffee' | 'Tea' | 'Pastries' | 'Sandwiches' | 'Desserts';
  image: string;
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
  items: CartItem[];
  status: 'Placed' | 'In Progress' | 'Ready' | 'Completed';
  timestamp: Date;
  total: number;
};

export type AnalyticsData = {
  bestSellers: { item: string, sales: number }[];
  peakHours: { hour: string, orders: number }[];
  salesPerformance: { month: string, revenue: number }[];
  tableTurnover: { table: string, count: number }[];
}
