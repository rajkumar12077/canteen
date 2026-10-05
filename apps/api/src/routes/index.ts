import { Router } from 'express';
import { ApiController } from '../controllers/api.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Auth
router.post('/auth/register', ApiController.register);
router.post('/auth/login', ApiController.login);
router.get('/auth/me', authenticate, ApiController.getProfile);
router.post('/auth/switch-role', ApiController.switchRole);
router.get('/auth/switch-role/:role', ApiController.switchRole);

// Canteens
router.get('/canteens', ApiController.getCanteens);
router.get('/canteens/:id', ApiController.getCanteenById);

// Menu
router.get('/menu/categories', ApiController.getCategories);
router.get('/menu/items', ApiController.getMenuItems);

// Orders
router.post('/orders', authenticate, ApiController.createOrder);
router.get('/orders', authenticate, ApiController.getOrders);
router.get('/orders/:id', ApiController.getOrderById);
router.patch('/orders/:id/status', ApiController.updateOrderStatus);

// Queue
router.get('/queue', ApiController.getQueue);

// Kitchen
router.get('/kitchen/stations', ApiController.getKitchenStations);
router.get('/kitchen/orders', ApiController.getKitchenOrders);
router.patch('/kitchen/tasks/:orderId/:taskId/status', ApiController.updateTaskStatus);
router.post('/kitchen/tasks/:orderId/:taskId/reallocate', ApiController.reallocateStation);

// Delivery
router.get('/delivery', ApiController.getDeliveries);
router.patch('/delivery/:id/status', ApiController.updateDeliveryStatus);

// Inventory
router.get('/inventory', ApiController.getInventory);
router.post('/inventory/:id/stock', ApiController.updateStock);

// Analytics
router.get('/analytics/dashboard', ApiController.getDashboardAnalytics);

// AI
router.get('/ai/recommendations', ApiController.getAIRecommendations);
router.post('/ai/predict-wait', ApiController.predictWaitTime);
router.get('/ai/forecast-demand', ApiController.forecastDemand);

// Invoices
router.get('/invoices/:orderId', ApiController.getInvoiceByOrderId);

export default router;
