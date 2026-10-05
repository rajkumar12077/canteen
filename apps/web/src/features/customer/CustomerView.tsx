import React, { useState } from 'react';
import {
  ShoppingBag, Sparkles, Clock, CheckCircle2, AlertCircle, Plus, Minus,
  ChevronRight, ArrowRight, Tag, Receipt, MessageSquare, Search, Filter
} from 'lucide-react';
import { Order, OrderStatus, OrderType, PaymentMethod } from '@smart-canteen/shared';

interface CustomerViewProps {
  menuItems: any[];
  categories: any[];
  activeOrders: Order[];
  onPlaceOrder: (orderData: any) => Promise<any>;
  onViewInvoice: (orderId: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  menuItems,
  categories,
  activeOrders,
  onPlaceOrder,
  onViewInvoice
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.COUNTER_PICKUP);
  const [deliveryLocation, setDeliveryLocation] = useState('Tower A, Floor 4, Desk 412');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.MOCK_UPI);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantMessages, setAiAssistantMessages] = useState<any[]>([
    { sender: 'ai', text: 'Hi Ananya! I am your Canteen AI. Ask me for fastest meals right now, healthy options, or popular picks!' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Cart operations
  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i._id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME20') {
      setCouponDiscount(40);
    } else if (couponCode.toUpperCase() === 'LUNCH50') {
      setCouponDiscount(50);
    } else {
      alert('Invalid coupon code. Try WELCOME20 or LUNCH50');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cgst = Math.round(subtotal * 0.025 * 100) / 100;
  const sgst = Math.round(subtotal * 0.025 * 100) / 100;
  const deliveryCharge = orderType === OrderType.OFFICE_DELIVERY ? 15 : 0;
  const total = Math.max(0, subtotal - couponDiscount + cgst + sgst + deliveryCharge);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await onPlaceOrder({
        items: cart.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
        orderType,
        deliveryAddress: orderType === OrderType.OFFICE_DELIVERY ? deliveryLocation : undefined,
        paymentMethod,
        couponCode: couponDiscount > 0 ? couponCode : undefined
      });
      setCart([]);
      setIsCartOpen(false);
      setCouponDiscount(0);
      setCouponCode('');
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiQuery = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiAssistantMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');

    setTimeout(() => {
      let reply = "Our South Indian Hot Counter currently has the fastest throughput! The Ghee Roast Masala Dosa has only a 4-minute queue wait.";
      if (userMsg.toLowerCase().includes('healthy') || userMsg.toLowerCase().includes('calorie')) {
        reply = "For healthy options, I recommend Steamed Button Idli (210 kcal, 0 cholesterol) paired with fresh cold brew latte!";
      } else if (userMsg.toLowerCase().includes('burger')) {
        reply = "The Crispy Veggie Supreme Burger is a top seller (4.7 ⭐), estimated preparation time is 7 minutes at Grill Station.";
      }
      setAiAssistantMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const latestActiveOrder = activeOrders.find(o =>
    [OrderStatus.QUEUED, OrderStatus.ASSIGNED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY].includes(o.orderStatus)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Active Order Tracker Card (Section 26 & 27) */}
      {latestActiveOrder && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-orange-500/40 rounded-2xl p-5 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Live Order Status</span>
                <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 font-mono">
                  Token #{latestActiveOrder.tokenNumber}
                </span>
                <span className="text-xs text-slate-400 font-mono">({latestActiveOrder.orderNumber})</span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {latestActiveOrder.orderStatus === OrderStatus.READY ? '🎉 Your order is READY for pickup!' : 'Kitchen is preparing your meal'}
              </h2>
              {latestActiveOrder.aiExplanation && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{latestActiveOrder.aiExplanation}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Queue Position</span>
                <span className="text-2xl font-black text-orange-400 font-mono">#{latestActiveOrder.queuePosition || 1}</span>
              </div>
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Estimated Wait</span>
                <span className="text-2xl font-black text-white font-mono">{latestActiveOrder.predictedWaitTime || 5}m</span>
              </div>
              <button
                onClick={() => onViewInvoice(latestActiveOrder._id)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition"
              >
                <Receipt className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Receipt</span>
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="pt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-1 shadow-md shadow-emerald-500/20">✓</div>
              <span className="font-semibold text-emerald-400">Order Queued</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 ${
                [OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY].includes(latestActiveOrder.orderStatus)
                  ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>✓</div>
              <span className={latestActiveOrder.orderStatus === OrderStatus.QUEUED ? 'text-slate-500' : 'text-slate-200'}>Assigned</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 ${
                [OrderStatus.PREPARING, OrderStatus.READY].includes(latestActiveOrder.orderStatus)
                  ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'
              }`}>3</div>
              <span className={latestActiveOrder.orderStatus === OrderStatus.PREPARING ? 'text-amber-400 font-bold' : 'text-slate-400'}>Preparing</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 ${
                latestActiveOrder.orderStatus === OrderStatus.READY
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-700 text-slate-400'
              }`}>4</div>
              <span className={latestActiveOrder.orderStatus === OrderStatus.READY ? 'text-emerald-400 font-bold' : 'text-slate-500'}>Ready for Pickup</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Greeting & AI Assistant Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-white">Good day, Ananya! 🥪</h1>
          <p className="text-sm text-slate-400 mt-1">
            Current campus canteen queue is <span className="text-emerald-400 font-semibold">Fast (4-6 min avg wait)</span>. Order ahead to skip counter lines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Food Assistant</span>
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition relative"
          >
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 min-w-max">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat._id
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Veg toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 w-48 sm:w-60"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              vegOnly ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Veg Only</span>
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map(item => {
          const inCart = cart.find(i => i._id === item._id);
          return (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.isVeg ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                  }`}>
                    {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded-lg text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>{item.preparationTime}m prep</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition">{item.name}</h3>
                    <span className="text-xs font-semibold text-amber-400 flex items-center">⭐ {item.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Price</span>
                    <span className="text-base font-bold text-white">₹{item.price}</span>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2 bg-orange-600 rounded-xl px-2 py-1 text-white">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-orange-700 rounded">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold px-1">{inCart.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-orange-700 rounded">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:border-orange-500 transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h2 className="font-bold text-lg text-white">Your Order</h2>
                <span className="text-xs text-slate-400">({cart.length} items)</span>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white text-xs font-medium">Close</button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 py-4 space-y-3 overflow-y-auto">
              {cart.map(item => (
                <div key={item._id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-xs text-slate-400 font-medium">₹{item.price} each</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-2 py-1">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-0.5 text-slate-300 hover:text-white">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1 text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-0.5 text-slate-300 hover:text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-white w-12 text-right">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-xs">Your cart is empty. Add fresh items from the menu!</div>
              )}
            </div>

            {/* Checkout Configurations */}
            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-4">
                {/* Fulfillment Type */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1.5">Fulfillment Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrderType(OrderType.COUNTER_PICKUP)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        orderType === OrderType.COUNTER_PICKUP
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Counter Pickup
                    </button>
                    <button
                      onClick={() => setOrderType(OrderType.OFFICE_DELIVERY)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        orderType === OrderType.OFFICE_DELIVERY
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Office Delivery (+₹15)
                    </button>
                  </div>
                </div>

                {/* Delivery Location Input if Office Delivery */}
                {orderType === OrderType.OFFICE_DELIVERY && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Campus Desk / Room</span>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {/* Coupon Code */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Coupon Promo</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="WELCOME20 or LUNCH50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 rounded-xl text-xs font-bold"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-800/40 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount Coupon</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>CGST + SGST (5%)</span>
                    <span>₹{cgst + sgst}</span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Campus Delivery Fee</span>
                      <span>₹{deliveryCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-700">
                    <span>Grand Total</span>
                    <span className="text-orange-400">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Routing to Kitchen via AI...' : `Pay ₹${total} & Place Order`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer AI Assistant Drawer */}
      {aiAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-lg text-white">Smart Canteen AI Copilot</h2>
              </div>
              <button onClick={() => setAiAssistantOpen(false)} className="text-slate-400 hover:text-white text-xs">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {aiAssistantMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask e.g. 'What is fastest to get right now?'"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleAiQuery}
                className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
