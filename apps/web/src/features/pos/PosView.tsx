import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Minus, CreditCard, Banknote, ShieldCheck, Printer, Check } from 'lucide-react';
import { OrderType, PaymentMethod } from '@smart-canteen/shared';

interface PosViewProps {
  menuItems: any[];
  onPlaceOrder: (orderData: any) => Promise<any>;
}

export const PosView: React.FC<PosViewProps> = ({ menuItems, onPlaceOrder }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('Counter Walk-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  const addItem = (item: any) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i._id === id) {
        const q = i.quantity + delta;
        return q > 0 ? { ...i, quantity: q } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const total = Math.round(subtotal * 1.05 * 100) / 100; // 5% tax

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await onPlaceOrder({
        customerName: customerName || 'Walk-in Guest',
        items: cart.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
        orderType: OrderType.COUNTER_PICKUP,
        paymentMethod
      });
      setLastPlacedOrder(res);
      setCart([]);
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">POS Cashier Counter Terminal</h1>
            <p className="text-xs text-slate-400">High-speed walk-in counter ordering and instant token generation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rapid-tap items grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Tap Items to Add</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {menuItems.map(item => (
              <button
                key={item._id}
                onClick={() => addItem(item)}
                className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-left transition flex flex-col justify-between h-28 group"
              >
                <div>
                  <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition block truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-500">{item.preparationTime}m prep</span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="font-mono font-bold text-sm text-emerald-400">₹{item.price}</span>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Register / Cart Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Active Ticket</h3>
              <span className="text-xs text-slate-400">{cart.length} items</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Customer / Guest Identifier</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Cart Items */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {cart.map(i => (
                <div key={i._id} className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white truncate max-w-[120px]">{i.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(i._id, -1)} className="p-0.5 bg-slate-800 rounded"><Minus className="w-3 h-3" /></button>
                    <span className="font-mono font-bold px-1">{i.quantity}</span>
                    <button onClick={() => updateQty(i._id, 1)} className="p-0.5 bg-slate-800 rounded"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="font-mono font-bold text-white">₹{i.price * i.quantity}</span>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">Tap menu items to add to POS ticket.</div>
              )}
            </div>

            {/* Payment Method Toggle */}
            <div>
              <span className="text-xs text-slate-400 block mb-1.5">Payment Method</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { m: PaymentMethod.CASH, label: 'Cash' },
                  { m: PaymentMethod.MOCK_UPI, label: 'UPI QR' },
                  { m: PaymentMethod.CARD, label: 'Card' }
                ].map(({ m, label }) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      paymentMethod === m
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-300">Total with Tax:</span>
              <span className="text-xl text-emerald-400 font-mono">₹{total}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isSubmitting ? 'Routing...' : 'Print Token & Punch Order'}</span>
            </button>

            {lastPlacedOrder && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-center">
                <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Order Placed</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">Token #{lastPlacedOrder.tokenNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
