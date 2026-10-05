import fs from 'fs';
import path from 'path';
import {
  User, Organization, Canteen, Category, MenuItem, Order,
  KitchenStation, KitchenWorker, QueueEntry, Delivery,
  InventoryItem, Coupon, Invoice, AIRecommendation
} from '@smart-canteen/shared';

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

  private isLoaded = false;

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
        this.isLoaded = true;
        console.log(`[StorageEngine] Loaded database snapshot (${this.state.orders.length} orders, ${this.state.menuItems.length} menu items)`);
      }
    } catch (err) {
      console.warn('[StorageEngine] Could not load DB snapshot from disk, starting empty memory store:', err);
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
    return item;
  }

  public insertMany<T = any>(collection: keyof DatabaseState, items: T[]): T[] {
    (this.state[collection] as any[]).push(...items);
    this.saveToDisk();
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
    return list[idx] as T;
  }

  public delete(collection: keyof DatabaseState, id: string): boolean {
    const list = this.state[collection] as any[];
    const idx = list.findIndex(i => (i._id === id || i.id === id || i.orderId === id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.saveToDisk();
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
  }
}

export const db = new StorageEngine();
