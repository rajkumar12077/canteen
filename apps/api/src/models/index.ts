import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  _id: { type: String, required: true },
  organizationId: { type: String, required: true },
  canteenIds: [{ type: String }],
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String },
  role: { type: String, required: true },
  department: { type: String },
  mealAllowanceBalance: { type: Number, default: 2000 },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: String },
  updatedAt: { type: String }
}, { collection: 'users', timestamps: false });

const OrganizationSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  industry: { type: String },
  address: { type: String },
  contact: { type: String },
  subscriptionPlan: { type: String, default: 'ENTERPRISE' },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: String }
}, { collection: 'organizations' });

const CanteenSchema = new Schema({
  _id: { type: String, required: true },
  organizationId: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  location: { type: String },
  operatingHours: { type: Schema.Types.Mixed },
  timezone: { type: String, default: 'Asia/Kolkata' },
  status: { type: String, default: 'OPEN' },
  queueConfiguration: { type: Schema.Types.Mixed },
  taxConfiguration: { type: Schema.Types.Mixed },
  deliveryZones: [{ type: Schema.Types.Mixed }],
  createdAt: { type: String }
}, { collection: 'canteens' });

const CategorySchema = new Schema({
  _id: { type: String, required: true },
  canteenId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  displayOrder: { type: Number, default: 1 },
  status: { type: String, default: 'ACTIVE' }
}, { collection: 'categories' });

const MenuItemSchema = new Schema({
  _id: { type: String, required: true },
  canteenId: { type: String, required: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  taxRate: { type: Number, default: 5 },
  preparationTime: { type: Number, default: 5 },
  complexityScore: { type: Number, default: 2 },
  calories: { type: Number },
  isVeg: { type: Boolean, default: true },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  variants: [{ type: Schema.Types.Mixed }],
  addOns: [{ type: Schema.Types.Mixed }],
  availability: { type: Boolean, default: true },
  stockStatus: { type: String, default: 'IN_STOCK' },
  popularityScore: { type: Number, default: 90 },
  rating: { type: Number, default: 4.8 },
  totalOrders: { type: Number, default: 0 },
  preparationStations: [{ type: String }],
  status: { type: String, default: 'ACTIVE' }
}, { collection: 'menuItems' });

const OrderSchema = new Schema({
  _id: { type: String, required: true },
  organizationId: { type: String, required: true },
  canteenId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  tokenNumber: { type: Number, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  items: [{ type: Schema.Types.Mixed }],
  tasks: [{ type: Schema.Types.Mixed }],
  orderType: { type: String, required: true },
  deliveryAddress: { type: String },
  tableNumber: { type: String },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'SUCCESS' },
  orderStatus: { type: String, default: 'QUEUED' },
  priority: { type: String, default: 'NORMAL' },
  priorityScore: { type: Number, default: 50 },
  estimatedPreparationTime: { type: Number, default: 5 },
  predictedWaitTime: { type: Number, default: 5 },
  predictedCompletionTime: { type: String },
  actualPreparationTime: { type: Number },
  queuePosition: { type: Number },
  assignedStation: { type: String },
  assignedStaff: { type: String },
  aiExplanation: { type: String },
  notes: { type: String },
  timestamps: { type: Schema.Types.Mixed }
}, { collection: 'orders' });

const KitchenStationSchema = new Schema({
  _id: { type: String, required: true },
  canteenId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  capabilities: [{ type: String }],
  capacity: { type: Number, default: 10 },
  currentLoad: { type: Number, default: 0 },
  activeOrderCount: { type: Number, default: 0 },
  status: { type: String, default: 'ACTIVE' },
  assignedWorkers: [{ type: String }],
  averagePreparationTime: { type: Number, default: 5 }
}, { collection: 'kitchenStations' });

const KitchenWorkerSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  canteenId: { type: String, required: true },
  stationId: { type: String, required: true },
  skills: [{ type: String }],
  currentOrders: { type: Number, default: 0 },
  workloadScore: { type: Number, default: 50 },
  status: { type: String, default: 'AVAILABLE' },
  shift: { type: String },
  performanceScore: { type: Number, default: 95 }
}, { collection: 'kitchenWorkers' });

const QueueEntrySchema = new Schema({
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  tokenNumber: { type: Number, required: true },
  canteenId: { type: String, required: true },
  position: { type: Number, required: true },
  priority: { type: String, default: 'NORMAL' },
  predictedWaitMinutes: { type: Number, default: 5 },
  createdAt: { type: String },
  status: { type: String, default: 'QUEUED' }
}, { collection: 'queueEntries' });

const DeliverySchema = new Schema({
  _id: { type: String, required: true },
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  agentId: { type: String },
  agentName: { type: String },
  destination: { type: String, required: true },
  distanceKm: { type: Number, default: 0.5 },
  deliveryStatus: { type: String, default: 'PENDING' }
}, { collection: 'deliveries' });

const InventoryItemSchema = new Schema({
  _id: { type: String, required: true },
  canteenId: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  unit: { type: String, default: 'kg' },
  currentStock: { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  availableStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 5 },
  reorderLevel: { type: Number, default: 10 },
  costPerUnit: { type: Number, default: 50 },
  status: { type: String, default: 'IN_STOCK' }
}, { collection: 'inventoryItems' });

const CouponSchema = new Schema({
  _id: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  discountType: { type: String, required: true },
  discountValue: { type: Number, required: true },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: { type: Number, default: 100 },
  validUntil: { type: String },
  status: { type: String, default: 'ACTIVE' }
}, { collection: 'coupons' });

const InvoiceSchema = new Schema({
  _id: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  canteenId: { type: String, required: true },
  canteenName: { type: String },
  items: [{ type: Schema.Types.Mixed }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true },
  generatedAt: { type: String }
}, { collection: 'invoices' });

const AIRecommendationSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String },
  confidenceScore: { type: Number, default: 0.9 },
  suggestedAction: { type: String },
  status: { type: String, default: 'PENDING' },
  timestamp: { type: String }
}, { collection: 'aiRecommendations' });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const OrganizationModel = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
export const CanteenModel = mongoose.models.Canteen || mongoose.model('Canteen', CanteenSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const MenuItemModel = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const KitchenStationModel = mongoose.models.KitchenStation || mongoose.model('KitchenStation', KitchenStationSchema);
export const KitchenWorkerModel = mongoose.models.KitchenWorker || mongoose.model('KitchenWorker', KitchenWorkerSchema);
export const QueueEntryModel = mongoose.models.QueueEntry || mongoose.model('QueueEntry', QueueEntrySchema);
export const DeliveryModel = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);
export const InventoryItemModel = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);
export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
export const AIRecommendationModel = mongoose.models.AIRecommendation || mongoose.model('AIRecommendation', AIRecommendationSchema);
