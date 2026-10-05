import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage';
import {
  Order, OrderItem, OrderStatus, OrderType, PaymentMethod, PaymentStatus,
  PriorityLevel, SOCKET_EVENTS, Invoice, Delivery, StationTask
} from '@smart-canteen/shared';
import { QueueService } from './queue.service';
import { KitchenService } from './kitchen.service';
import { AIService } from './ai.service';
import { emitToCanteen, emitToOrder, emitToKitchen } from '../sockets';

export class OrderService {
  private static orderCounter = 1000;

  public static async createOrder(data: {
    canteenId: string;
    customerId: string;
    customerName: string;
    customerPhone?: string;
    items: {
      menuItemId: string;
      quantity: number;
      variant?: string;
      addOns?: string[];
    }[];
    orderType: OrderType;
    deliveryAddress?: string;
    tableNumber?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
  }): Promise<Order> {
    const canteen = db.findOne<any>('canteens', c => c._id === data.canteenId);
    if (!canteen) throw new Error('Canteen not found');

    const taxConfig = canteen.taxConfiguration || { cgstRate: 2.5, sgstRate: 2.5, serviceChargeRate: 0, deliveryChargeBase: 15 };

    // Hydrate items
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const itemInput of data.items) {
      const menuItem = db.findOne<any>('menuItems', m => m._id === itemInput.menuItemId);
      if (!menuItem) continue;

      let unitPrice = menuItem.price;
      if (itemInput.variant) {
        const variantObj = menuItem.variants?.find((v: any) => v.name === itemInput.variant);
        if (variantObj) unitPrice += variantObj.priceDelta;
      }

      const itemTotal = unitPrice * itemInput.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        nameSnapshot: menuItem.name,
        quantity: itemInput.quantity,
        unitPrice,
        variant: itemInput.variant,
        addOns: itemInput.addOns,
        itemTotal,
        estimatedPreparationTime: menuItem.preparationTime || 5,
        stationType: menuItem.preparationStations?.[0] || 'GRILL',
        status: 'PENDING'
      });
    }

    if (orderItems.length === 0) {
      throw new Error('Order must contain at least one valid item');
    }

    // Coupon discount
    let discount = 0;
    if (data.couponCode) {
      const coupon = db.findOne<any>('coupons', c => c.code.toUpperCase() === data.couponCode?.toUpperCase() && c.status === 'ACTIVE');
      if (coupon && subtotal >= coupon.minimumOrder) {
        if (coupon.discountType === 'PERCENT') {
          discount = Math.min(coupon.maximumDiscount, (subtotal * coupon.discountValue) / 100);
        } else {
          discount = Math.min(coupon.maximumDiscount, coupon.discountValue);
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const cgst = Math.round(((discountedSubtotal * (taxConfig.cgstRate || 2.5)) / 100) * 100) / 100;
    const sgst = Math.round(((discountedSubtotal * (taxConfig.sgstRate || 2.5)) / 100) * 100) / 100;
    const serviceCharge = Math.round(((discountedSubtotal * (taxConfig.serviceChargeRate || 0)) / 100) * 100) / 100;
    const deliveryCharge = data.orderType === OrderType.OFFICE_DELIVERY || data.orderType === OrderType.ROOM_DELIVERY
      ? (taxConfig.deliveryChargeBase || 20) : 0;

    const total = Math.round((discountedSubtotal + cgst + sgst + serviceCharge + deliveryCharge) * 100) / 100;

    this.orderCounter++;
    const tokenNumber = (this.orderCounter % 900) + 100;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${tokenNumber}`;
    const orderId = uuidv4();

    // AI Dynamic Allocation & Task Decomposition
    const aiAllocation = await AIService.optimizeAllocation({
      orderId,
      orderNumber,
      items: orderItems,
      canteenId: data.canteenId
    });

    const tasks: StationTask[] = (aiAllocation.tasks || []).map((t: any, idx: number) => ({
      taskId: t.taskId || `TASK-${orderNumber}-${idx + 1}`,
      stationId: t.stationId,
      stationName: t.stationName,
      stationType: t.stationType,
      workerId: t.workerId,
      workerName: t.workerName,
      items: t.items,
      estimatedMinutes: t.estimatedMinutes,
      status: 'PENDING'
    }));

    const newOrder: Order = {
      _id: orderId,
      organizationId: canteen.organizationId,
      canteenId: data.canteenId,
      orderNumber,
      tokenNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: orderItems,
      tasks,
      orderType: data.orderType,
      deliveryAddress: data.deliveryAddress,
      tableNumber: data.tableNumber,
      subtotal,
      discount,
      couponCode: data.couponCode,
      cgst,
      sgst,
      serviceCharge,
      deliveryCharge,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: PaymentStatus.SUCCESS, // Auto-paid for mock/instant demo
      orderStatus: OrderStatus.QUEUED,
      priority: PriorityLevel.NORMAL,
      priorityScore: 50,
      estimatedPreparationTime: aiAllocation.estimatedWaitMinutes || 8,
      predictedWaitTime: aiAllocation.estimatedWaitMinutes || 8,
      predictedCompletionTime: new Date(Date.now() + (aiAllocation.estimatedWaitMinutes || 8) * 60000).toISOString(),
      assignedStation: aiAllocation.allocatedStationId,
      assignedStaff: aiAllocation.allocatedWorkerId,
      aiExplanation: aiAllocation.aiExplanation,
      notes: data.notes,
      timestamps: {
        created: new Date().toISOString(),
        paid: new Date().toISOString(),
        queued: new Date().toISOString()
      }
    };

    db.insert('orders', newOrder);

    // Add to Queue
    await QueueService.addToQueue(newOrder);

    // Update kitchen station loads
    KitchenService.recalculateStationLoads(data.canteenId);

    // Generate Invoice
    const invoice: Invoice = {
      _id: uuidv4(),
      invoiceNumber: `INV-${orderNumber}`,
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      canteenId: newOrder.canteenId,
      canteenName: canteen.name,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      discount: newOrder.discount,
      tax: newOrder.cgst + newOrder.sgst,
      serviceCharge: newOrder.serviceCharge,
      deliveryCharge: newOrder.deliveryCharge,
      total: newOrder.total,
      paymentMethod: newOrder.paymentMethod,
      transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      generatedAt: new Date().toISOString()
    };
    db.insert('invoices', invoice);

    // If delivery order, create delivery record
    if ([OrderType.OFFICE_DELIVERY, OrderType.ROOM_DELIVERY, OrderType.TABLE_DELIVERY].includes(data.orderType)) {
      const delivery: Delivery = {
        _id: uuidv4(),
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        destination: data.deliveryAddress || data.tableNumber || 'Campus Desk',
        distanceKm: 0.4,
        deliveryStatus: 'PENDING'
      };
      db.insert('deliveries', delivery);
    }

    // Broadcast
    emitToCanteen(data.canteenId, SOCKET_EVENTS.ORDER_CREATED, newOrder);
    emitToKitchen(data.canteenId, SOCKET_EVENTS.ORDER_QUEUED, newOrder);

    return newOrder;
  }

  public static getOrderById(orderId: string): Order | undefined {
    return db.findOne<Order>('orders', o => o._id === orderId);
  }

  public static getOrders(filters: {
    canteenId?: string;
    customerId?: string;
    status?: OrderStatus;
    limit?: number;
  }): Order[] {
    return db.findMany<Order>('orders', o => {
      if (filters.canteenId && o.canteenId !== filters.canteenId) return false;
      if (filters.customerId && o.customerId !== filters.customerId) return false;
      if (filters.status && o.orderStatus !== filters.status) return false;
      return true;
    }).sort((a, b) => new Date(b.timestamps.created).getTime() - new Date(a.timestamps.created).getTime());
  }

  public static updateOrderStatus(orderId: string, newStatus: OrderStatus): Order | null {
    const order = db.findOne<Order>('orders', o => o._id === orderId);
    if (!order) return null;

    order.orderStatus = newStatus;
    const now = new Date().toISOString();

    if (newStatus === OrderStatus.ACCEPTED) order.timestamps.accepted = now;
    if (newStatus === OrderStatus.PREPARING) order.timestamps.preparingStarted = now;
    if (newStatus === OrderStatus.QUALITY_CHECK) order.timestamps.qualityChecked = now;
    if (newStatus === OrderStatus.READY) {
      order.timestamps.ready = now;
      QueueService.removeFromQueue(order._id, order.canteenId, OrderStatus.READY);
    }
    if (newStatus === OrderStatus.OUT_FOR_DELIVERY) order.timestamps.outForDelivery = now;
    if (newStatus === OrderStatus.DELIVERED) order.timestamps.delivered = now;
    if (newStatus === OrderStatus.COMPLETED) order.timestamps.completed = now;
    if (newStatus === OrderStatus.CANCELLED) {
      order.timestamps.cancelled = now;
      QueueService.removeFromQueue(order._id, order.canteenId, OrderStatus.CANCELLED);
    }

    db.update('orders', orderId, order);
    KitchenService.recalculateStationLoads(order.canteenId);

    emitToOrder(orderId, SOCKET_EVENTS.ORDER_PROGRESS, order);
    emitToCanteen(order.canteenId, SOCKET_EVENTS.QUEUE_UPDATED, { canteenId: order.canteenId });
    emitToKitchen(order.canteenId, SOCKET_EVENTS.KITCHEN_LOAD, { canteenId: order.canteenId });

    return order;
  }
}
