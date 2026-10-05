import React from 'react';
import {
  UtensilsCrossed, Monitor, ChefHat, BarChart3, ShoppingBag,
  Truck, Boxes, ShieldCheck, Search, Tv, Wifi, WifiOff
} from 'lucide-react';
import { UserRole } from '@smart-canteen/shared';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenCommandCenter: () => void;
  onOpenTvMode: () => void;
  socketConnected: boolean;
  selectedCanteen: string;
  onSelectCanteen: (canteenId: string) => void;
  canteens: any[];
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenCommandCenter,
  onOpenTvMode,
  socketConnected,
  selectedCanteen,
  onSelectCanteen,
  canteens
}) => {
  const roles = [
    { role: UserRole.CUSTOMER, label: 'Customer', icon: ShoppingBag, color: 'text-orange-400' },
    { role: UserRole.KITCHEN_STAFF, label: 'Kitchen KDS', icon: ChefHat, color: 'text-amber-400' },
    { role: UserRole.CANTEEN_MANAGER, label: 'Operations & AI', icon: Monitor, color: 'text-blue-400' },
    { role: UserRole.CASHIER, label: 'POS Cashier', icon: UtensilsCrossed, color: 'text-emerald-400' },
    { role: UserRole.DELIVERY_AGENT, label: 'Delivery', icon: Truck, color: 'text-purple-400' },
    { role: UserRole.INVENTORY_MANAGER, label: 'Inventory', icon: Boxes, color: 'text-teal-400' },
    { role: UserRole.ADMIN, label: 'Admin Analytics', icon: BarChart3, color: 'text-rose-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Smart Canteen</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">AI Operations</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Queue Prediction & Dynamic Order Allocation</p>
          </div>
        </div>

        {/* Canteen Selector & Command Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={selectedCanteen}
            onChange={(e) => onSelectCanteen(e.target.value)}
            className="bg-slate-800 text-xs sm:text-sm text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
          >
            {canteens.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenCommandCenter}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
            title="Search and Quick Actions (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Quick Actions</span>
            <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 font-mono">⌘K</kbd>
          </button>

          <button
            onClick={onOpenTvMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
            title="Open Token Pickup TV Display"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">TV Display</span>
          </button>

          {/* Socket Connection Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${
              socketConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
            title={socketConnected ? 'Live Real-time Socket Connected' : 'Disconnected, reconnecting...'}
          >
            {socketConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden lg:inline">{socketConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Role Navigation Bar */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 py-1.5 min-w-max">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">Role Switcher:</span>
          {roles.map(({ role, label, icon: Icon, color }) => {
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : color}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
