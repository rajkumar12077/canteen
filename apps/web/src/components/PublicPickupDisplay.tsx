import React from 'react';
import { X, Bell, Clock, Sparkles } from 'lucide-react';
import { Order, OrderStatus } from '@smart-canteen/shared';

interface PublicPickupDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  canteenName?: string;
}

export const PublicPickupDisplay: React.FC<PublicPickupDisplayProps> = ({
  isOpen,
  onClose,
  orders,
  canteenName = 'Main Tech Campus Cafeteria'
}) => {
  if (!isOpen) return null;

  const preparingOrders = orders.filter(o => [OrderStatus.PREPARING, OrderStatus.QUEUED, OrderStatus.ACCEPTED].includes(o.orderStatus));
  const readyOrders = orders.filter(o => o.orderStatus === OrderStatus.READY);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-white font-sans">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center font-black text-2xl tracking-tighter">
            SC
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{canteenName}</h1>
            <p className="text-sm text-slate-400">Order Pickup & Queue Status Screen</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-sm">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400">Avg Wait:</span>
            <span className="font-bold text-white">6-8 min</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Exit Fullscreen TV Mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Grid Columns */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 overflow-hidden">
        {/* Preparing Column */}
        <div className="p-8 flex flex-col bg-slate-950">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping"></span>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-amber-400">Now Preparing</h2>
            </div>
            <span className="text-sm font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {preparingOrders.length} In Kitchen
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {preparingOrders.map(order => (
              <div
                key={order._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-lg"
              >
                <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Token</span>
                <span className="text-4xl font-black text-amber-300 font-mono">#{order.tokenNumber}</span>
                <span className="text-[11px] text-slate-400 mt-2 truncate w-full">{order.customerName}</span>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <div className="col-span-3 text-center py-20 text-slate-500 font-medium">
                No orders currently in preparation queue.
              </div>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="p-8 flex flex-col bg-emerald-950/20">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-900/40">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                Ready for Pickup <Bell className="w-6 h-6 animate-bounce" />
              </h2>
            </div>
            <span className="text-sm font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              {readyOrders.length} Ready
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {readyOrders.map(order => (
              <div
                key={order._id}
                className="bg-emerald-900/30 border-2 border-emerald-500 rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10 animate-pulse"
              >
                <span className="text-xs text-emerald-300 uppercase tracking-wider mb-1 font-semibold">Counter #1</span>
                <span className="text-4xl font-black text-emerald-300 font-mono">#{order.tokenNumber}</span>
                <span className="text-[11px] text-emerald-200 mt-2 truncate w-full font-medium">{order.customerName}</span>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div className="col-span-3 text-center py-20 text-slate-500 font-medium">
                All ready orders have been collected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Please collect your food with your token receipt at the designated station counter.</span>
        </div>
        <div className="text-slate-500">Live AI Canteen Display System • {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};
