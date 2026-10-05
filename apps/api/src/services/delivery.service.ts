import { db } from '../storage';
import { Delivery, OrderStatus, SOCKET_EVENTS } from '@smart-canteen/shared';
import { emitToOrder } from '../sockets';
import { OrderService } from './order.service';

export class DeliveryService {
  public static getDeliveries(agentId?: string): Delivery[] {
    return db.findMany<Delivery>('deliveries', d => !agentId || d.agentId === agentId);
  }

  public static assignAgent(deliveryId: string, agentId: string, agentName: string): Delivery | null {
    const delivery = db.findOne<Delivery>('deliveries', d => d._id === deliveryId);
    if (!delivery) return null;

    delivery.agentId = agentId;
    delivery.agentName = agentName;
    delivery.deliveryStatus = 'ASSIGNED';
    db.update('deliveries', deliveryId, delivery);

    return delivery;
  }

  public static updateDeliveryStatus(deliveryId: string, status: Delivery['deliveryStatus'], otp?: string): Delivery | null {
    const delivery = db.findOne<Delivery>('deliveries', d => d._id === deliveryId);
    if (!delivery) return null;

    delivery.deliveryStatus = status;
    const now = new Date().toISOString();

    if (status === 'PICKED_UP') delivery.pickupTime = now;
    if (status === 'OUT_FOR_DELIVERY') {
      delivery.dispatchTime = now;
      OrderService.updateOrderStatus(delivery.orderId, OrderStatus.OUT_FOR_DELIVERY);
    }
    if (status === 'DELIVERED') {
      delivery.deliveryTime = now;
      OrderService.updateOrderStatus(delivery.orderId, OrderStatus.DELIVERED);
    }

    db.update('deliveries', deliveryId, delivery);
    emitToOrder(delivery.orderId, SOCKET_EVENTS.ORDER_PROGRESS, { delivery });

    return delivery;
  }
}
