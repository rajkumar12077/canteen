import React from 'react';
import { X, Printer, CheckCircle, Receipt, UtensilsCrossed } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 text-slate-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-800 space-y-1">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center mx-auto text-white">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-white">Smart Canteen Tax Invoice</h2>
          <p className="text-xs text-slate-400">{invoice.canteenName || 'Main Tech Campus Cafeteria'}</p>
          <div className="text-[11px] font-mono text-slate-500">{invoice.invoiceNumber}</div>
        </div>

        {/* Order Details */}
        <div className="text-xs space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400">Order Ref:</span>
            <span className="font-mono font-bold text-white">{invoice.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Customer:</span>
            <span className="text-white">{invoice.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time:</span>
            <span>{new Date(invoice.generatedAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Transaction Ref:</span>
            <span className="font-mono text-slate-400">{invoice.transactionId}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(invoice.items || []).map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-800/60">
              <span>{item.quantity}x {item.nameSnapshot}</span>
              <span className="font-mono">₹{item.itemTotal || item.unitPrice * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Taxes & Totals */}
        <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount:</span>
              <span>-₹{invoice.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-400">
            <span>CGST + SGST (5%):</span>
            <span>₹{invoice.tax}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-700">
            <span>Total Paid:</span>
            <span className="text-orange-400 font-mono">₹{invoice.total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
