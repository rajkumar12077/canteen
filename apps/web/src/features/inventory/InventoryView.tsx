import React from 'react';
import { Boxes, AlertTriangle, Plus, Minus, CheckCircle, Package } from 'lucide-react';
import { InventoryItem } from '@smart-canteen/shared';

interface InventoryViewProps {
  items: InventoryItem[];
  onAdjustStock: (itemId: string, adjustment: number) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onAdjustStock }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Live Kitchen Inventory & Raw Materials</h1>
            <p className="text-xs text-slate-400">Ingredient safety thresholds, auto-consumption ledger and replenishment</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item / Ingredient</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal-400" />
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{item.sku}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {item.reservedStock} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'LOW_STOCK' || item.status === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onAdjustStock(item._id, -5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => onAdjustStock(item._id, 10)}
                        className="px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
