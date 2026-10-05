import React, { useState, useEffect } from 'react';
import { Search, X, ChefHat, ShoppingBag, Monitor, BarChart3, Tv, Zap } from 'lucide-react';
import { UserRole } from '@smart-canteen/shared';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
  onOpenTvMode: () => void;
  menuItems: any[];
  onSelectItem: (item: any) => void;
  onTriggerQuickOrder: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onOpenTvMode,
  menuItems,
  onSelectItem,
  onTriggerQuickOrder
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command, food item, or role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Lists */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">Quick Actions</div>
            <div className="space-y-1">
              <button
                onClick={() => { onTriggerQuickOrder(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-orange-500/10 hover:text-orange-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span>Simulate Instant Customer Order (AI Queued)</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Simulation</span>
              </button>
              <button
                onClick={() => { onOpenTvMode(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Open Public Token Pickup Display</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Display</span>
              </button>
            </div>
          </div>

          {/* Switch Roles */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">Switch View / Role</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { onSelectRole(UserRole.CUSTOMER); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition text-left"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                <span>Customer Menu</span>
              </button>
              <button
                onClick={() => { onSelectRole(UserRole.KITCHEN_STAFF); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition text-left"
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>Kitchen KDS Screen</span>
              </button>
              <button
                onClick={() => { onSelectRole(UserRole.CANTEEN_MANAGER); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition text-left"
              >
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>Operations & AI Center</span>
              </button>
              <button
                onClick={() => { onSelectRole(UserRole.ADMIN); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition text-left"
              >
                <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
                <span>Enterprise Analytics</span>
              </button>
            </div>
          </div>

          {/* Menu Search Results */}
          {filteredItems.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">Food Items ({filteredItems.length})</div>
              <div className="space-y-1">
                {filteredItems.slice(0, 5).map(item => (
                  <button
                    key={item._id}
                    onClick={() => { onSelectItem(item); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-orange-400">₹{item.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
