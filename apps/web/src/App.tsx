import React, { useState, useEffect } from 'react';
import { UserRole, OrderStatus, SOCKET_EVENTS } from '@smart-canteen/shared';
import { apiClient, getSocket } from './services/api';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { PublicPickupDisplay } from './components/PublicPickupDisplay';
import { InvoiceModal } from './components/InvoiceModal';
import { CustomerView } from './features/customer/CustomerView';
import { KitchenView } from './features/kitchen/KitchenView';
import { ManagerView } from './features/manager/ManagerView';
import { PosView } from './features/pos/PosView';
import { DeliveryView } from './features/delivery/DeliveryView';
import { InventoryView } from './features/inventory/InventoryView';
import { AnalyticsView } from './features/analytics/AnalyticsView';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('smart_canteen_role') as UserRole) || UserRole.CUSTOMER;
  });
  const [selectedCanteen, setSelectedCanteen] = useState<string>('CANTEEN-01');
  const [canteens, setCanteens] = useState<any[]>([
    { _id: 'CANTEEN-01', name: 'Main Tech Campus Cafeteria' },
    { _id: 'CANTEEN-02', name: 'North Tower Express Bistro' }
  ]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const [socketConnected, setSocketConnected] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isTvModeOpen, setIsTvModeOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch role helper
  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('smart_canteen_role', newRole);
    try {
      const res = await apiClient.post('/auth/switch-role', { role: newRole });
      if (res.data.token) {
        localStorage.setItem('smart_canteen_token', res.data.token);
      }
      showToast(`Switched view to ${newRole.replace('_', ' ')}`);
    } catch (e) {
      // Demo fallback
      showToast(`Switched view to ${newRole.replace('_', ' ')}`);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [cRes, catRes, mRes, oRes, kRes, iRes, dRes, rRes, aRes] = await Promise.all([
        apiClient.get('/canteens').catch(() => ({ data: { canteens: [] } })),
        apiClient.get(`/menu/categories?canteenId=${selectedCanteen}`).catch(() => ({ data: { categories: [] } })),
        apiClient.get(`/menu/items?canteenId=${selectedCanteen}`).catch(() => ({ data: { items: [] } })),
        apiClient.get(`/orders?canteenId=${selectedCanteen}`).catch(() => ({ data: { orders: [] } })),
        apiClient.get(`/kitchen/stations?canteenId=${selectedCanteen}`).catch(() => ({ data: { stations: [], workers: [] } })),
        apiClient.get(`/inventory?canteenId=${selectedCanteen}`).catch(() => ({ data: { items: [] } })),
        apiClient.get(`/delivery`).catch(() => ({ data: { deliveries: [] } })),
        apiClient.get(`/ai/recommendations`).catch(() => ({ data: { recommendations: [] } })),
        apiClient.get(`/analytics/dashboard?canteenId=${selectedCanteen}`).catch(() => ({ data: null }))
      ]);

      if (cRes.data?.canteens?.length) setCanteens(cRes.data.canteens);
      if (catRes.data?.categories) setCategories(catRes.data.categories);
      if (mRes.data?.items) setMenuItems(mRes.data.items);
      if (oRes.data?.orders) setOrders(oRes.data.orders);
      if (kRes.data?.stations) setStations(kRes.data.stations);
      if (kRes.data?.workers) setWorkers(kRes.data.workers);
      if (iRes.data?.items) setInventoryItems(iRes.data.items);
      if (dRes.data?.deliveries) setDeliveries(dRes.data.deliveries);
      if (rRes.data?.recommendations) setRecommendations(rRes.data.recommendations);
      if (aRes.data) setAnalyticsData(aRes.data);
    } catch (err) {
      console.warn('[App] Error loading initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCanteen]);

  // Setup Socket.IO listener
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join:canteen', selectedCanteen);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on(SOCKET_EVENTS.ORDER_CREATED, (order: any) => {
      setOrders(prev => [order, ...prev.filter(o => o._id !== order._id)]);
      showToast(`⚡ New Order #${order.tokenNumber} queued!`);
    });

    socket.on(SOCKET_EVENTS.ORDER_PROGRESS, (update: any) => {
      setOrders(prev => prev.map(o => o._id === (update._id || update.orderId) ? { ...o, ...update } : o));
    });

    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, () => {
      fetchData();
    });

    socket.on(SOCKET_EVENTS.KITCHEN_LOAD, () => {
      apiClient.get(`/kitchen/stations?canteenId=${selectedCanteen}`).then(res => {
        if (res.data?.stations) setStations(res.data.stations);
      }).catch(() => {});
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off(SOCKET_EVENTS.ORDER_CREATED);
      socket.off(SOCKET_EVENTS.ORDER_PROGRESS);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED);
      socket.off(SOCKET_EVENTS.KITCHEN_LOAD);
    };
  }, [selectedCanteen]);

  // Handlers
  const handlePlaceOrder = async (orderData: any) => {
    const res = await apiClient.post('/orders', { ...orderData, canteenId: selectedCanteen });
    if (res.data?.order) {
      setOrders(prev => [res.data.order, ...prev]);
      showToast(`Order #${res.data.order.tokenNumber} placed successfully!`);
      return res.data.order;
    }
    return null;
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await apiClient.patch(`/orders/${orderId}/status`, { status });
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
    showToast(`Order updated to ${status}`);
  };

  const handleUpdateTaskStatus = async (orderId: string, taskId: string, status: any) => {
    await apiClient.patch(`/kitchen/tasks/${orderId}/${taskId}/status`, { status });
    fetchData();
  };

  const handleReallocateTask = async (orderId: string, taskId: string, targetStationId: string) => {
    await apiClient.post(`/kitchen/tasks/${orderId}/${taskId}/reallocate`, { targetStationId });
    fetchData();
    showToast('Task reallocated successfully');
  };

  const handleAdjustStock = async (itemId: string, adjustment: number) => {
    await apiClient.post(`/inventory/${itemId}/stock`, { adjustment, reason: 'Quick adjustment' });
    setInventoryItems(prev => prev.map(i => {
      if (i._id === itemId) {
        const next = Math.max(0, i.currentStock + adjustment);
        return { ...i, currentStock: next, availableStock: next - i.reservedStock };
      }
      return i;
    }));
    showToast(`Stock updated (${adjustment > 0 ? `+${adjustment}` : adjustment})`);
  };

  const handleApplyRecommendation = (recId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recId));
    showToast('AI recommendation applied and kitchen stations re-balanced!');
  };

  const handleViewInvoice = async (orderId: string) => {
    try {
      const res = await apiClient.get(`/invoices/${orderId}`);
      if (res.data?.invoice) {
        setSelectedInvoice(res.data.invoice);
      }
    } catch {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        setSelectedInvoice({
          invoiceNumber: `INV-${order.orderNumber}`,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          canteenName: 'Main Tech Campus Cafeteria',
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          tax: (order.cgst || 0) + (order.sgst || 0),
          total: order.total,
          transactionId: `TXN-DEMO-${order.tokenNumber}`,
          generatedAt: order.timestamps?.created || new Date().toISOString()
        });
      }
    }
  };

  const triggerQuickOrder = async () => {
    if (menuItems.length === 0) return;
    const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    await handlePlaceOrder({
      customerName: 'Quick AI Tester',
      items: [{ menuItemId: randomItem._id, quantity: 1 }],
      orderType: 'COUNTER_PICKUP',
      paymentMethod: 'MOCK_UPI'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        onOpenTvMode={() => setIsTvModeOpen(true)}
        socketConnected={socketConnected}
        selectedCanteen={selectedCanteen}
        onSelectCanteen={setSelectedCanteen}
        canteens={canteens}
      />

      {/* Main View Render */}
      <main className="flex-1 pb-16">
        {currentRole === UserRole.CUSTOMER && (
          <CustomerView
            menuItems={menuItems}
            categories={categories}
            activeOrders={orders}
            onPlaceOrder={handlePlaceOrder}
            onViewInvoice={handleViewInvoice}
          />
        )}

        {currentRole === UserRole.KITCHEN_STAFF && (
          <KitchenView
            orders={orders}
            stations={stations}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onReallocateTask={handleReallocateTask}
          />
        )}

        {currentRole === UserRole.CANTEEN_MANAGER && (
          <ManagerView
            stations={stations}
            workers={workers}
            queueLength={orders.filter(o => [OrderStatus.QUEUED, OrderStatus.PREPARING].includes(o.orderStatus)).length}
            recommendations={recommendations}
            onApplyRecommendation={handleApplyRecommendation}
          />
        )}

        {currentRole === UserRole.CASHIER && (
          <PosView
            menuItems={menuItems}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {currentRole === UserRole.DELIVERY_AGENT && (
          <DeliveryView
            deliveries={deliveries}
            onUpdateDeliveryStatus={async (id, status) => {
              await apiClient.patch(`/delivery/${id}/status`, { status });
              setDeliveries(prev => prev.map(d => d._id === id ? { ...d, deliveryStatus: status } : d));
              showToast(`Delivery status updated to ${status}`);
            }}
          />
        )}

        {currentRole === UserRole.INVENTORY_MANAGER && (
          <InventoryView
            items={inventoryItems}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
          <AnalyticsView
            analyticsData={analyticsData}
          />
        )}
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-orange-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CommandCenter
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        onSelectRole={handleRoleChange}
        onOpenTvMode={() => setIsTvModeOpen(true)}
        menuItems={menuItems}
        onSelectItem={(item) => showToast(`Selected ${item.name}`)}
        onTriggerQuickOrder={triggerQuickOrder}
      />

      <PublicPickupDisplay
        isOpen={isTvModeOpen}
        onClose={() => setIsTvModeOpen(false)}
        orders={orders}
        canteenName={canteens.find(c => c._id === selectedCanteen)?.name}
      />

      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
