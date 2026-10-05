import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { config } from '../config';
import {
  User, Organization, Canteen, Category, MenuItem, Order,
  KitchenStation, KitchenWorker, QueueEntry, Delivery,
  InventoryItem, Coupon, Invoice, AIRecommendation
} from '@smart-canteen/shared';
import {
  UserModel, OrganizationModel, CanteenModel, CategoryModel, MenuItemModel,
  OrderModel, KitchenStationModel, KitchenWorkerModel, QueueEntryModel,
  DeliveryModel, InventoryItemModel, CouponModel, InvoiceModel, AIRecommendationModel
} from '../models';

export interface DatabaseState {
  users: User[];
  organizations: Organization[];
  canteens: Canteen[];
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  kitchenStations: KitchenStation[];
  kitchenWorkers: KitchenWorker[];
  queueEntries: QueueEntry[];
  deliveries: Delivery[];
  inventoryItems: InventoryItem[];
  coupons: Coupon[];
  invoices: Invoice[];
  aiRecommendations: AIRecommendation[];
  auditLogs: any[];
}

const DB_FILE_PATH = path.resolve(__dirname, '../../../../database/fixtures/canteen_db.json');

const modelMap: Record<string, any> = {
  users: UserModel,
  organizations: OrganizationModel,
  canteens: CanteenModel,
  categories: CategoryModel,
  menuItems: MenuItemModel,
  orders: OrderModel,
  kitchenStations: KitchenStationModel,
  kitchenWorkers: KitchenWorkerModel,
  queueEntries: QueueEntryModel,
  deliveries: DeliveryModel,
  inventoryItems: InventoryItemModel,
  coupons: CouponModel,
  invoices: InvoiceModel,
  aiRecommendations: AIRecommendationModel
};

class StorageEngine {
  private state: DatabaseState = {
    users: [],
    organizations: [],
    canteens: [],
    categories: [],
    menuItems: [],
    orders: [],
    kitchenStations: [],
    kitchenWorkers: [],
    queueEntries: [],
    deliveries: [],
    inventoryItems: [],
    coupons: [],
    invoices: [],
    aiRecommendations: [],
    auditLogs: []
  };

  private isConnectedToMongo = false;

  constructor() {
    this.loadFromDisk();
    this.connectMongo();
  }

  public async connectMongo(): Promise<void> {
    if (!config.mongoUri) return;
    try {
      await mongoose.connect(config.mongoUri);
      this.isConnectedToMongo = true;
      console.log('🍃 [StorageEngine] Successfully connected to MongoDB Atlas!');
      await this.syncWithMongo();
    } catch (err: any) {
      console.warn('🍃 [StorageEngine] MongoDB connection notice:', err.message);
    }
  }

  public async syncWithMongo(): Promise<void> {
    if (!this.isConnectedToMongo) return;
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount > 0) {
        // Load collections from Atlas into high-speed memory cache
        this.state.users = (await UserModel.find().lean()) as any;
        this.state.organizations = (await OrganizationModel.find().lean()) as any;
        this.state.canteens = (await CanteenModel.find().lean()) as any;
        this.state.categories = (await CategoryModel.find().lean()) as any;
        this.state.menuItems = (await MenuItemModel.find().lean()) as any;
        this.state.orders = (await OrderModel.find().lean()) as any;
        this.state.kitchenStations = (await KitchenStationModel.find().lean()) as any;
        this.state.kitchenWorkers = (await KitchenWorkerModel.find().lean()) as any;
        this.state.queueEntries = (await QueueEntryModel.find().lean()) as any;
        this.state.deliveries = (await DeliveryModel.find().lean()) as any;
        this.state.inventoryItems = (await InventoryItemModel.find().lean()) as any;
        this.state.coupons = (await CouponModel.find().lean()) as any;
        this.state.invoices = (await InvoiceModel.find().lean()) as any;
        this.state.aiRecommendations = (await AIRecommendationModel.find().lean()) as any;
        console.log(`🍃 [StorageEngine] Loaded ${this.state.orders.length} orders from MongoDB Atlas.`);
      } else {
        // Atlas is currently empty, push current seed state up to Atlas!
        console.log('🍃 [StorageEngine] Populating initial dataset into MongoDB Atlas...');
        await this.pushAllToMongo();
      }
    } catch (err: any) {
      console.error('🍃 [StorageEngine] Error syncing with Atlas:', err.message);
    }
  }

  public async pushAllToMongo(): Promise<void> {
    if (!this.isConnectedToMongo) return;
    try {
      if (this.state.organizations.length) await OrganizationModel.insertMany(this.state.organizations as any, { ordered: false }).catch(() => {});
      if (this.state.canteens.length) await CanteenModel.insertMany(this.state.canteens as any, { ordered: false }).catch(() => {});
      if (this.state.users.length) await UserModel.insertMany(this.state.users as any, { ordered: false }).catch(() => {});
      if (this.state.categories.length) await CategoryModel.insertMany(this.state.categories as any, { ordered: false }).catch(() => {});
      if (this.state.menuItems.length) await MenuItemModel.insertMany(this.state.menuItems as any, { ordered: false }).catch(() => {});
      if (this.state.kitchenStations.length) await KitchenStationModel.insertMany(this.state.kitchenStations as any, { ordered: false }).catch(() => {});
      if (this.state.kitchenWorkers.length) await KitchenWorkerModel.insertMany(this.state.kitchenWorkers as any, { ordered: false }).catch(() => {});
      if (this.state.coupons.length) await CouponModel.insertMany(this.state.coupons as any, { ordered: false }).catch(() => {});
      if (this.state.inventoryItems.length) await InventoryItemModel.insertMany(this.state.inventoryItems as any, { ordered: false }).catch(() => {});
      if (this.state.aiRecommendations.length) await AIRecommendationModel.insertMany(this.state.aiRecommendations as any, { ordered: false }).catch(() => {});
      if (this.state.queueEntries.length) await QueueEntryModel.insertMany(this.state.queueEntries as any, { ordered: false }).catch(() => {});
      if (this.state.orders.length) {
        // Insert active and historical orders in chunks
        const chunkSize = 500;
        for (let i = 0; i < this.state.orders.length; i += chunkSize) {
          const chunk = this.state.orders.slice(i, i + chunkSize);
          await OrderModel.insertMany(chunk as any, { ordered: false }).catch(() => {});
        }
      }
      console.log('🍃 [StorageEngine] All collections successfully synchronized to MongoDB Atlas!');
    } catch (err: any) {
      console.warn('🍃 [StorageEngine] Notice during push to MongoDB Atlas:', err.message);
    }
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
        console.log(`[StorageEngine] Loaded database snapshot (${this.state.orders.length} orders, ${this.state.menuItems.length} menu items)`);
      }
    } catch (err) {
      console.warn('[StorageEngine] Starting empty memory store:', err);
    }
  }

  public saveToDisk(): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[StorageEngine] Error saving DB to disk:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public setState(newState: Partial<DatabaseState>): void {
    this.state = { ...this.state, ...newState };
    this.saveToDisk();
  }

  // Generic Helpers
  public findOne<T = any>(collection: keyof DatabaseState, predicate: (item: any) => boolean): T | undefined {
    const list = this.state[collection] as any[];
    return list.find(predicate) as T;
  }

  public findMany<T = any>(collection: keyof DatabaseState, predicate?: (item: any) => boolean): T[] {
    const list = this.state[collection] as any[];
    if (!predicate) return [...list] as T[];
    return list.filter(predicate) as T[];
  }

  public insert<T = any>(collection: keyof DatabaseState, item: T): T {
    (this.state[collection] as any[]).push(item);
    this.saveToDisk();

    // Async write to MongoDB Atlas
    if (this.isConnectedToMongo && modelMap[collection]) {
      modelMap[collection].create(item).catch((err: any) => {
        // Silently handle duplicate keys
      });
    }

    return item;
  }

  public insertMany<T = any>(collection: keyof DatabaseState, items: T[]): T[] {
    (this.state[collection] as any[]).push(...items);
    this.saveToDisk();

    if (this.isConnectedToMongo && modelMap[collection]) {
      modelMap[collection].insertMany(items, { ordered: false }).catch(() => {});
    }

    return items;
  }

  public update<T = any>(
    collection: keyof DatabaseState,
    id: string,
    updates: any
  ): T | null {
    const list = this.state[collection] as any[];
    const idx = list.findIndex(i => (i._id === id || i.id === id || i.orderId === id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.saveToDisk();

    if (this.isConnectedToMongo && modelMap[collection]) {
      const query = (collection === 'queueEntries') ? { orderId: id } : { _id: id };
      modelMap[collection].updateOne(query, { $set: updates }).catch(() => {});
    }

    return list[idx] as T;
  }

  public delete(collection: keyof DatabaseState, id: string): boolean {
    const list = this.state[collection] as any[];
    const idx = list.findIndex(i => (i._id === id || i.id === id || i.orderId === id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.saveToDisk();

    if (this.isConnectedToMongo && modelMap[collection]) {
      const query = (collection === 'queueEntries') ? { orderId: id } : { _id: id };
      modelMap[collection].deleteOne(query).catch(() => {});
    }

    return true;
  }

  public clearAll(): void {
    this.state = {
      users: [],
      organizations: [],
      canteens: [],
      categories: [],
      menuItems: [],
      orders: [],
      kitchenStations: [],
      kitchenWorkers: [],
      queueEntries: [],
      deliveries: [],
      inventoryItems: [],
      coupons: [],
      invoices: [],
      aiRecommendations: [],
      auditLogs: []
    };
    this.saveToDisk();

    if (this.isConnectedToMongo) {
      Object.values(modelMap).forEach(m => m.deleteMany({}).catch(() => {}));
    }
  }
}

export const db = new StorageEngine();
