import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage';
import {
  UserRole, OrderStatus, OrderType, PaymentMethod, PaymentStatus,
  PriorityLevel, StationType, PeakRushLevel
} from '@smart-canteen/shared';

export const seedDatabase = () => {
  console.log('[Seed] Seeding Smart Canteen platform with enterprise realistic data...');
  db.clearAll();

  const passwordHash = bcrypt.hashSync('demo123', 10);

  // 1. Organization
  const org = {
    _id: 'ORG-APEX-01',
    name: 'Apex Global Enterprises',
    code: 'APEX',
    industry: 'Technology & Enterprise IT',
    address: 'Apex Tech City, Sector 62, Bangalore',
    contact: '+91 80 4000 8888',
    subscriptionPlan: 'ENTERPRISE' as const,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString()
  };
  db.insert('organizations', org);

  // 2. Canteens
  const canteenMain = {
    _id: 'CANTEEN-01',
    organizationId: org._id,
    name: 'Main Tech Campus Cafeteria',
    code: 'TECH-MAIN',
    location: 'Building A, Ground Floor',
    operatingHours: { open: '07:30', close: '22:00', lunchPeakStart: '12:30', lunchPeakEnd: '14:30' },
    timezone: 'Asia/Kolkata',
    status: 'OPEN' as const,
    queueConfiguration: { maxCapacity: 120, targetWaitTimeMinutes: 10, autoAllocationEnabled: true, fairnessFactor: 0.85 },
    taxConfiguration: { cgstRate: 2.5, sgstRate: 2.5, serviceChargeRate: 0, deliveryChargeBase: 15 },
    deliveryZones: [
      { name: 'Tower A Floors 1-8', code: 'TA', fee: 15, estimatedDeliveryMinutes: 12 },
      { name: 'Tower B Floors 1-6', code: 'TB', fee: 20, estimatedDeliveryMinutes: 15 },
      { name: 'Executive Block & Innovation Lab', code: 'EX', fee: 25, estimatedDeliveryMinutes: 10 }
    ],
    createdAt: new Date().toISOString()
  };

  const canteenNorth = {
    _id: 'CANTEEN-02',
    organizationId: org._id,
    name: 'North Tower Express Bistro',
    code: 'NORTH-BISTRO',
    location: 'Tower C, 3rd Floor Skybridge',
    operatingHours: { open: '08:00', close: '20:00', lunchPeakStart: '12:45', lunchPeakEnd: '14:15' },
    timezone: 'Asia/Kolkata',
    status: 'OPEN' as const,
    queueConfiguration: { maxCapacity: 60, targetWaitTimeMinutes: 8, autoAllocationEnabled: true, fairnessFactor: 0.9 },
    taxConfiguration: { cgstRate: 2.5, sgstRate: 2.5, serviceChargeRate: 0, deliveryChargeBase: 10 },
    deliveryZones: [{ name: 'Tower C All Floors', code: 'TC', fee: 10, estimatedDeliveryMinutes: 8 }],
    createdAt: new Date().toISOString()
  };

  db.insertMany('canteens', [canteenMain, canteenNorth]);

  // 3. Demo Users
  const users = [
    {
      _id: 'USER-ADMIN',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01', 'CANTEEN-02'],
      name: 'Sarah Jenkins (Admin)',
      email: 'admin@demo.local',
      phone: '+91 98888 11111',
      passwordHash,
      role: UserRole.ADMIN,
      department: 'Operations & Facilities',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'USER-MANAGER',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01'],
      name: 'Vikram Malhotra (Canteen Manager)',
      email: 'manager@demo.local',
      phone: '+91 98888 22222',
      passwordHash,
      role: UserRole.CANTEEN_MANAGER,
      department: 'Food Services',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'USER-KITCHEN',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01'],
      name: 'Chef Rajesh Sharma (Head Chef)',
      email: 'kitchen@demo.local',
      phone: '+91 98888 33333',
      passwordHash,
      role: UserRole.KITCHEN_STAFF,
      department: 'Culinary Operations',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'USER-CASHIER',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01'],
      name: 'Pooja Nair (POS Cashier)',
      email: 'cashier@demo.local',
      phone: '+91 98888 44444',
      passwordHash,
      role: UserRole.CASHIER,
      department: 'Billing & POS',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'USER-DELIVERY',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01'],
      name: 'Arjun Das (Campus Runner)',
      email: 'delivery@demo.local',
      phone: '+91 98888 55555',
      passwordHash,
      role: UserRole.DELIVERY_AGENT,
      department: 'Logistics',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'USER-INVENTORY',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01'],
      name: 'Manoj Kumar (Stock Lead)',
      email: 'inventory@demo.local',
      phone: '+91 98888 66666',
      passwordHash,
      role: UserRole.INVENTORY_MANAGER,
      department: 'Supply Chain',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'USER-CUSTOMER',
      organizationId: org._id,
      canteenIds: ['CANTEEN-01', 'CANTEEN-02'],
      name: 'Ananya Roy (Software Engineer)',
      email: 'customer@demo.local',
      phone: '+91 98888 77777',
      passwordHash,
      role: UserRole.CUSTOMER,
      department: 'Platform Engineering',
      mealAllowanceBalance: 3200,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  db.insertMany('users', users);

  // 4. Kitchen Stations
  const stations = [
    {
      _id: 'STATION-GRILL',
      canteenId: 'CANTEEN-01',
      name: 'Grill & Sandwich Station',
      type: StationType.GRILL,
      capabilities: ['Burgers', 'Sandwiches', 'Paninis', 'Toasties'],
      capacity: 12,
      currentLoad: 65,
      activeOrderCount: 4,
      status: 'ACTIVE' as const,
      assignedWorkers: ['USER-KITCHEN'],
      averagePreparationTime: 6.5
    },
    {
      _id: 'STATION-FRY',
      canteenId: 'CANTEEN-01',
      name: 'Fry & Crispy Station',
      type: StationType.FRY,
      capabilities: ['Fries', 'Nuggets', 'Crispy Snacks', 'Samosas'],
      capacity: 10,
      currentLoad: 40,
      activeOrderCount: 2,
      status: 'ACTIVE' as const,
      assignedWorkers: ['USER-KITCHEN'],
      averagePreparationTime: 4.2
    },
    {
      _id: 'STATION-SOUTH',
      canteenId: 'CANTEEN-01',
      name: 'South Indian Hot Counter',
      type: StationType.SOUTH_INDIAN,
      capabilities: ['Dosas', 'Idlis', 'Vadas', 'Uttapams'],
      capacity: 16,
      currentLoad: 80,
      activeOrderCount: 7,
      status: 'ACTIVE' as const,
      assignedWorkers: ['USER-KITCHEN'],
      averagePreparationTime: 5.8
    },
    {
      _id: 'STATION-NORTH',
      canteenId: 'CANTEEN-01',
      name: 'North Indian & Thali Counter',
      type: StationType.NORTH_INDIAN,
      capabilities: ['Curries', 'Breads', 'Biryani', 'Meals'],
      capacity: 14,
      currentLoad: 50,
      activeOrderCount: 3,
      status: 'ACTIVE' as const,
      assignedWorkers: ['USER-KITCHEN'],
      averagePreparationTime: 7.5
    },
    {
      _id: 'STATION-BEV',
      canteenId: 'CANTEEN-01',
      name: 'Beverages & Brew Bar',
      type: StationType.BEVERAGE,
      capabilities: ['Coffee', 'Tea', 'Smoothies', 'Juices'],
      capacity: 15,
      currentLoad: 35,
      activeOrderCount: 2,
      status: 'ACTIVE' as const,
      assignedWorkers: ['USER-KITCHEN'],
      averagePreparationTime: 3.0
    },
    {
      _id: 'STATION-BAKERY',
      canteenId: 'CANTEEN-01',
      name: 'Bakery & Dessert Section',
      type: StationType.BAKERY,
      capabilities: ['Pastries', 'Croissants', 'Muffins', 'Desserts'],
      capacity: 8,
      currentLoad: 20,
      activeOrderCount: 1,
      status: 'ACTIVE' as const,
      assignedWorkers: ['USER-KITCHEN'],
      averagePreparationTime: 2.5
    }
  ];
  db.insertMany('kitchenStations', stations);

  // 5. Kitchen Workers
  const workers = [
    {
      _id: 'KW-01',
      userId: 'USER-KITCHEN',
      userName: 'Chef Rajesh Sharma',
      canteenId: 'CANTEEN-01',
      stationId: 'STATION-SOUTH',
      skills: [StationType.SOUTH_INDIAN, StationType.GRILL, StationType.NORTH_INDIAN],
      currentOrders: 4,
      workloadScore: 68,
      status: 'AVAILABLE' as const,
      shift: 'Morning Shift (07:00 - 15:30)',
      performanceScore: 96
    },
    {
      _id: 'KW-02',
      userId: 'USER-STAFF-2',
      userName: 'Kavita Menon (Line Cook)',
      canteenId: 'CANTEEN-01',
      stationId: 'STATION-GRILL',
      skills: [StationType.GRILL, StationType.FRY],
      currentOrders: 2,
      workloadScore: 45,
      status: 'AVAILABLE' as const,
      shift: 'Morning Shift (07:00 - 15:30)',
      performanceScore: 92
    },
    {
      _id: 'KW-03',
      userId: 'USER-STAFF-3',
      userName: 'Deepak Verma (Barista)',
      canteenId: 'CANTEEN-01',
      stationId: 'STATION-BEV',
      skills: [StationType.BEVERAGE, StationType.BAKERY],
      currentOrders: 2,
      workloadScore: 35,
      status: 'AVAILABLE' as const,
      shift: 'Full Day (08:00 - 17:00)',
      performanceScore: 98
    }
  ];
  db.insertMany('kitchenWorkers', workers);

  // 6. Categories
  const categories = [
    { _id: 'CAT-SOUTH', canteenId: 'CANTEEN-01', name: 'South Indian Delights', description: 'Crispy dosas, fluffy idlis, authentic chutneys', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', displayOrder: 1, status: 'ACTIVE' as const },
    { _id: 'CAT-GRILL', canteenId: 'CANTEEN-01', name: 'Gourmet Burgers & Wraps', description: 'Freshly grilled patties, toasted brioche, homemade dips', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', displayOrder: 2, status: 'ACTIVE' as const },
    { _id: 'CAT-NORTH', canteenId: 'CANTEEN-01', name: 'North Indian & Bowls', description: 'Paneer specials, aromatic curries, garlic naans', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', displayOrder: 3, status: 'ACTIVE' as const },
    { _id: 'CAT-BEV', canteenId: 'CANTEEN-01', name: 'Artisan Cafe & Coolers', description: 'Barista specialty coffee, cold brew, fresh smoothies', image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400', displayOrder: 4, status: 'ACTIVE' as const },
    { _id: 'CAT-SNACKS', canteenId: 'CANTEEN-01', name: 'Crispy Bites & Fries', description: 'Peri-peri fries, samosa chaat, loaded nachos', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400', displayOrder: 5, status: 'ACTIVE' as const },
    { _id: 'CAT-BAKERY', canteenId: 'CANTEEN-01', name: 'Patisserie & Desserts', description: 'Fresh croissants, brownie fudge, cheesecakes', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', displayOrder: 6, status: 'ACTIVE' as const }
  ];
  db.insertMany('categories', categories);

  // 7. Menu Items
  const menuItems = [
    {
      _id: 'ITEM-DOSA',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-SOUTH',
      name: 'Ghee Roast Masala Dosa',
      description: 'Golden crisp dosa filled with spiced potato masala, served with 3 coconut chutneys and hot sambar',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
      price: 110,
      taxRate: 5,
      preparationTime: 6,
      complexityScore: 3,
      calories: 380,
      isVeg: true,
      isVegan: false,
      isGlutenFree: true,
      ingredients: [],
      allergens: ['Dairy'],
      variants: [{ name: 'Regular', priceDelta: 0 }, { name: 'Cheese Burst', priceDelta: 30 }, { name: 'Double Masala', priceDelta: 20 }],
      addOns: [{ name: 'Extra Ghee Sambar', price: 20 }, { name: 'Gunpowder Podi', price: 15 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 98,
      rating: 4.9,
      totalOrders: 1420,
      preparationStations: [StationType.SOUTH_INDIAN],
      status: 'ACTIVE' as const
    },
    {
      _id: 'ITEM-IDLI',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-SOUTH',
      name: 'Steamed Button Idli (Plate of 4)',
      description: 'Melt-in-mouth steamed rice cakes dipped in piping hot drumstick sambar',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
      price: 75,
      taxRate: 5,
      preparationTime: 3,
      complexityScore: 1,
      calories: 210,
      isVeg: true,
      isVegan: true,
      isGlutenFree: true,
      ingredients: [],
      allergens: [],
      variants: [{ name: 'Standard Sambar Dip', priceDelta: 0 }, { name: 'Ghee Podi Tossed', priceDelta: 25 }],
      addOns: [{ name: 'Crispy Medu Vada (1 pc)', price: 30 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 91,
      rating: 4.8,
      totalOrders: 1180,
      preparationStations: [StationType.SOUTH_INDIAN],
      status: 'ACTIVE' as const
    },
    {
      _id: 'ITEM-BURGER',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-GRILL',
      name: 'Crispy Veggie Supreme Burger',
      description: 'Crunchy herbed patty, melted cheddar slice, caramelized onions and spicy chipotle mayo on toasted brioche',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      price: 160,
      taxRate: 5,
      preparationTime: 7,
      complexityScore: 3,
      calories: 520,
      isVeg: true,
      isVegan: false,
      isGlutenFree: false,
      ingredients: [],
      allergens: ['Gluten', 'Dairy'],
      variants: [{ name: 'Single Patty', priceDelta: 0 }, { name: 'Double Monster Patty', priceDelta: 60 }],
      addOns: [{ name: 'Jalapeno Cheese Dip', price: 25 }, { name: 'Hashbrown Topping', price: 35 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 95,
      rating: 4.7,
      totalOrders: 1840,
      preparationStations: [StationType.GRILL],
      status: 'ACTIVE' as const
    },
    {
      _id: 'ITEM-PANEER-ROLL',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-NORTH',
      name: 'Charcoal Paneer Tikka Kathi Roll',
      description: 'Smokey tandoori cottage cheese cubes, pickled bell peppers and mint chutney rolled in flaky paratha',
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500',
      price: 175,
      taxRate: 5,
      preparationTime: 8,
      complexityScore: 4,
      calories: 460,
      isVeg: true,
      isVegan: false,
      isGlutenFree: false,
      ingredients: [],
      allergens: ['Dairy', 'Gluten'],
      variants: [{ name: 'Regular Roll', priceDelta: 0 }, { name: 'Whole Wheat Roti Wrap', priceDelta: 15 }],
      addOns: [{ name: 'Extra Paneer Cubes', price: 40 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 89,
      rating: 4.6,
      totalOrders: 920,
      preparationStations: [StationType.NORTH_INDIAN],
      status: 'ACTIVE' as const
    },
    {
      _id: 'ITEM-FRIES',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-SNACKS',
      name: 'Peri-Peri Crinkle Cut Fries',
      description: 'Golden crisped crinkle fries dusted with African birds-eye chili peri-peri spice mix',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
      price: 95,
      taxRate: 5,
      preparationTime: 4,
      complexityScore: 2,
      calories: 340,
      isVeg: true,
      isVegan: true,
      isGlutenFree: false,
      ingredients: [],
      allergens: [],
      variants: [{ name: 'Medium Box', priceDelta: 0 }, { name: 'Large Sharing Tub', priceDelta: 45 }],
      addOns: [{ name: 'Garlic Aioli Dip', price: 20 }, { name: 'Melted Cheddar Sauce', price: 30 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 94,
      rating: 4.8,
      totalOrders: 2100,
      preparationStations: [StationType.FRY],
      status: 'ACTIVE' as const
    },
    {
      _id: 'ITEM-COFFEE',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-BEV',
      name: 'Hazelnut Cold Brew Latte',
      description: '18-hour steeped single-origin Arabica cold brew with chilled oat milk and roasted hazelnut syrup',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500',
      price: 130,
      taxRate: 5,
      preparationTime: 3,
      complexityScore: 1,
      calories: 140,
      isVeg: true,
      isVegan: true,
      isGlutenFree: true,
      ingredients: [],
      allergens: ['Nuts'],
      variants: [{ name: 'Oat Milk (Standard)', priceDelta: 0 }, { name: 'Almond Milk', priceDelta: 20 }],
      addOns: [{ name: 'Espresso Shot Booster', price: 30 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 97,
      rating: 4.9,
      totalOrders: 2650,
      preparationStations: [StationType.BEVERAGE],
      status: 'ACTIVE' as const
    },
    {
      _id: 'ITEM-CROISSANT',
      canteenId: 'CANTEEN-01',
      categoryId: 'CAT-BAKERY',
      name: 'Flaky French Butter Croissant',
      description: 'Laminated buttery viennoiserie baked fresh every morning with honeycomb crumb',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
      price: 85,
      taxRate: 5,
      preparationTime: 2,
      complexityScore: 1,
      calories: 270,
      isVeg: true,
      isVegan: false,
      isGlutenFree: false,
      ingredients: [],
      allergens: ['Gluten', 'Dairy'],
      variants: [{ name: 'Classic Butter', priceDelta: 0 }, { name: 'Nutella Stuffed', priceDelta: 35 }],
      addOns: [{ name: 'Warm Chocolate Drizzle', price: 20 }],
      availability: true,
      stockStatus: 'IN_STOCK' as const,
      popularityScore: 88,
      rating: 4.7,
      totalOrders: 810,
      preparationStations: [StationType.BAKERY],
      status: 'ACTIVE' as const
    }
  ];
  db.insertMany('menuItems', menuItems);

  // 8. Coupons
  const coupons = [
    { _id: 'CPN-1', code: 'WELCOME20', discountType: 'PERCENT' as const, discountValue: 20, minimumOrder: 150, maximumDiscount: 60, validUntil: '2027-12-31', status: 'ACTIVE' as const },
    { _id: 'CPN-2', code: 'LUNCH50', discountType: 'FLAT' as const, discountValue: 50, minimumOrder: 250, maximumDiscount: 50, validUntil: '2027-12-31', status: 'ACTIVE' as const },
    { _id: 'CPN-3', code: 'CORP10', discountType: 'PERCENT' as const, discountValue: 10, minimumOrder: 100, maximumDiscount: 100, validUntil: '2027-12-31', status: 'ACTIVE' as const }
  ];
  db.insertMany('coupons', coupons);

  // 9. Inventory Items
  const inventory = [
    { _id: 'INV-1', canteenId: 'CANTEEN-01', name: 'Dosa Fermented Batter (kg)', sku: 'ING-BATTER', unit: 'kg', currentStock: 45, reservedStock: 6, availableStock: 39, minimumStock: 15, reorderLevel: 25, costPerUnit: 40, status: 'IN_STOCK' as const },
    { _id: 'INV-2', canteenId: 'CANTEEN-01', name: 'Fresh Potatoes (kg)', sku: 'ING-POTATO', unit: 'kg', currentStock: 80, reservedStock: 10, availableStock: 70, minimumStock: 20, reorderLevel: 35, costPerUnit: 25, status: 'IN_STOCK' as const },
    { _id: 'INV-3', canteenId: 'CANTEEN-01', name: 'Artisan Brioche Buns (packs)', sku: 'ING-BUNS', unit: 'pack', currentStock: 35, reservedStock: 8, availableStock: 27, minimumStock: 12, reorderLevel: 20, costPerUnit: 60, status: 'IN_STOCK' as const },
    { _id: 'INV-4', canteenId: 'CANTEEN-01', name: 'Malai Paneer Fresh (kg)', sku: 'ING-PANEER', unit: 'kg', currentStock: 18, reservedStock: 4, availableStock: 14, minimumStock: 8, reorderLevel: 12, costPerUnit: 320, status: 'IN_STOCK' as const },
    { _id: 'INV-5', canteenId: 'CANTEEN-01', name: 'Single Origin Arabica Beans (kg)', sku: 'ING-COFFEE', unit: 'kg', currentStock: 14, reservedStock: 2, availableStock: 12, minimumStock: 5, reorderLevel: 8, costPerUnit: 850, status: 'IN_STOCK' as const },
    { _id: 'INV-6', canteenId: 'CANTEEN-01', name: 'Sambar Onions (Shallots)', sku: 'ING-SHALLOT', unit: 'kg', currentStock: 3.5, reservedStock: 1.5, availableStock: 2.0, minimumStock: 5, reorderLevel: 10, costPerUnit: 70, status: 'LOW_STOCK' as const }
  ];
  db.insertMany('inventoryItems', inventory);

  // 10. AI Recommendations
  const aiRecommendations = [
    {
      id: 'REC-01',
      type: 'DEMAND_PREPARATION' as const,
      title: 'Lunch Rush Surge Expected (12:30 PM - 1:45 PM)',
      description: 'Historical AI pattern projects 185 orders within 75 minutes, with South Indian counter at 92% capacity.',
      impact: 'Reduces peak queue waiting time by 34%',
      confidenceScore: 0.95,
      suggestedAction: 'Pre-prepare 30 Dosa masala fillings and pre-heat Station 2 grill plates.',
      status: 'PENDING' as const,
      timestamp: new Date().toISOString()
    },
    {
      id: 'REC-02',
      type: 'KITCHEN_REALLOCATION' as const,
      title: 'Dynamic Station Reallocation',
      description: 'Grill Station queue load exceeds 75%. Staff member Rahul Verma is available on Fry Station.',
      impact: 'Prevents 10-minute SLA delay on 6 active burger orders.',
      confidenceScore: 0.91,
      suggestedAction: 'Reallocate 1 cook from Beverage to Grill station.',
      status: 'PENDING' as const,
      timestamp: new Date().toISOString()
    },
    {
      id: 'REC-03',
      type: 'INVENTORY_REORDER' as const,
      title: 'Shallot Stock Critical Threshold',
      description: 'Stock is currently at 3.5 kg. Projected daily sambar consumption will exhaust supply by 3:30 PM.',
      impact: 'Prevents South Indian counter stockout during afternoon tea break.',
      confidenceScore: 0.97,
      suggestedAction: 'Trigger automatic purchase order for 20 kg shallots.',
      status: 'PENDING' as const,
      timestamp: new Date().toISOString()
    }
  ];
  db.insertMany('aiRecommendations', aiRecommendations);

  // 11. Generate Active Live Orders (for immediate KDS and Queue display!)
  const activeOrders = [
    {
      _id: 'ORD-LIVE-101',
      organizationId: org._id,
      canteenId: 'CANTEEN-01',
      orderNumber: 'ORD-8921-101',
      tokenNumber: 101,
      customerId: 'USER-CUSTOMER',
      customerName: 'Ananya Roy',
      items: [
        { menuItemId: 'ITEM-DOSA', nameSnapshot: 'Ghee Roast Masala Dosa', quantity: 2, unitPrice: 110, itemTotal: 220, estimatedPreparationTime: 6, stationType: StationType.SOUTH_INDIAN, status: 'PREPARING' as const },
        { menuItemId: 'ITEM-COFFEE', nameSnapshot: 'Hazelnut Cold Brew Latte', quantity: 1, unitPrice: 130, itemTotal: 130, estimatedPreparationTime: 3, stationType: StationType.BEVERAGE, status: 'PREPARING' as const }
      ],
      tasks: [
        { taskId: 'TASK-101-1', stationId: 'STATION-SOUTH', stationType: StationType.SOUTH_INDIAN, stationName: 'South Indian Hot Counter', workerName: 'Chef Rajesh Sharma', items: [{ menuItemId: 'ITEM-DOSA', name: 'Ghee Roast Masala Dosa', quantity: 2 }], estimatedMinutes: 6, status: 'PREPARING' as const },
        { taskId: 'TASK-101-2', stationId: 'STATION-BEV', stationType: StationType.BEVERAGE, stationName: 'Beverages & Brew Bar', workerName: 'Deepak Verma', items: [{ menuItemId: 'ITEM-COFFEE', name: 'Hazelnut Cold Brew Latte', quantity: 1 }], estimatedMinutes: 3, status: 'PREPARING' as const }
      ],
      orderType: OrderType.COUNTER_PICKUP,
      subtotal: 350,
      discount: 0,
      cgst: 8.75,
      sgst: 8.75,
      serviceCharge: 0,
      deliveryCharge: 0,
      total: 367.5,
      paymentMethod: PaymentMethod.MOCK_UPI,
      paymentStatus: PaymentStatus.SUCCESS,
      orderStatus: OrderStatus.PREPARING,
      priority: PriorityLevel.HIGH,
      priorityScore: 82,
      estimatedPreparationTime: 6,
      predictedWaitTime: 4.5,
      predictedCompletionTime: new Date(Date.now() + 5 * 60000).toISOString(),
      queuePosition: 1,
      timestamps: { created: new Date(Date.now() - 4 * 60000).toISOString(), paid: new Date(Date.now() - 4 * 60000).toISOString(), queued: new Date(Date.now() - 4 * 60000).toISOString(), preparingStarted: new Date(Date.now() - 2 * 60000).toISOString() }
    },
    {
      _id: 'ORD-LIVE-102',
      organizationId: org._id,
      canteenId: 'CANTEEN-01',
      orderNumber: 'ORD-8921-102',
      tokenNumber: 102,
      customerId: 'USER-CUSTOMER-2',
      customerName: 'Karthik Rao',
      items: [
        { menuItemId: 'ITEM-BURGER', nameSnapshot: 'Crispy Veggie Supreme Burger', quantity: 1, unitPrice: 160, itemTotal: 160, estimatedPreparationTime: 7, stationType: StationType.GRILL, status: 'PENDING' as const },
        { menuItemId: 'ITEM-FRIES', nameSnapshot: 'Peri-Peri Crinkle Cut Fries', quantity: 1, unitPrice: 95, itemTotal: 95, estimatedPreparationTime: 4, stationType: StationType.FRY, status: 'PENDING' as const }
      ],
      tasks: [
        { taskId: 'TASK-102-1', stationId: 'STATION-GRILL', stationType: StationType.GRILL, stationName: 'Grill & Sandwich Station', workerName: 'Kavita Menon', items: [{ menuItemId: 'ITEM-BURGER', name: 'Crispy Veggie Supreme Burger', quantity: 1 }], estimatedMinutes: 7, status: 'ACCEPTED' as const },
        { taskId: 'TASK-102-2', stationId: 'STATION-FRY', stationType: StationType.FRY, stationName: 'Fry & Crispy Station', workerName: 'Chef Rajesh Sharma', items: [{ menuItemId: 'ITEM-FRIES', name: 'Peri-Peri Crinkle Cut Fries', quantity: 1 }], estimatedMinutes: 4, status: 'ACCEPTED' as const }
      ],
      orderType: OrderType.OFFICE_DELIVERY,
      deliveryAddress: 'Tower A, Floor 5, Desk 504',
      subtotal: 255,
      discount: 0,
      cgst: 6.38,
      sgst: 6.38,
      serviceCharge: 0,
      deliveryCharge: 15,
      total: 282.76,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.SUCCESS,
      orderStatus: OrderStatus.QUEUED,
      priority: PriorityLevel.NORMAL,
      priorityScore: 65,
      estimatedPreparationTime: 7,
      predictedWaitTime: 8.0,
      predictedCompletionTime: new Date(Date.now() + 8 * 60000).toISOString(),
      queuePosition: 2,
      timestamps: { created: new Date(Date.now() - 2 * 60000).toISOString(), paid: new Date(Date.now() - 2 * 60000).toISOString(), queued: new Date(Date.now() - 2 * 60000).toISOString() }
    },
    {
      _id: 'ORD-LIVE-103',
      organizationId: org._id,
      canteenId: 'CANTEEN-01',
      orderNumber: 'ORD-8921-103',
      tokenNumber: 103,
      customerId: 'USER-CUSTOMER-3',
      customerName: 'Priya Sundaram',
      items: [
        { menuItemId: 'ITEM-IDLI', nameSnapshot: 'Steamed Button Idli', quantity: 1, unitPrice: 75, itemTotal: 75, estimatedPreparationTime: 3, stationType: StationType.SOUTH_INDIAN, status: 'READY' as const }
      ],
      tasks: [
        { taskId: 'TASK-103-1', stationId: 'STATION-SOUTH', stationType: StationType.SOUTH_INDIAN, stationName: 'South Indian Hot Counter', workerName: 'Chef Rajesh Sharma', items: [{ menuItemId: 'ITEM-IDLI', name: 'Steamed Button Idli', quantity: 1 }], estimatedMinutes: 3, status: 'COMPLETED' as const }
      ],
      orderType: OrderType.COUNTER_PICKUP,
      subtotal: 75,
      discount: 0,
      cgst: 1.88,
      sgst: 1.88,
      serviceCharge: 0,
      deliveryCharge: 0,
      total: 78.76,
      paymentMethod: PaymentMethod.CORPORATE_SUBSIDY,
      paymentStatus: PaymentStatus.SUCCESS,
      orderStatus: OrderStatus.READY,
      priority: PriorityLevel.NORMAL,
      priorityScore: 40,
      estimatedPreparationTime: 3,
      predictedWaitTime: 0,
      predictedCompletionTime: new Date().toISOString(),
      queuePosition: 0,
      timestamps: { created: new Date(Date.now() - 10 * 60000).toISOString(), ready: new Date().toISOString() }
    }
  ];
  db.insertMany('orders', activeOrders);

  // Queue entries for active orders
  const queueEntries = [
    { orderId: 'ORD-LIVE-101', orderNumber: 'ORD-8921-101', tokenNumber: 101, canteenId: 'CANTEEN-01', position: 1, priority: PriorityLevel.HIGH, predictedWaitMinutes: 4.5, createdAt: new Date().toISOString(), status: OrderStatus.PREPARING },
    { orderId: 'ORD-LIVE-102', orderNumber: 'ORD-8921-102', tokenNumber: 102, canteenId: 'CANTEEN-01', position: 2, priority: PriorityLevel.NORMAL, predictedWaitMinutes: 8.0, createdAt: new Date().toISOString(), status: OrderStatus.QUEUED }
  ];
  db.insertMany('queueEntries', queueEntries);

  // 12. Generate 5,000+ realistic historical orders (past 30 days) for deep SaaS analytics & training!
  console.log('[Seed] Synthesizing 5,200 historical orders with realistic peak distributions...');
  const historicalOrders: any[] = [];
  const nowMs = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i <= 5200; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hour = [8, 9, 12, 13, 14, 17, 18, 19, 20][Math.floor(Math.random() * 9)];
    const orderDate = new Date(nowMs - (daysAgo * dayMs) + (hour * 3600000) + (Math.floor(Math.random() * 3600) * 1000));
    
    const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    const qty = Math.random() > 0.7 ? 2 : 1;
    const sub = randomItem.price * qty;
    const cgst = Math.round(sub * 0.025 * 100) / 100;
    const sgst = Math.round(sub * 0.025 * 100) / 100;
    const total = sub + cgst + sgst;

    historicalOrders.push({
      _id: `ORD-HIST-${i.toString().padStart(5, '0')}`,
      organizationId: org._id,
      canteenId: 'CANTEEN-01',
      orderNumber: `ORD-${orderDate.toISOString().slice(2, 10).replace(/-/g, '')}-${(i % 900) + 100}`,
      tokenNumber: (i % 900) + 100,
      customerId: 'USER-CUSTOMER',
      customerName: 'Campus Colleague',
      items: [{
        menuItemId: randomItem._id,
        nameSnapshot: randomItem.name,
        quantity: qty,
        unitPrice: randomItem.price,
        itemTotal: sub,
        estimatedPreparationTime: randomItem.preparationTime,
        stationType: randomItem.preparationStations[0],
        status: 'READY'
      }],
      tasks: [],
      orderType: OrderType.COUNTER_PICKUP,
      subtotal: sub,
      discount: 0,
      cgst,
      sgst,
      serviceCharge: 0,
      deliveryCharge: 0,
      total,
      paymentMethod: PaymentMethod.MOCK_UPI,
      paymentStatus: PaymentStatus.SUCCESS,
      orderStatus: OrderStatus.COMPLETED,
      priority: PriorityLevel.NORMAL,
      priorityScore: 50,
      estimatedPreparationTime: randomItem.preparationTime,
      predictedWaitTime: Math.round((4 + Math.random() * 8) * 10) / 10,
      predictedCompletionTime: orderDate.toISOString(),
      timestamps: {
        created: orderDate.toISOString(),
        paid: orderDate.toISOString(),
        ready: new Date(orderDate.getTime() + 10 * 60000).toISOString(),
        completed: new Date(orderDate.getTime() + 14 * 60000).toISOString()
      }
    });
  }
  db.insertMany('orders', historicalOrders);

  console.log(`[Seed] Database seeded successfully! Loaded ${db.getState().orders.length} total orders, ${users.length} demo users, ${menuItems.length} menu items, and ${stations.length} kitchen stations.`);
};

if (require.main === module) {
  seedDatabase();
}
