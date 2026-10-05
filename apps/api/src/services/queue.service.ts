import { db } from '../storage';
import { QueueEntry, OrderStatus, PriorityLevel, SOCKET_EVENTS } from '@smart-canteen/shared';
import { emitToCanteen } from '../sockets';
import { AIService } from './ai.service';

export class QueueService {
  public static getCanteenQueue(canteenId: string): QueueEntry[] {
    return db.findMany<QueueEntry>('queueEntries', q => 
      q.canteenId === canteenId && [OrderStatus.QUEUED, OrderStatus.ALLOCATING, OrderStatus.ASSIGNED, OrderStatus.ACCEPTED, OrderStatus.PREPARING].includes(q.status)
    ).sort((a, b) => a.position - b.position);
  }

  public static async addToQueue(order: any): Promise<QueueEntry> {
    const currentQueue = this.getCanteenQueue(order.canteenId);
    const position = currentQueue.length + 1;

    // AI wait-time prediction
    const aiPrediction = await AIService.predictWaitTime({
      queueLength: currentQueue.length,
      activeOrders: currentQueue.length + 1,
      totalItems: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)
    });

    const entry: QueueEntry = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tokenNumber: order.tokenNumber,
      canteenId: order.canteenId,
      position,
      priority: order.priority || PriorityLevel.NORMAL,
      predictedWaitMinutes: aiPrediction.predictedWaitMinutes,
      createdAt: new Date().toISOString(),
      status: OrderStatus.QUEUED
    };

    db.insert('queueEntries', entry);

    // Update order with queue information
    db.update('orders', order._id, {
      queuePosition: position,
      predictedWaitTime: aiPrediction.predictedWaitMinutes,
      predictedCompletionTime: new Date(Date.now() + aiPrediction.predictedWaitMinutes * 60000).toISOString()
    });

    emitToCanteen(order.canteenId, SOCKET_EVENTS.QUEUE_UPDATED, {
      canteenId: order.canteenId,
      queueLength: position,
      entry
    });

    return entry;
  }

  public static updateQueuePositions(canteenId: string): void {
    const activeEntries = this.getCanteenQueue(canteenId);
    activeEntries.forEach((entry, idx) => {
      entry.position = idx + 1;
      db.update('orders', entry.orderId, { queuePosition: idx + 1 });
    });
    db.saveToDisk();

    emitToCanteen(canteenId, SOCKET_EVENTS.QUEUE_UPDATED, {
      canteenId,
      queueLength: activeEntries.length,
      entries: activeEntries
    });
  }

  public static removeFromQueue(orderId: string, canteenId: string, finalStatus: OrderStatus): void {
    const entry = db.findOne<QueueEntry>('queueEntries', q => q.orderId === orderId);
    if (entry) {
      entry.status = finalStatus;
      db.saveToDisk();
      this.updateQueuePositions(canteenId);
    }
  }
}
