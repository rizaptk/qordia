import type { MenuItem, Order, AnalyticsData } from './types';

export const menuItems: MenuItem[] = [
  {
    id: 'coffee-01',
    name: 'Espresso',
    description: 'A concentrated coffee beverage brewed by forcing a small amount of nearly boiling water under pressure through finely-ground coffee beans.',
    price: 3.0,
    category: 'Coffee',
    image: 'espresso',
    imageUrl: 'https://images.unsplash.com/photo-1612509590595-785e974ed690?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxlc3ByZXNzbyUyMGNvZmZlZXxlbnwwfHx8fDE3NzE0OTc0MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'coffee-02',
    name: 'Cappuccino',
    description: 'An espresso-based coffee drink that originated in Italy, and is traditionally prepared with steamed milk foam.',
    price: 4.5,
    category: 'Coffee',
    image: 'cappuccino',
    imageUrl: 'https://images.unsplash.com/photo-1517958911667-09c05f6cd698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjYXBwdWNjaW5vJTIwY29mZmVlfGVufDB8fHx8MTc3MTQ5NzQxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: true,
    modifierGroupIds: ['milk-options', 'sizes']
  },
  {
    id: 'coffee-03',
    name: 'Latte',
    description: 'A coffee drink made with espresso and steamed milk, with a light layer of foam on top.',
    price: 4.5,
    category: 'Coffee',
    image: 'latte',
    imageUrl: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzE0OTc0MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: false,
    modifierGroupIds: ['milk-options', 'syrup-flavors']
  },
  {
    id: 'coffee-04',
    name: 'Iced Coffee',
    description: 'Chilled coffee, brewed hot and then cooled, served over ice. A refreshing classic.',
    price: 4.0,
    category: 'Coffee',
    image: 'iced-coffee',
    imageUrl: 'https://images.unsplash.com/photo-1533007716222-4b465613a984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxpY2VkJTIwY29mZmVlfGVufDB8fHx8MTc3MTQ3MzMwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: true,
    modifierGroupIds: ['sweetness-level']
  },
  {
    id: 'tea-01',
    name: 'Green Tea',
    description: 'A classic tea with a fresh, grassy flavor. Packed with antioxidants.',
    price: 3.5,
    category: 'Tea',
    image: 'green-tea',
    imageUrl: 'https://images.unsplash.com/photo-1606441393961-bb2331b77d55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxncmVlbiUyMHRlYXxlbnwwfHx8fDE3NzE0NzYzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'tea-02',
    name: 'Black Tea',
    description: 'A robust and full-bodied tea, perfect for a morning boost. Also known as English Breakfast.',
    price: 3.5,
    category: 'Tea',
    image: 'black-tea',
    imageUrl: 'https://images.unsplash.com/photo-1518881922778-bacb4debc3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxibGFjayUyMHRlYXxlbnwwfHx8fDE3NzE0MTM3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: false,
    isPopular: true,
  },
  {
    id: 'pastry-01',
    name: 'Croissant',
    description: 'A buttery, flaky, viennoiserie pastry of Austrian origin, named for its historical crescent shape.',
    price: 3.75,
    category: 'Pastries',
    image: 'croissant',
    imageUrl: 'https://images.unsplash.com/photo-1712723246766-3eaea22e52ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MHx8fHwxNzcxNDkyMDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'pastry-02',
    name: 'Blueberry Muffin',
    description: 'A soft, moist muffin packed with fresh blueberries. A perfect companion for your coffee.',
    price: 3.5,
    category: 'Pastries',
    image: 'muffin',
    imageUrl: 'https://images.unsplash.com/photo-1722251172903-cc8774501df7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxibHVlYmVycnklMjBtdWZmaW58ZW58MHx8fHwxNzcxNDg1Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'sandwich-01',
    name: 'Turkey Club',
    description: 'A classic sandwich with layers of turkey, crispy bacon, lettuce, tomato, and mayonnaise.',
    price: 9.5,
    category: 'Sandwiches',
    image: 'turkey-club',
    imageUrl: 'https://images.unsplash.com/photo-1678969405738-323f9acb3c18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjbHViJTIwc2FuZHdpY2h8ZW58MHx8fHwxNzcxMzk3NDIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'sandwich-02',
    name: 'Veggie Wrap',
    description: 'A healthy and delicious wrap filled with hummus, fresh greens, cucumber, and bell peppers.',
    price: 8.5,
    category: 'Sandwiches',
    image: 'veggie-wrap',
    imageUrl: 'https://images.unsplash.com/photo-1630914441321-4e353a4c89f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx2ZWdldGFibGUlMjB3cmFwfGVufDB8fHx8MTc3MTQ5NzQxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'dessert-01',
    name: 'New York Cheesecake',
    description: 'Rich and creamy cheesecake with a graham cracker crust. A timeless dessert.',
    price: 6.5,
    category: 'Desserts',
    image: 'cheesecake',
    imageUrl: 'https://images.unsplash.com/photo-1638890745037-3f06f2bb47d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjaGVlc2VjYWtlJTIwc2xpY2V8ZW58MHx8fHwxNzcxNDk3NDE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: true,
  },
   {
    id: 'dessert-02',
    name: 'Fruit Tart',
    description: 'A beautiful and light tart with a pastry cream filling and topped with fresh seasonal fruits.',
    price: 7.0,
    category: 'Desserts',
    image: 'fruit-tart',
    imageUrl: 'https://images.unsplash.com/photo-1570145820404-cf22b115b06f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmcnVpdCUyMHRhcnR8ZW58MHx8fHwxNzcxNDkzMTI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isAvailable: true,
    isPopular: false,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    tableId: '12',
    items: [
      {
        id: 'ci-1',
        menuItem: menuItems.find(mi => mi.id === 'coffee-02')!,
        quantity: 1,
        customizations: { 'Milk': 'Oat', 'Size': 'Large' },
        specialNotes: 'Extra hot please',
        price: 4.5
      },
      {
        id: 'ci-2',
        menuItem: menuItems.find(mi => mi.id === 'pastry-01')!,
        quantity: 1,
        customizations: {},
        specialNotes: '',
        price: 3.75
      },
    ],
    status: 'Placed',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    total: 8.25,
  },
  {
    id: 'ORD-002',
    tableId: '5',
    items: [
      {
        id: 'ci-3',
        menuItem: menuItems.find(mi => mi.id === 'coffee-04')!,
        quantity: 2,
        customizations: { 'Sweetness': 'Lightly Sweet' },
        specialNotes: '',
        price: 4.0
      },
    ],
    status: 'In Progress',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    total: 8.0,
  },
  {
    id: 'ORD-003',
    tableId: '8',
    items: [
      {
        id: 'ci-4',
        menuItem: menuItems.find(mi => mi.id === 'sandwich-01')!,
        quantity: 1,
        customizations: {},
        specialNotes: 'No mayo.',
        price: 9.5
      },
      {
        id: 'ci-5',
        menuItem: menuItems.find(mi => mi.id === 'tea-01')!,
        quantity: 1,
        customizations: {},
        specialNotes: '',
        price: 3.5
      },
    ],
    status: 'Placed',
    timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    total: 13.0,
  },
];

export const analyticsData: AnalyticsData = {
  bestSellers: [
    { item: 'Cappuccino', sales: 450 },
    { item: 'Iced Coffee', sales: 380 },
    { item: 'Turkey Club', sales: 320 },
    { item: 'Croissant', sales: 280 },
    { item: 'Espresso', sales: 210 },
  ],
  peakHours: [
    { hour: '8 AM', orders: 30 },
    { hour: '9 AM', orders: 55 },
    { hour: '10 AM', orders: 45 },
    { hour: '11 AM', orders: 60 },
    { hour: '12 PM', orders: 80 },
    { hour: '1 PM', orders: 95 },
    { hour: '2 PM', orders: 70 },
    { hour: '3 PM', orders: 65 },
    { hour: '4 PM', orders: 50 },
  ],
  salesPerformance: [
    { month: 'Jan', revenue: 6500 },
    { month: 'Feb', revenue: 5900 },
    { month: 'Mar', revenue: 7200 },
    { month: 'Apr', revenue: 8100 },
    { month: 'May', revenue: 7600 },
    { month: 'Jun', revenue: 9500 },
  ],
  tableTurnover: [
      {table: 'Table 1', count: 25},
      {table: 'Table 2', count: 30},
      {table: 'Table 3', count: 22},
      {table: 'Table 4 (Patio)', count: 45},
      {table: 'Table 5 (Patio)', count: 41},
      {table: 'Booth 1', count: 18},
      {table: 'Booth 2', count: 20},
  ]
};
