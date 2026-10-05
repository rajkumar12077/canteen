import React, { useState } from 'react';
import {
  ChefHat, Clock, AlertTriangle, CheckCircle2, Play, Flame, RefreshCw,
  SlidersHorizontal, CheckSquare, Sparkles
} from 'lucide-react';
import { Order, OrderStatus, StationType } from '@smart-canteen/shared';

interface KitchenViewProps {
  orders: Order[];
  stations: any[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdateTaskStatus: (orderId: string, taskId: string, status: any) => Promise<void>;
  onReallocateTask: (orderId: string, taskId: string, targetStationId: string) => Promise<void>;
}

export const KitchenView: React.FC<KitchenViewProps> = ({
  orders,
  stations,
  onUpdateOrderStatus,
  onUpdateTaskStatus,
  onReallocateTask
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('ALL');

  // Filter orders by station
  const filteredOrders = orders.filter(order => {
    if (selectedStation === 'ALL') return true;
    return (order.tasks || []).some(t => t.stationId === selectedStation || t.stationType === selectedStation);
  });

  const queuedOrders = filteredOrders.filter(o => [OrderStatus.QUEUED, OrderStatus.ASSIGNED].includes(o.orderStatus));
  const preparingOrders = filteredOrders.filter(o => o.orderStatus === OrderStatus.PREPARING || o.orderStatus === OrderStatus.ACCEPTED);
  const readyOrders = filteredOrders.filter(o => o.orderStatus === OrderStatus.READY);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls & Station Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-400">Dynamic Task Queue & Station Line Orchestrator</p>
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 min-w-max">
          <button
            onClick={() => setSelectedStation('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedStation === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Stations ({orders.length})
          </button>
          {stations.map(st => (
            <button
              key={st._id}
              onClick={() => setSelectedStation(st._id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedStation === st._id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{st.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${st.currentLoad > 70 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {st.currentLoad}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Queued / Incoming */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Queued</h3>
            </div>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">
              {queuedOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {queuedOrders.map(order => (
              <div
                key={order._id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-amber-400 font-mono">#{order.tokenNumber}</span>
                    <span className="text-xs text-slate-400 font-mono">({order.orderNumber})</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                    Est {order.estimatedPreparationTime}m
                  </span>
                </div>

                {/* Items */}
                <div className="bg-slate-950/60 rounded-xl p-2.5 space-y-1.5 border border-slate-800">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-200">
                      <span className="font-bold text-white">{item.quantity}x {item.nameSnapshot}</span>
                      <span className="text-[11px] text-slate-400">{item.stationType}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{order.customerName}</span>
                  <button
                    onClick={() => onUpdateOrderStatus(order._id, OrderStatus.PREPARING)}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-md shadow-amber-500/20"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Prep</span>
                  </button>
                </div>
              </div>
            ))}
            {queuedOrders.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">No orders in queue.</div>
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">In Preparation</h3>
            </div>
            <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {preparingOrders.map(order => (
              <div
                key={order._id}
                className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-amber-300 font-mono">#{order.tokenNumber}</span>
                    <span className="text-xs text-slate-400 font-mono">({order.orderNumber})</span>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Prep
                  </span>
                </div>

                {/* Subtask Checklists (Section 33 Task Decomposition) */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Station Tasks:</span>
                  {(order.tasks || []).map(task => (
                    <div
                      key={task.taskId}
                      className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{task.stationName}</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1 rounded">{task.workerName || 'Line Cook'}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {task.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
                        </div>
                      </div>

                      <button
                        onClick={() => onUpdateTaskStatus(order._id, task.taskId, task.status === 'COMPLETED' ? 'PREPARING' : 'COMPLETED')}
                        className={`p-1.5 rounded-lg border transition ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Mark station task complete"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>ETA: {order.predictedWaitTime || 4} min</span>
                  </span>
                  <button
                    onClick={() => onUpdateOrderStatus(order._id, OrderStatus.READY)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Ready</span>
                  </button>
                </div>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">No active preparations.</div>
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Ready for Pickup</h3>
            </div>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {readyOrders.map(order => (
              <div
                key={order._id}
                className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-300 font-mono">#{order.tokenNumber}</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    At Counter
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity}x {item.nameSnapshot}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">{order.customerName}</span>
                  <button
                    onClick={() => onUpdateOrderStatus(order._id, OrderStatus.COMPLETED)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    <span>Handed Over</span>
                  </button>
                </div>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">No orders waiting at pickup counter.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
