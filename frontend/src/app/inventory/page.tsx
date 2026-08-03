'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────
interface ReservationItem {
  id?: string;
  quantity?: number;
  unitPrice?: number | string;
  equipment?: {
    id?: string;
    name?: string;
    description?: string;
    rentalPrice?: number;
    images?: string[];
    category?: { name?: string };
  };
  returnedQuantity?: number;
  damagedQuantity?: number;
}

interface Reservation {
  id: string;
  orderNumber?: string;
  fullName?: string;
  user?: { id?: string; name?: string; email?: string };
  equipment?: { name?: string; images?: string[] };
  equipmentName?: string;
  items?: ReservationItem[];
  payment?: { status?: string; amount?: number; id?: string };
  status: string;
  totalPrice?: number | string;
  totalAmount?: number | string;
  paymentMethod?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  from?: string;
  to?: string;
}

// ─── Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: { label: 'Approved', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    ACTIVE:   { label: 'Active',   cls: 'text-green-700 bg-green-50 border-green-200' },
    RETURNED: { label: 'Returned', cls: 'text-teal-700 bg-teal-50 border-teal-200' },
  };
  const { label, cls } = map[s] || { label: status, cls: 'text-slate-600 bg-slate-100 border-slate-200' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ─── Inventory Action Modal (Damage / Maintenance / Stock) ────────────
type ActionType = 'damage' | 'maintenance' | 'stock';

function InventoryActionModal({
  type,
  equipmentId,
  equipmentName,
  onClose,
  onDone,
}: {
  type: ActionType;
  equipmentId: string;
  equipmentName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState('');
  const [qty, setQty]   = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const config: Record<ActionType, { icon: string; title: string; color: string; bg: string; border: string; btnCls: string }> = {
    damage:      { icon: 'report',       title: 'Record Damage',      color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    btnCls: 'bg-red-600 hover:bg-red-700 text-white' },
    maintenance: { icon: 'build_circle', title: 'Record Maintenance', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', btnCls: 'bg-[#F97316] hover:bg-orange-600 text-white' },
    stock:       { icon: 'inventory_2',  title: 'Track Stock',        color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   btnCls: 'bg-blue-600 hover:bg-blue-700 text-white' },
  };
  const { icon, title, color, bg, border, btnCls } = config[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (type === 'stock') {
        await api.post(`/inventory/${equipmentId}/receive`, { quantity: parseInt(qty, 10) });
      } else {
        await api.post(`/inventory/${equipmentId}/${type}`, { note: note.trim() });
      }
      setSuccess(true);
      setTimeout(() => { onDone(); onClose(); }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : (msg || 'Action failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full sm:w-[420px] max-w-full border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${border}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${border} ${bg}`}>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A]">{title}</h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[240px]">{equipmentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-5xl text-green-500">check_circle</span>
            <p className="font-bold text-[#0F172A]">Done!</p>
            <p className="text-xs text-slate-500">Record has been saved successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

              {type === 'stock' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quantity to Add</label>
                  <input
                    required type="number" min="1" value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none"
                    placeholder="e.g. 5"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {type === 'damage' ? 'Damage Description *' : 'Maintenance Notes *'}
                  </label>
                  <textarea
                    required rows={4} value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={type === 'damage' ? 'Describe the damage observed…' : 'Describe maintenance work done or scheduled…'}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none resize-none"
                  />
                  {type === 'damage' && <p className="text-[10px] text-red-500 mt-1">⚠ This will mark the equipment as <strong>unavailable</strong>.</p>}
                  {type === 'maintenance' && <p className="text-[10px] text-green-600 mt-1">✓ This will mark the equipment as <strong>available</strong> again.</p>}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={loading} className={`px-5 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5 ${btnCls}`}>
                <span className="material-symbols-outlined text-sm">{loading ? 'progress_activity' : 'save'}</span>
                {loading ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Return Modal ─────────────────────────────────────────────────────
function ReturnModal({
  reservation,
  onClose,
  onDone,
}: {
  reservation: Reservation;
  onClose: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [returns, setReturns] = useState(
    (reservation.items || []).map((item) => {
      const maxReturn = (item.quantity || 1) - (item.returnedQuantity || 0) - (item.damagedQuantity || 0);
      return {
        equipmentId: item.equipment?.id || '',
        name: item.equipment?.name || 'Equipment',
        qtyGood: maxReturn,
        qtyDamaged: 0,
        note: '',
        maxReturn
      };
    })
  );

  const handleUpdate = (idx: number, field: string, value: any) => {
    const newReturns = [...returns];
    (newReturns[idx] as any)[field] = value;
    setReturns(newReturns);
  };

  const handleSubmit = async () => {
    const payload = returns
      .filter((r) => r.qtyGood > 0 || r.qtyDamaged > 0)
      .map((r) => ({
        equipmentId: r.equipmentId,
        qtyGood: r.qtyGood,
        qtyDamaged: r.qtyDamaged,
        note: r.note,
      }));

    if (payload.length === 0) {
      setError('Please select at least one item to return or mark as damaged.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post(`/reservations/${reservation.id}/return`, { returns: payload });
      onDone();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Return failed');
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = returns.some(r => (r.qtyGood + r.qtyDamaged) > r.maxReturn);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[600px] max-w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] shrink-0">
          <div className="flex items-center gap-3 text-teal-700">
            <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
            <h3 className="font-extrabold text-lg text-[#0F172A]">Return Equipment</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg shrink-0">{error}</div>
        )}

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select items to return</h4>
            <button 
              onClick={() => {
                const allSelected = returns.every(r => r.qtyGood === r.maxReturn && r.qtyDamaged === 0);
                const updated = returns.map(r => ({ 
                  ...r, 
                  qtyGood: allSelected ? 0 : r.maxReturn,
                  qtyDamaged: 0
                }));
                setReturns(updated);
              }}
              className="text-xs text-[#F97316] font-semibold hover:underline"
            >
              Toggle All
            </button>
          </div>

          <div className="space-y-3">
            {returns.map((ret, idx) => {
              if (ret.maxReturn <= 0) return null;
              
              const totalSelected = ret.qtyGood + ret.qtyDamaged;
              const hasSelected = totalSelected > 0;
              const isOver = totalSelected > ret.maxReturn;

              return (
                <div key={idx} className={`p-4 rounded-xl border transition-colors ${hasSelected ? (isOver ? 'bg-red-50/50 border-red-300' : 'bg-teal-50/30 border-teal-200') : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasSelected} 
                        onChange={(e) => {
                          handleUpdate(idx, 'qtyGood', e.target.checked ? ret.maxReturn : 0);
                          if (!e.target.checked) handleUpdate(idx, 'qtyDamaged', 0);
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-sm text-[#0F172A]">{ret.name}</span>
                    </label>
                    <div className="text-xs text-slate-500">
                      Pending Return: <span className="font-bold text-[#0F172A]">{ret.maxReturn}</span>
                    </div>
                  </div>

                  {hasSelected && (
                    <div className="pl-7 space-y-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[11px] font-semibold text-teal-700 uppercase mb-1 block">Good Condition</label>
                          <div className="flex items-center border border-teal-200 bg-white rounded-lg overflow-hidden">
                            <button onClick={() => handleUpdate(idx, 'qtyGood', Math.max(0, ret.qtyGood - 1))} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border-r border-teal-100">-</button>
                            <input 
                              type="number" min="0" max={ret.maxReturn} 
                              value={ret.qtyGood}
                              onChange={(e) => handleUpdate(idx, 'qtyGood', parseInt(e.target.value) || 0)}
                              className="w-12 text-center text-xs py-1 border-none outline-none font-bold text-teal-700"
                            />
                            <button onClick={() => handleUpdate(idx, 'qtyGood', Math.min(ret.maxReturn - ret.qtyDamaged, ret.qtyGood + 1))} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border-l border-teal-100">+</button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[11px] font-semibold text-red-700 uppercase mb-1 block">Damaged</label>
                          <div className="flex items-center border border-red-200 bg-white rounded-lg overflow-hidden">
                            <button onClick={() => handleUpdate(idx, 'qtyDamaged', Math.max(0, ret.qtyDamaged - 1))} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border-r border-red-100">-</button>
                            <input 
                              type="number" min="0" max={ret.maxReturn} 
                              value={ret.qtyDamaged}
                              onChange={(e) => handleUpdate(idx, 'qtyDamaged', parseInt(e.target.value) || 0)}
                              className="w-12 text-center text-xs py-1 border-none outline-none font-bold text-red-700"
                            />
                            <button onClick={() => handleUpdate(idx, 'qtyDamaged', Math.min(ret.maxReturn - ret.qtyGood, ret.qtyDamaged + 1))} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border-l border-red-100">+</button>
                          </div>
                        </div>
                      </div>

                      {isOver && <p className="text-[11px] text-red-600 font-bold">Total exceeds pending quantity!</p>}

                      {ret.qtyDamaged > 0 && (
                        <div>
                          <input 
                            type="text" placeholder="Damage description (optional)..." 
                            value={ret.note}
                            onChange={(e) => handleUpdate(idx, 'note', e.target.value)}
                            className="w-full px-3 py-2 border border-red-200 bg-red-50/30 rounded-lg text-xs outline-none focus:border-red-400"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || isInvalid} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : null}
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Detail Modal ───────────────────────────────────────────
function InventoryDetailModal({
  reservation,
  onClose,
  onRefresh,
}: {
  reservation: Reservation;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [inventoryModal, setInventoryModal] = useState<{ type: ActionType; equipmentId: string; equipmentName: string } | null>(null);

  const orderId     = reservation.orderNumber || reservation.id;
  const customerName  = reservation.fullName || reservation.user?.name || reservation.user?.email || 'N/A';
  const customerEmail = reservation.user?.email || 'N/A';
  const price       = reservation.payment?.amount ?? reservation.items?.reduce((acc, item) => acc + (Number(item.unitPrice || item.equipment?.rentalPrice || 0) * (item.quantity || 1)), 0) ?? 0;
  const createdDate = reservation.createdAt
    ? new Date(reservation.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'N/A';
  const startDate = reservation.startDate
    ? new Date(reservation.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A';
  const endDate = reservation.endDate
    ? new Date(reservation.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A';

  const handleUpdateStatus = async (endpoint: string, body?: Record<string, string>) => {
    setUpdating(true);
    setStatusMsg('');
    try {
      await api.patch(`/reservations/${reservation.id}/${endpoint}`, body ?? {});
      onRefresh();
      onClose();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {inventoryModal && (
        <InventoryActionModal
          type={inventoryModal.type}
          equipmentId={inventoryModal.equipmentId}
          equipmentName={inventoryModal.equipmentName}
          onClose={() => setInventoryModal(null)}
          onDone={onRefresh}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[600px] md:w-[700px] max-w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-[#0F172A]">Order #{orderId}</h3>
                  <StatusBadge status={reservation.status} />
                </div>
                <p className="text-xs text-slate-400">Created on {createdDate}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {statusMsg && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg shrink-0">{statusMsg}</div>
          )}

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto min-h-0 flex-1">

            {/* Customer + Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base text-[#F97316]">person</span>
                  Customer Details
                </div>
                <p className="text-sm font-bold text-[#0F172A]">{customerName}</p>
                <p className="text-xs text-slate-500">{customerEmail}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base text-[#F97316]">date_range</span>
                  Rental Period
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">START</span>
                    <span className="font-bold text-[#0F172A]">{startDate}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                  <div>
                    <span className="text-slate-400 block text-[10px]">END</span>
                    <span className="font-bold text-[#0F172A]">{endDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Payment Method</span>
                <span className="font-semibold text-[#0F172A]">{reservation.paymentMethod || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Rental Period</span>
                <span className="font-semibold text-[#0F172A]">{startDate} → {endDate}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Amount</span>
                <span className="font-extrabold text-[#F97316] text-sm">
                  {typeof price === 'number' ? `Rs.${Number(price).toFixed(2)}` : (price || '—')}
                </span>
              </div>
            </div>

            {/* Equipment items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reserved Equipment Items</h4>
                <span className="text-[10px] text-slate-400">Click an item for inventory actions</span>
              </div>
              {reservation.items && reservation.items.length > 0 ? (
                <div className="space-y-2">
                  {reservation.items.map((item, idx) => {
                    const eqName  = item.equipment?.name || reservation.equipmentName || 'Equipment Item';
                    const img     = item.equipment?.images?.[0] || 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png';
                    const unitPrice = item.unitPrice || item.equipment?.rentalPrice || 0;
                    const qty     = item.quantity || 1;
                    return (
                      <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={img} alt={eqName} className="w-12 h-10 object-cover rounded-lg bg-white border border-slate-200 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#0F172A] truncate">{eqName}</p>
                              <p className="text-[10px] text-slate-400">{item.equipment?.category?.name || 'General'}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 text-xs">
                            <p className="font-bold text-[#0F172A]">Rs.{unitPrice} × {qty}</p>
                            <p className="text-[10px] font-extrabold text-[#F97316]">Rs.{(Number(unitPrice) * qty).toFixed(2)}</p>
                          </div>
                        </div>
                        {/* Per-item inventory buttons */}
                        {item.equipment?.id && (
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                            <button
                              onClick={() => setInventoryModal({ type: 'damage',      equipmentId: item.equipment!.id!, equipmentName: eqName })}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">report</span>
                              Record Damage
                            </button>
                            <button
                              onClick={() => setInventoryModal({ type: 'maintenance', equipmentId: item.equipment!.id!, equipmentName: eqName })}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">build_circle</span>
                              Record Maintenance
                            </button>
                            <button
                              onClick={() => setInventoryModal({ type: 'stock',       equipmentId: item.equipment!.id!, equipmentName: eqName })}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">inventory_2</span>
                              Track Stock
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#F97316]">
                      <span className="material-symbols-outlined text-xl">construction</span>
                    </div>
                    <p className="text-xs font-bold text-[#0F172A]">{reservation.equipmentName || reservation.equipment?.name || 'Standard Equipment Rental'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
              Close
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {reservation.status?.toUpperCase() === 'APPROVED' && (
                <button
                  onClick={() => handleUpdateStatus('release')}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  {updating ? 'Updating…' : 'Release Equipment'}
                </button>
              )}
              {reservation.status?.toUpperCase() === 'ACTIVE' && (
                <button
                  onClick={() => handleUpdateStatus('status', { status: 'RETURNED' })}
                  disabled={updating}
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                  {updating ? 'Updating…' : 'Mark Returned'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Action Dropdown ──────────────────────────────────────────────────
function ActionMenu({
  reservation,
  onViewDetails,
  onRefresh,
  onDamage,
  onReturn,
}: {
  reservation: Reservation;
  onViewDetails: () => void;
  onRefresh: () => void;
  onDamage?: (equipmentId: string, equipmentName: string) => void;
  onReturn?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const s = reservation.status?.toUpperCase();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const statusAction = async (endpoint: string, statusValue?: string) => {
    try {
      const body = statusValue ? { status: statusValue } : undefined;
      await api.patch(`/reservations/${reservation.id}/${endpoint}`, body);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed.');
    }
    setOpen(false);
  };

  // First equipment item for quick damage action
  const firstEq = reservation.items?.[0]?.equipment;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#F97316] border border-slate-200 hover:border-[#F97316] rounded-lg px-2.5 py-1.5 transition-all bg-white"
      >
        Action
        <span className="material-symbols-outlined text-sm">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors"
            onClick={() => { onViewDetails(); setOpen(false); }}
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            View Details
          </button>

          {s === 'APPROVED' && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-green-700 hover:bg-green-50 font-semibold transition-colors"
              onClick={() => statusAction('release')}
            >
              <span className="material-symbols-outlined text-sm text-green-600">play_arrow</span>
              Release Equipment
            </button>
          )}

          {s === 'ACTIVE' && (
            <>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-teal-700 hover:bg-teal-50 font-semibold transition-colors"
                onClick={() => { onReturn && onReturn(); setOpen(false); }}
              >
                <span className="material-symbols-outlined text-sm text-teal-600">assignment_turned_in</span>
                Process Return / Damage
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [inventoryModal, setInventoryModal] = useState<{ type: ActionType; equipmentId: string; equipmentName: string } | null>(null);
  const [returnModal, setReturnModal] = useState<Reservation | null>(null);

  // Filters
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');

  // Sort
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reservations?limit=200');
      const all: Reservation[] = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      // Inventory only shows APPROVED + ACTIVE
      setReservations(all.filter((r) => r.status === 'APPROVED' || r.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived ────────────────────────────────────────────────────────
  const filtered = reservations.filter((r) => {
    const name = r.fullName || r.user?.name || r.user?.email || '';
    const id   = r.orderNumber || r.id || '';
    const matchSearch = !search
      || name.toLowerCase().includes(search.toLowerCase())
      || id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av: any = a[sortField as keyof Reservation] ?? '';
    let bv: any = b[sortField as keyof Reservation] ?? '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages   = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated    = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayTotal = filtered.length;

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span className={`material-symbols-outlined text-[13px] ml-0.5 transition-colors ${sortField === field ? 'text-[#F97316]' : 'text-slate-300'}`}>
      {sortField === field ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
    </span>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
          <Header title="Inventory" onOpenSidebar={() => setSidebarOpen(true)} />

          <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">

                {/* Search */}
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-orange-200 transition-all flex-1 min-w-[180px] max-w-xs bg-white">
                  <span className="material-symbols-outlined text-slate-400 text-lg shrink-0">search</span>
                  <input
                    type="text"
                    placeholder="Search by order number..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full text-xs text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 bg-white">
                  <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                  <input
                    type="date" value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-transparent outline-none text-xs text-slate-600 w-[110px]"
                  />
                  <span className="text-slate-300">—</span>
                  <input
                    type="date" value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-transparent outline-none text-xs text-slate-600 w-[110px]"
                  />
                </div>

                <div className="flex-1" />

                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#F97316] cursor-pointer"
                  >
                    {['All', 'Approved', 'Active'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Refresh */}
                <button
                  onClick={fetchData}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#F97316] border border-slate-200 hover:border-[#F97316] rounded-lg px-2.5 py-2 transition-all bg-white"
                  title="Refresh"
                >
                  <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-4 my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="w-10 px-4 py-3">
                        <input type="checkbox" className="rounded border-slate-300 cursor-pointer" />
                      </th>

                      {[
                        { label: 'Order ID',      field: 'id' },
                        { label: 'Full Name',     field: 'fullName' },
                        { label: 'Total Price',   field: 'totalPrice' },
                        { label: 'Status',        field: 'status' },
                        { label: 'Creation Date', field: 'createdAt' },
                      ].map(({ label, field }) => (
                        <th
                          key={field}
                          onClick={() => handleSort(field)}
                          className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-[#F97316] select-none whitespace-nowrap"
                        >
                          <span className="flex items-center gap-0.5">
                            {label}
                            <SortIcon field={field} />
                          </span>
                        </th>
                      ))}

                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[#F97316]">progress_activity</span>
                            <span className="text-sm">Loading inventory…</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <span className="material-symbols-outlined text-4xl">inventory_2</span>
                            <span className="text-sm font-medium">No reservations found</span>
                            <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="text-xs text-[#F97316] hover:underline">
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((r, idx) => {
                        const name    = r.fullName || r.user?.name || r.user?.email || 'N/A';
                        const orderId = r.orderNumber || r.id || '—';
                        const price   = r.payment?.amount ?? r.items?.reduce((acc, item) => acc + (Number(item.unitPrice || item.equipment?.rentalPrice || 0) * (item.quantity || 1)), 0) ?? 0;
                        const created = r.createdAt
                          ? new Date(r.createdAt).toLocaleString('en-US', {
                              hour: '2-digit', minute: '2-digit',
                              day: '2-digit', month: '2-digit', year: 'numeric',
                            })
                          : '—';

                        return (
                          <tr
                            key={r.id || idx}
                            className="hover:bg-orange-50/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedReservation(r)}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="rounded border-slate-300 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-slate-600 whitespace-nowrap max-w-[140px] truncate">
                              {orderId}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                              {name}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-[#0F172A] whitespace-nowrap">
                              {typeof price === 'number' ? `Rs.${Number(price).toFixed(2)}` : price}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {created}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <ActionMenu
                                reservation={r}
                                onViewDetails={() => setSelectedReservation(r)}
                                onRefresh={fetchData}
                                onDamage={(eqId, eqName) => setInventoryModal({ type: 'damage', equipmentId: eqId, equipmentName: eqName })}
                                onReturn={() => setReturnModal(r)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-bold text-[#0F172A]">
                    {displayTotal === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, displayTotal)}–{Math.min(page * PAGE_SIZE, displayTotal)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{displayTotal}</span> reservations
                </p>

                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 transition-all" title="First page">
                    <span className="material-symbols-outlined text-sm">first_page</span>
                  </button>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (page <= 3) p = i + 1;
                      else if (page >= totalPages - 2) p = totalPages - 4 + i;
                      else p = page - 2 + i;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                          page === p
                            ? 'bg-[#F97316] border-[#F97316] text-white shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:border-[#F97316] hover:text-[#F97316]'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 transition-all" title="Last page">
                    <span className="material-symbols-outlined text-sm">last_page</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Inventory Action Modal (page-level for quick access from Action dropdown) */}
        {inventoryModal && (
          <InventoryActionModal
            type={inventoryModal.type}
            equipmentId={inventoryModal.equipmentId}
            equipmentName={inventoryModal.equipmentName}
            onClose={() => setInventoryModal(null)}
            onDone={fetchData}
          />
        )}

        {/* Return Modal */}
        {returnModal && (
          <ReturnModal
            reservation={returnModal}
            onClose={() => setReturnModal(null)}
            onDone={() => {
              setReturnModal(null);
              fetchData();
            }}
          />
        )}

        {/* Detail Modal */}
        {selectedReservation && (
          <InventoryDetailModal
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
            onRefresh={fetchData}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
