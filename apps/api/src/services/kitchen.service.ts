import { db } from '../storage';
import {
  KitchenStation, KitchenWorker, Order, OrderStatus, StationTask,
  SOCKET_EVENTS
} from '@smart-canteen/shared';
import { emitToCanteen, emitToKitchen, emitToOrder } from '../sockets';
import { QueueService } from './queue.service';

export class KitchenService {
  public static getStations(canteenId: string): KitchenStation[] {
    return db.findMany<KitchenStation>('kitchenStations', s => s.canteenId === canteenId);
  }

  public static getWorkers(canteenId: string): KitchenWorker[] {
    return db.findMany<KitchenWorker>('kitchenWorkers', w => w.canteenId === canteenId);
  }

  public static getKitchenOrders(canteenId: string): Order[] {
    return db.findMany<Order>('orders', o =>
      o.canteenId === canteenId &&
      [OrderStatus.QUEUED, OrderStatus.ASSIGNED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.QUALITY_CHECK, OrderStatus.READY].includes(o.orderStatus)
    ).sort((a, b) => (a.queuePosition || 999) - (b.queuePosition || 999));
  }

  public static async updateTaskStatus(orderId: string, taskId: string, status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'COMPLETED', workerId?: string): Promise<Order | null> {
    const order = db.findOne<Order>('orders', o => o._id === orderId);
    if (!order) return null;

    const task = order.tasks?.find(t => t.taskId === taskId);
    if (!task) return null;

    task.status = status;
    if (status === 'PREPARING' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if (status === 'COMPLETED') {
      task.completedAt = new Date().toISOString();
    }
    if (workerId) {
      task.workerId = workerId;
    }

    // Check overall order status transition
    const allCompleted = order.tasks.every(t => t.status === 'COMPLETED');
    const anyPreparing = order.tasks.some(t => t.status === 'PREPARING' || t.status === 'COMPLETED');

    if (allCompleted) {
      order.orderStatus = OrderStatus.READY;
      order.timestamps.ready = new Date().toISOString();
      QueueService.removeFromQueue(order._id, order.canteenId, OrderStatus.READY);
    } else if (anyPreparing && order.orderStatus !== OrderStatus.PREPARING) {
      order.orderStatus = OrderStatus.PREPARING;
      order.timestamps.preparingStarted = new Date().toISOString();
    }

    db.update('orders', orderId, order);
    this.recalculateStationLoads(order.canteenId);

    emitToOrder(orderId, SOCKET_EVENTS.ORDER_PROGRESS, { orderId, orderStatus: order.orderStatus, task });
    emitToKitchen(order.canteenId, SOCKET_EVENTS.KITCHEN_LOAD, { canteenId: order.canteenId });

    return order;
  }

  public static recalculateStationLoads(canteenId: string): void {
    const stations = db.findMany<KitchenStation>('kitchenStations', s => s.canteenId === canteenId);
    const activeOrders = this.getKitchenOrders(canteenId);

    stations.forEach(station => {
      let activeCount = 0;
      activeOrders.forEach(order => {
        const stationTasks = (order.tasks || []).filter(t => t.stationId === station._id && t.status !== 'COMPLETED');
        activeCount += stationTasks.length;
      });

      station.activeOrderCount = activeCount;
      station.currentLoad = Math.min(100, Math.round((activeCount / Math.max(1, station.capacity)) * 100));
      db.update('kitchenStations', station._id, {
        activeOrderCount: activeCount,
        currentLoad: station.currentLoad
      });
    });

    db.saveToDisk();
  }

  public static reallocateStation(orderId: string, taskId: string, newStationId: string): Order | null {
    const order = db.findOne<Order>('orders', o => o._id === orderId);
    if (!order) return null;

    const task = order.tasks?.find(t => t.taskId === taskId);
    const targetStation = db.findOne<KitchenStation>('kitchenStations', s => s._id === newStationId);
    if (!task || !targetStation) return null;

    task.stationId = targetStation._id;
    task.stationName = targetStation.name;
    task.stationType = targetStation.type;

    db.update('orders', orderId, order);
    this.recalculateStationLoads(order.canteenId);

    emitToKitchen(order.canteenId, SOCKET_EVENTS.KITCHEN_ASSIGNMENT, { orderId, task });
    return order;
  }
}
