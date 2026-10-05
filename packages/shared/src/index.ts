export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
  KITCHEN_MANAGER = 'KITCHEN_MANAGER',
  DELIVERY_AGENT = 'DELIVERY_AGENT',
  CASHIER = 'CASHIER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  CANTEEN_MANAGER = 'CANTEEN_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  QUEUED = 'QUEUED',
  ALLOCATING = 'ALLOCATING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED'
}

export enum OrderType {
  COUNTER_PICKUP = 'COUNTER_PICKUP',
  TABLE_DELIVERY = 'TABLE_DELIVERY',
  OFFICE_DELIVERY = 'OFFICE_DELIVERY',
  ROOM_DELIVERY = 'ROOM_DELIVERY',
  SCHEDULED = 'SCHEDULED'
}

export enum PaymentMethod {
  MOCK_UPI = 'MOCK_UPI',
  CARD = 'CARD',
  CASH = 'CASH',
  CORPORATE_SUBSIDY = 'CORPORATE_SUBSIDY',
  WALLET = 'WALLET'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PriorityLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  VIP = 'VIP'
}

export enum StationType {
  GRILL = 'GRILL',
  FRY = 'FRY',
  BEVERAGE = 'BEVERAGE',
  SOUTH_INDIAN = 'SOUTH_INDIAN',
  NORTH_INDIAN = 'NORTH_INDIAN',
  BAKERY = 'BAKERY',
  PACKING = 'PACKING',
  DISPATCH = 'DISPATCH'
}

export enum PeakRushLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface UserPreferences {
  dietary?: 'VEG' | 'NON_VEG' | 'VEGAN' | 'ANY';
  allergies?: string[];
  notificationsEnabled?: boolean;
}

export interface User {
  _id: string;
  organizationId: string;
  canteenIds: string[];
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  mealAllowanceBalance?: number;
  preferences?: UserPreferences;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  code: string;
  industry: string;
  address: string;
  contact: string;
  subscriptionPlan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE';
  settings?: Record<string, any>;
  createdAt: string;
}

export interface OperatingHours {
  open: string;
  close: string;
  lunchPeakStart: string;
  lunchPeakEnd: string;
}

export interface Canteen {
  _id: string;
  organizationId: string;
  name: string;
  code: string;
  location: string;
  operatingHours: OperatingHours;
  timezone: string;
  status: 'OPEN' | 'BUSY' | 'TEMPORARILY_CLOSED' | 'MAINTENANCE';
  queueConfiguration: {
    maxCapacity: number;
    targetWaitTimeMinutes: number;
    autoAllocationEnabled: boolean;
    fairnessFactor: number;
  };
  taxConfiguration: {
    cgstRate: number;
    sgstRate: number;
    serviceChargeRate: number;
    deliveryChargeBase: number;
  };
  deliveryZones: {
    name: string;
    code: string;
    fee: number;
    estimatedDeliveryMinutes: number;
  }[];
  createdAt: string;
}

export interface Category {
  _id: string;
  canteenId: string;
  name: string;
  description: string;
  image: string;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MenuItemVariant {
  name: string;
  priceDelta: number;
}

export interface MenuItemAddOn {
  name: string;
  price: number;
}

export interface MenuItem {
  _id: string;
  canteenId: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  taxRate: number;
  preparationTime: number; // in minutes
  complexityScore: number; // 1 to 5
  calories: number;
  isVeg: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  ingredients: { ingredientId: string; quantity: number; unit: string }[];
  allergens: string[];
  variants: MenuItemVariant[];
  addOns: MenuItemAddOn[];
  availability: boolean;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  popularityScore: number;
  rating: number;
  totalOrders: number;
  preparationStations: StationType[];
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface OrderItem {
  menuItemId: string;
  nameSnapshot: string;
  quantity: number;
  unitPrice: number;
  variant?: string;
  addOns?: string[];
  itemTotal: number;
  estimatedPreparationTime: number;
  actualPreparationTime?: number;
  stationType: StationType;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

export interface StationTask {
  taskId: string;
  stationId: string;
  stationType: StationType;
  stationName: string;
  workerId?: string;
  workerName?: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    customizations?: string;
  }[];
  estimatedMinutes: number;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'COMPLETED';
  startedAt?: string;
  completedAt?: string;
}

export interface Order {
  _id: string;
  organizationId: string;
  canteenId: string;
  orderNumber: string;
  tokenNumber: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  tasks: StationTask[];
  orderType: OrderType;
  deliveryAddress?: string;
  tableNumber?: string;
  subtotal: number;
  discount: number;
  couponCode?: string;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  priority: PriorityLevel;
  priorityScore: number;
  estimatedPreparationTime: number;
  predictedWaitTime: number;
  predictedCompletionTime: string;
  actualPreparationTime?: number;
  queuePosition?: number;
  assignedStation?: string;
  assignedStaff?: string;
  assignedDeliveryAgent?: string;
  aiExplanation?: string;
  cancellationReason?: string;
  notes?: string;
  timestamps: {
    created: string;
    paid?: string;
    queued?: string;
    accepted?: string;
    preparingStarted?: string;
    qualityChecked?: string;
    ready?: string;
    outForDelivery?: string;
    delivered?: string;
    completed?: string;
    cancelled?: string;
  };
}

export interface KitchenStation {
  _id: string;
  canteenId: string;
  name: string;
  type: StationType;
  capabilities: string[];
  capacity: number;
  currentLoad: number; // percentage or active items
  activeOrderCount: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  assignedWorkers: string[]; // worker user IDs
  averagePreparationTime: number;
}

export interface KitchenWorker {
  _id: string;
  userId: string;
  userName: string;
  canteenId: string;
  stationId: string;
  skills: StationType[];
  currentOrders: number;
  workloadScore: number; // 0 - 100
  status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OFFLINE';
  shift: string;
  performanceScore: number; // e.g. 94%
}

export interface QueueEntry {
  _id?: string;
  orderId: string;
  orderNumber: string;
  tokenNumber: number;
  canteenId: string;
  position: number;
  priority: PriorityLevel;
  predictedWaitMinutes: number;
  createdAt: string;
  status: OrderStatus;
}

export interface Delivery {
  _id: string;
  orderId: string;
  orderNumber: string;
  agentId?: string;
  agentName?: string;
  pickupTime?: string;
  dispatchTime?: string;
  deliveryTime?: string;
  destination: string;
  distanceKm: number;
  deliveryStatus: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  proofOfDeliveryOtp?: string;
  deliveryNotes?: string;
}

export interface InventoryItem {
  _id: string;
  canteenId: string;
  name: string;
  sku: string;
  unit: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  reorderLevel: number;
  costPerUnit: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';
}

export interface Coupon {
  _id: string;
  canteenId?: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount: number;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  canteenId: string;
  canteenName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  generatedAt: string;
}

export interface AIRecommendation {
  id: string;
  type: 'KITCHEN_REALLOCATION' | 'DEMAND_PREPARATION' | 'INVENTORY_REORDER' | 'STATION_BOTTLENECK' | 'SPECIAL_OFFER';
  title: string;
  description: string;
  impact: string;
  confidenceScore: number;
  suggestedAction: string;
  actionPayload?: Record<string, any>;
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
  timestamp: string;
}

export interface QueuePredictionResult {
  queueLength: number;
  estimatedWaitMinutes: number;
  confidence: number;
  peakRushLevel: PeakRushLevel;
  activeWorkloadScore: number;
  predictedBottleneckStation?: StationType;
  explanation: string;
}

export const SOCKET_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_QUEUED: 'order:queued',
  ORDER_ASSIGNED: 'order:assigned',
  ORDER_ACCEPTED: 'order:accepted',
  ORDER_PREPARING: 'order:preparing',
  ORDER_PROGRESS: 'order:progress',
  ORDER_READY: 'order:ready',
  ORDER_OUT_FOR_DELIVERY: 'order:out_for_delivery',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',
  QUEUE_UPDATED: 'queue:updated',
  QUEUE_PREDICTION: 'queue:prediction',
  KITCHEN_LOAD: 'kitchen:load',
  KITCHEN_ASSIGNMENT: 'kitchen:assignment',
  INVENTORY_LOW: 'inventory:low',
  NOTIFICATION_NEW: 'notification:new',
  AI_RECOMMENDATION: 'ai:recommendation'
} as const;
