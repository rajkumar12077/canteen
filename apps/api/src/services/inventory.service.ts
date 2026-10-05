import { db } from '../storage';
import { InventoryItem, SOCKET_EVENTS } from '@smart-canteen/shared';
import { emitToCanteen } from '../sockets';

export class InventoryService {
  public static getItems(canteenId?: string): InventoryItem[] {
    return db.findMany<InventoryItem>('inventoryItems', i => !canteenId || i.canteenId === canteenId);
  }

  public static updateStock(itemId: string, adjustment: number, reason: string): InventoryItem | null {
    const item = db.findOne<InventoryItem>('inventoryItems', i => i._id === itemId);
    if (!item) return null;

    item.currentStock = Math.max(0, item.currentStock + adjustment);
    item.availableStock = Math.max(0, item.currentStock - item.reservedStock);

    if (item.availableStock <= 0) {
      item.status = 'OUT_OF_STOCK';
    } else if (item.availableStock <= item.minimumStock) {
      item.status = 'CRITICAL';
      emitToCanteen(item.canteenId, SOCKET_EVENTS.INVENTORY_LOW, item);
    } else if (item.availableStock <= item.reorderLevel) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'IN_STOCK';
    }

    db.update('inventoryItems', itemId, item);
    return item;
  }
}
