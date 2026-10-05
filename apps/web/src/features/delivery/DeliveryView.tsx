import React from 'react';
import { Truck, MapPin, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';
import { Delivery } from '@smart-canteen/shared';

interface DeliveryViewProps {
  deliveries: Delivery[];
  onUpdateDeliveryStatus: (deliveryId: string, status: any) => Promise<void>;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ deliveries, onUpdateDeliveryStatus }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Campus Delivery & Runner Dispatch</h1>
            <p className="text-xs text-slate-400">Desk delivery routing, runner assignments and drop-off confirmations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deliveries.map(del => (
          <div key={del._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-purple-400">{del.orderNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  del.deliveryStatus === 'DELIVERED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {del.deliveryStatus}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-200">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{del.destination}</span>
              </div>

              <div className="text-[11px] text-slate-400">
                <span>Distance: ~{del.distanceKm} km (Campus Transit)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {del.deliveryStatus !== 'DELIVERED' ? (
                <button
                  onClick={() => onUpdateDeliveryStatus(del._id, 'DELIVERED')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Handover at Desk</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  ✓ Successfully Delivered
                </span>
              )}
            </div>
          </div>
        ))}
        {deliveries.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-500 text-xs">
            No campus desk delivery orders currently active.
          </div>
        )}
      </div>
    </div>
  );
};
