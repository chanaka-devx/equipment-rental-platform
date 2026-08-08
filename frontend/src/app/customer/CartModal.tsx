'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CartModal({ open, onClose }: CartModalProps) {
  const { cart, startDate, endDate, setStartDate, setEndDate, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const getDuration = () => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    return diff > 0 ? diff : 1;
  };

  const duration = getDuration();
  const subtotal = cart.reduce((s, i) => s + Number(i.equipment.rentalPrice ?? 0) * i.quantity * duration, 0);
  const totalDeposit = cart.reduce((s, i) => s + Number(i.equipment.deposit ?? 0) * i.quantity, 0);
  const grandTotal = subtotal + totalDeposit;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleReserve = () => {
    setSubmitError('');
    if (!startDate || !endDate) { setSubmitError('Please select both start and end dates.'); return; }
    if (new Date(endDate) <= new Date(startDate)) { setSubmitError('End date must be after start date.'); return; }
    onClose();
    router.push('/checkout');
  };

  return (
    <div
      ref={ref}
      className="absolute -right-20 sm:right-0 top-full mt-3 w-[360px] sm:w-[390px] max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] flex flex-col max-h-[82vh] overflow-hidden"
    >
      {/* Notch */}
      <div className="absolute -top-2 right-[85px] sm:right-5 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45 z-10" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F97316] text-xl">shopping_cart</span>
          <h2 className="text-base font-bold text-[#0F172A]">Your Rental Cart</h2>
          {totalItems > 0 && (
            <span className="bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-200">shopping_cart_off</span>
            <p className="text-sm text-slate-500 font-medium">Your cart is empty.</p>
            <button onClick={onClose} className="text-xs text-[#F97316] hover:underline font-bold">
              Continue Browsing →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-slate-100">
              {cart.map((item) => {
                let img = 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png';
                const imgs = item.equipment.images;
                if (Array.isArray(imgs) && imgs.length > 0) {
                  img = imgs[0];
                } else if (typeof imgs === 'string') {
                  try {
                    const parsed = JSON.parse(imgs);
                    if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                    else img = imgs;
                  } catch (e) {
                    img = imgs;
                  }
                }
                return (
                  <div key={item.equipment.id} className="py-3 flex gap-3">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img src={img} alt={item.equipment.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-xs text-[#0F172A] truncate">{item.equipment.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Rs.{Number(item.equipment.rentalPrice ?? 0).toFixed(2)}/day</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => updateQuantity(item.equipment.id, item.quantity - 1)} className="w-5 h-5 rounded border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] flex items-center justify-center text-xs font-bold transition-colors">-</button>
                        <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.equipment.id, item.quantity + 1)} className="w-5 h-5 rounded border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] flex items-center justify-center text-xs font-bold transition-colors">+</button>
                        <div className="flex-grow" />
                        <button onClick={() => removeFromCart(item.equipment.id)} className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[11px]">delete</span>Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rental Dates */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Rental Period</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Start</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">End</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-[#F97316]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-3 shrink-0">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between"><span>Duration:</span><span className="font-bold text-slate-800">{duration} {duration === 1 ? 'day' : 'days'}</span></div>
            <div className="flex justify-between"><span>Rental Cost:</span><span className="font-bold text-slate-800">Rs.{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Security Deposit:</span><span className="font-bold text-slate-800">Rs.{totalDeposit.toFixed(2)}</span></div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between text-sm font-extrabold text-[#0F172A]">
              <span>Total Estimated:</span>
              <span className="text-[#F97316]">Rs.{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          {submitError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">error</span><span>{submitError}</span>
            </div>
          )}
          <button onClick={handleReserve} className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_month</span>Confirm Reservation
          </button>
        </div>
      )}
    </div>
  );
}
