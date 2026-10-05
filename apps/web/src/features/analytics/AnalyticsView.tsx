import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  TrendingUp, DollarSign, Clock, CheckCircle2, AlertOctagon, BarChart3,
  Layers, Users, Award, ShieldCheck
} from 'lucide-react';

interface AnalyticsViewProps {
  analyticsData: any;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analyticsData }) => {
  const kpis = analyticsData?.kpis || {
    totalOrders: 5204,
    activeOrders: 5,
    completedOrders: 5198,
    totalRevenue: 642850,
    averageWaitMinutes: 6.8,
    kitchenUtilizationPercent: 54,
    aiAccuracyScore: 94.8,
    customerSatisfaction: 4.8
  };

  const hourlyData = analyticsData?.hourlyData || [
    { hour: '08:00', orders: 18, revenue: 2450 },
    { hour: '09:00', orders: 42, revenue: 5600 },
    { hour: '10:00', orders: 25, revenue: 3200 },
    { hour: '11:00', orders: 30, revenue: 4100 },
    { hour: '12:00', orders: 95, revenue: 14200 },
    { hour: '13:00', orders: 120, revenue: 18500 },
    { hour: '14:00', orders: 65, revenue: 9800 },
    { hour: '15:00', orders: 22, revenue: 2900 },
    { hour: '16:00', orders: 38, revenue: 4900 },
    { hour: '17:00', orders: 78, revenue: 10400 },
    { hour: '18:00', orders: 50, revenue: 6800 },
    { hour: '19:00', orders: 28, revenue: 3900 }
  ];

  const topItems = analyticsData?.topItems || [
    { name: 'Ghee Roast Masala Dosa', count: 1420, revenue: 156200 },
    { name: 'Peri-Peri Crinkle Cut Fries', count: 2100, revenue: 199500 },
    { name: 'Hazelnut Cold Brew Latte', count: 2650, revenue: 344500 },
    { name: 'Crispy Veggie Supreme Burger', count: 1840, revenue: 294400 },
    { name: 'Charcoal Paneer Tikka Kathi Roll', count: 920, revenue: 161000 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-400" />
            <span>Executive Business Intelligence & Queue Metrics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Multi-canteen operational analytics, SLA fulfillment, and AI model performance</p>
        </div>
        <span className="text-xs bg-rose-500/10 text-rose-400 font-semibold px-3 py-1 rounded-full border border-rose-500/20">
          Last 30 Days Consolidated
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Revenue</span>
          <span className="text-2xl font-black text-white font-mono">₹{kpis.totalRevenue.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">↑ +18.4% vs last period</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Orders Fulfilled</span>
          <span className="text-2xl font-black text-orange-400 font-mono">{kpis.totalOrders.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">99.2% fulfillment rate</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Avg Waiting Time</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">{kpis.averageWaitMinutes} min</span>
          <span className="text-[11px] text-emerald-400 mt-1 block">Within 8 min SLA target</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">AI Prediction Accuracy</span>
          <span className="text-2xl font-black text-purple-400 font-mono">{kpis.aiAccuracyScore}%</span>
          <span className="text-[11px] text-purple-400/80 mt-1 block">R² Score: 0.973</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Peak Hour Order Volume Distribution</h3>
            <span className="text-xs text-slate-400">Notice peaks at 13:00 and 17:00</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Best Sellers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Top 5 Revenue Drivers</h3>
            <span className="text-xs text-slate-400">By Orders</span>
          </div>

          <div className="space-y-3">
            {topItems.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="font-bold text-white block">{item.name}</span>
                  <span className="text-slate-400 text-[11px]">{item.count.toLocaleString()} orders</span>
                </div>
                <span className="font-mono font-bold text-orange-400">₹{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
