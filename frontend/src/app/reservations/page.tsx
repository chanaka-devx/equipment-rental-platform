'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────
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
}

interface Reservation {
  id: string;
  orderNumber?: string;
  from?: string;
  to?: string;
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
}

// ─── Status badge ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: 'Pending',   cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    APPROVED:  { label: 'Approved',  cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    REJECTED:  { label: 'Rejected',  cls: 'text-rose-700 bg-rose-50 border-rose-200' },
    ACTIVE:    { label: 'Active',    cls: 'text-green-700 bg-green-50 border-green-200' },
    RETURNED:  { label: 'Returned',  cls: 'text-teal-700 bg-teal-50 border-teal-200' },
    CANCELLED: { label: 'Cancelled', cls: 'text-slate-600 bg-slate-100 border-slate-200' },
  };
  const { label, cls } = map[s] || { label: status, cls: 'text-slate-600 bg-slate-100 border-slate-200' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ─── Reservation Detail Modal ─────────────────────────────────────────
function ReservationDetailModal({
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

  const orderId = reservation.orderNumber || reservation.id;
  const customerName = reservation.fullName || reservation.user?.name || reservation.user?.email || 'N/A';
  const customerEmail = reservation.user?.email || 'N/A';
  const price = reservation.payment?.amount ?? reservation.items?.reduce((acc, item) => acc + (Number(item.unitPrice || item.equipment?.rentalPrice || 0) * (item.quantity || 1)), 0) ?? 0;
  const createdDate = reservation.createdAt
    ? new Date(reservation.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';
  const startDate = reservation.startDate
    ? new Date(reservation.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : 'N/A';
  const endDate = reservation.endDate
    ? new Date(reservation.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : 'N/A';

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    setStatusMsg('');
    try {
      await api.patch(`/reservations/${reservation.id}/status`, { status: newStatus });
      onRefresh();
      onClose();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[600px] md:w-[700px] max-w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#0F172A]">Order #{orderId}</h3>
                <StatusBadge status={reservation.status} />
              </div>
              <p className="text-xs text-slate-400">Created on {createdDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {statusMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {statusMsg}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto min-h-0 flex-1">
          
          {/* Customer & Rental Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-base text-[#F97316]">person</span>
                Customer Details
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">{customerName}</p>
                <p className="text-xs text-slate-500">{customerEmail}</p>
              </div>
            </div>

            {/* Rental Period Box */}
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

          {/* Payment & Route Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Payment Method</span>
              <span className="font-semibold text-[#0F172A]">{reservation.paymentMethod || 'Zalo Pay'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Route / Origin</span>
              <span className="font-semibold text-[#0F172A]">
                {reservation.from || 'SGN'} → {reservation.to || 'HUI'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Amount</span>
              <span className="font-extrabold text-[#F97316] text-sm">
                {typeof price === 'number' ? `Rs.${Number(price).toFixed(2)}` : price}
              </span>
            </div>
          </div>

          {/* Equipment Items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Reserved Equipment Items
            </h4>
            {reservation.items && reservation.items.length > 0 ? (
              <div className="space-y-2">
                {reservation.items.map((item, idx) => {
                  const eqName = item.equipment?.name || reservation.equipmentName || 'Equipment Item';
                  const img = item.equipment?.images?.[0] || 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png';
                  const unitPrice = item.unitPrice || item.equipment?.rentalPrice || 0;
                  const qty = item.quantity || 1;

                  return (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={img}
                          alt={eqName}
                          className="w-12 h-10 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0F172A] truncate">{eqName}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.equipment?.category?.name || 'General'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-xs">
                        <p className="font-bold text-[#0F172A]">Rs.{unitPrice} × {qty}</p>
                        <p className="text-[10px] font-extrabold text-[#F97316]">
                          Rs.{(Number(unitPrice) * qty).toFixed(2)}
                        </p>
                      </div>
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
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {reservation.equipmentName || reservation.equipment?.name || 'Standard Equipment Rental'}
                    </p>
                    <p className="text-[10px] text-slate-400">Order ID: #{orderId}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-extrabold text-[#0F172A]">
                    {typeof price === 'number' ? `Rs.${Number(price).toFixed(2)}` : price}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {reservation.status?.toUpperCase() === 'PENDING' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">thumb_up</span>
                  {updating ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={updating}
                  className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">block</span>
                  Reject
                </button>
              </>
            )}

            {reservation.status?.toUpperCase() === 'APPROVED' && (
              <button
                onClick={() => handleUpdateStatus('ACTIVE')}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                {updating ? 'Updating...' : 'Mark Active'}
              </button>
            )}

            {reservation.status?.toUpperCase() === 'ACTIVE' && (
              <button
                onClick={() => handleUpdateStatus('RETURNED')}
                disabled={updating}
                className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                {updating ? 'Updating...' : 'Mark Returned'}
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Action dropdown ──────────────────────────────────────────────────
function ActionMenu({
  reservation,
  onViewDetails,
  onRefresh,
}: {
  reservation: Reservation;
  onViewDetails: () => void;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const s = reservation.status?.toUpperCase();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors"
            onClick={() => {
              onViewDetails();
              setOpen(false);
            }}
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            View Details
          </button>

          {s === 'PENDING' && (
            <>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-green-700 hover:bg-green-50 font-semibold transition-colors"
                onClick={async () => {
                  try {
                    await api.patch(`/reservations/${reservation.id}/status`, { status: 'APPROVED' });
                    onRefresh();
                  } catch {}
                  setOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-sm text-green-600">thumb_up</span>
                Approve
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 font-semibold transition-colors"
                onClick={async () => {
                  try {
                    await api.patch(`/reservations/${reservation.id}/status`, { status: 'REJECTED' });
                    onRefresh();
                  } catch {}
                  setOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-sm text-rose-600">block</span>
                Reject
              </button>
            </>
          )}

          {s === 'APPROVED' && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
              onClick={async () => {
                try {
                  await api.patch(`/reservations/${reservation.id}/status`, { status: 'ACTIVE' });
                  onRefresh();
                } catch {}
                setOpen(false);
              }}
            >
              <span className="material-symbols-outlined text-sm text-blue-600">play_arrow</span>
              Mark Active
            </button>
          )}

          {s === 'ACTIVE' && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-teal-700 hover:bg-teal-50 font-semibold transition-colors"
              onClick={async () => {
                try {
                  await api.patch(`/reservations/${reservation.id}/status`, { status: 'RETURNED' });
                  onRefresh();
                } catch {}
                setOpen(false);
              }}
            >
              <span className="material-symbols-outlined text-sm text-teal-600">assignment_turned_in</span>
              Mark Returned
            </button>
          )}

          {(s === 'CANCELLED' || s === 'REJECTED') && reservation.payment?.status === 'PAID' && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-purple-600 hover:bg-purple-50 font-semibold transition-colors"
              onClick={async () => {
                if (!reservation.payment?.id) return;
                try {
                  await api.patch(`/payments/${reservation.payment.id}/refund`);
                  onRefresh();
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Refund failed');
                }
                setOpen(false);
              }}
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Refund
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected reservation for Modal
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sort
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reservations?limit=200');
      const items: Reservation[] =
        res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setReservations(items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // ── Derived data ──────────────────────────────────────────────────
  const filtered = reservations.filter((r) => {
    const name =
      r.fullName || r.user?.name || r.user?.email || '';
    const eq = r.equipmentName || r.equipment?.name || '';
    const id = r.orderNumber || r.id || '';
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      eq.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'All' ||
      r.status?.toUpperCase() === statusFilter.toUpperCase();

    const matchPayment =
      paymentFilter === 'All' ||
      (r.paymentMethod || '').toLowerCase().includes(paymentFilter.toLowerCase());

    return matchSearch && matchStatus && matchPayment;
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

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const displayRows = paginated;
  const displayTotal = filtered.length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">

          {/* ── Top Header ── */}
          <Header title="Reservations" onOpenSidebar={() => setSidebarOpen(true)} />

          {/* ── Page Body ── */}
          <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Filter / toolbar row */}
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
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-transparent outline-none text-xs text-slate-600 w-[110px]"
                  />
                  <span className="text-slate-300">—</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-transparent outline-none text-xs text-slate-600 w-[110px]"
                  />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#F97316] cursor-pointer"
                  >
                    {['All', 'Pending', 'Approved', 'Rejected', 'Active', 'Returned', 'Cancelled'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Refresh */}
                <button
                  onClick={fetchReservations}
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
                        { label: 'Order ID',        field: 'id' },
                        { label: 'Full Name',        field: 'fullName' },
                        { label: 'Status',           field: 'status' },
                        { label: 'Payment',          field: 'payment' },
                        { label: 'Items',            field: 'items' },
                        { label: 'Creation Date',   field: 'createdAt' },
                      ].map(({ label, field }) => (
                        <th
                          key={field}
                          onClick={() => handleSort(field)}
                          className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-[#F97316] select-none whitespace-nowrap group"
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
                        <td colSpan={9} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[#F97316]">progress_activity</span>
                            <span className="text-sm">Loading reservations…</span>
                          </div>
                        </td>
                      </tr>
                    ) : displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <span className="material-symbols-outlined text-4xl">inbox</span>
                            <span className="text-sm font-medium">No reservations found</span>
                            <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="text-xs text-[#F97316] hover:underline">
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayRows.map((r, idx) => {
                        const name = r.fullName || r.user?.name || r.user?.email || 'N/A';
                        const orderId = r.orderNumber || r.id || '—';
                        const price = r.totalPrice ?? r.totalAmount ?? '—';
                        const created = r.createdAt
                          ? new Date(r.createdAt).toLocaleString('en-US', {
                              hour: '2-digit', minute: '2-digit', day: '2-digit',
                              month: '2-digit', year: 'numeric',
                            })
                          : '—';
                          
                        const paymentStatus = r.payment?.status || 'PENDING';
                        const itemCount = r.items?.length || 0;
                        const firstItemName = r.items?.[0]?.equipment?.name || r.equipment?.name || r.equipmentName;

                        return (
                          <tr
                            key={r.id || idx}
                            className="hover:bg-orange-50/30 transition-colors group cursor-pointer"
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
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
                                paymentStatus === 'PAID' ? 'text-green-700 bg-green-50 border-green-200' :
                                paymentStatus === 'FAILED' ? 'text-red-700 bg-red-50 border-red-200' :
                                'text-slate-600 bg-slate-100 border-slate-200'
                              }`}>
                                {paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap max-w-[150px] truncate">
                              {itemCount > 0 ? `${itemCount} item(s)${firstItemName ? ` (${firstItemName}${itemCount > 1 ? '...' : ''})` : ''}` : 'No items'}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {created}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <ActionMenu
                                reservation={r}
                                onViewDetails={() => setSelectedReservation(r)}
                                onRefresh={fetchReservations}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-bold text-[#0F172A]">
                    {displayTotal === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, displayTotal)}–{Math.min(page * PAGE_SIZE, displayTotal)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{displayTotal}</span> reservations
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="First page"
                  >
                    <span className="material-symbols-outlined text-sm">first_page</span>
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>

                  {/* Page numbers */}
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

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Last page"
                  >
                    <span className="material-symbols-outlined text-sm">last_page</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Reservation Detail Modal ── */}
        {selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
            onRefresh={fetchReservations}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}
