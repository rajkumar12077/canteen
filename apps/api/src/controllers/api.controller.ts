import { Request, Response } from 'express';
import { db } from '../storage';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { QueueService } from '../services/queue.service';
import { KitchenService } from '../services/kitchen.service';
import { DeliveryService } from '../services/delivery.service';
import { InventoryService } from '../services/inventory.service';
import { AnalyticsService } from '../services/analytics.service';
import { AIService } from '../services/ai.service';
import { OrderStatus, UserRole } from '@smart-canteen/shared';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ApiController {
  // Auth
  public static async register(req: Request, res: Response) {
    try {
      const data = await AuthService.register(req.body);
      res.status(201).json({ success: true, ...data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { passwordHash: _, ...userWithoutPass } = req.user;
    res.json({ success: true, user: userWithoutPass });
  }

  public static async switchRole(req: Request, res: Response) {
    try {
      const role = (req.body.role || req.params.role) as UserRole;
      const data = AuthService.switchRole(role);
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Canteens
  public static getCanteens(req: Request, res: Response) {
    const canteens = db.findMany('canteens');
    res.json({ success: true, canteens });
  }

  public static getCanteenById(req: Request, res: Response) {
    const canteen = db.findOne('canteens', c => c._id === req.params.id);
    if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
    res.json({ success: true, canteen });
  }

  // Menu
  public static getCategories(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    const categories = db.findMany('categories', c => !canteenId || c.canteenId === canteenId);
    res.json({ success: true, categories });
  }

  public static getMenuItems(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    const categoryId = req.query.categoryId as string;
    const items = db.findMany('menuItems', m => {
      if (canteenId && m.canteenId !== canteenId) return false;
      if (categoryId && m.categoryId !== categoryId) return false;
      return true;
    });
    res.json({ success: true, items });
  }

  // Orders
  public static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const customerId = req.user?._id || req.body.customerId || 'CUST-DEMO-01';
      const customerName = req.user?.name || req.body.customerName || 'Demo Customer';
      const order = await OrderService.createOrder({ ...req.body, customerId, customerName });
      res.status(201).json({ success: true, order });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static getOrders(req: AuthenticatedRequest, res: Response) {
    const canteenId = req.query.canteenId as string;
    const customerId = (req.query.myOrders === 'true' && req.user?._id) ? req.user._id : (req.query.customerId as string);
    const status = req.query.status as OrderStatus;
    const orders = OrderService.getOrders({ canteenId, customerId, status });
    res.json({ success: true, orders });
  }

  public static getOrderById(req: Request, res: Response) {
    const order = OrderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  }

  public static updateOrderStatus(req: Request, res: Response) {
    const order = OrderService.updateOrderStatus(req.params.id, req.body.status as OrderStatus);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  }

  // Queue
  public static getQueue(req: Request, res: Response) {
    const canteenId = (req.query.canteenId as string) || 'CANTEEN-01';
    const queue = QueueService.getCanteenQueue(canteenId);
    res.json({ success: true, queue, count: queue.length });
  }

  // Kitchen
  public static getKitchenStations(req: Request, res: Response) {
    const canteenId = (req.query.canteenId as string) || 'CANTEEN-01';
    const stations = KitchenService.getStations(canteenId);
    const workers = KitchenService.getWorkers(canteenId);
    res.json({ success: true, stations, workers });
  }

  public static getKitchenOrders(req: Request, res: Response) {
    const canteenId = (req.query.canteenId as string) || 'CANTEEN-01';
    const orders = KitchenService.getKitchenOrders(canteenId);
    res.json({ success: true, orders });
  }

  public static async updateTaskStatus(req: Request, res: Response) {
    const { orderId, taskId } = req.params;
    const { status, workerId } = req.body;
    const order = await KitchenService.updateTaskStatus(orderId, taskId, status, workerId);
    if (!order) return res.status(404).json({ success: false, message: 'Order or Task not found' });
    res.json({ success: true, order });
  }

  public static reallocateStation(req: Request, res: Response) {
    const { orderId, taskId } = req.params;
    const { targetStationId } = req.body;
    const order = KitchenService.reallocateStation(orderId, taskId, targetStationId);
    if (!order) return res.status(404).json({ success: false, message: 'Failed to reallocate task' });
    res.json({ success: true, order });
  }

  // Deliveries
  public static getDeliveries(req: Request, res: Response) {
    const agentId = req.query.agentId as string;
    const deliveries = DeliveryService.getDeliveries(agentId);
    res.json({ success: true, deliveries });
  }

  public static updateDeliveryStatus(req: Request, res: Response) {
    const delivery = DeliveryService.updateDeliveryStatus(req.params.id, req.body.status, req.body.otp);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, delivery });
  }

  // Inventory
  public static getInventory(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    const items = InventoryService.getItems(canteenId);
    res.json({ success: true, items });
  }

  public static updateStock(req: Request, res: Response) {
    const { adjustment, reason } = req.body;
    const item = InventoryService.updateStock(req.params.id, Number(adjustment), reason || 'Manual adjustment');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  }

  // Analytics
  public static getDashboardAnalytics(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    const analytics = AnalyticsService.getDashboardKPIs(canteenId);
    res.json({ success: true, ...analytics });
  }

  // AI
  public static async getAIRecommendations(req: Request, res: Response) {
    const recommendations = await AIService.getRecommendations();
    res.json({ success: true, recommendations });
  }

  public static async predictWaitTime(req: Request, res: Response) {
    const result = await AIService.predictWaitTime(req.body);
    res.json({ success: true, ...result });
  }

  public static async forecastDemand(req: Request, res: Response) {
    const canteenId = (req.query.canteenId as string) || 'CANTEEN-01';
    const horizon = (req.query.timeHorizon as string) || '3_HOURS';
    const result = await AIService.forecastDemand(canteenId, horizon);
    res.json({ success: true, ...result });
  }

  // Invoices
  public static getInvoiceByOrderId(req: Request, res: Response) {
    const invoice = db.findOne('invoices', inv => inv.orderId === req.params.orderId || inv.orderNumber === req.params.orderId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  }
}
