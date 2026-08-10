'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

interface MyReservationsModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ACTIVE:   'bg-green-100 text-green-700',
  COMPLETED:'bg-slate-100 text-slate-600',
  CANCELLED:'bg-red-100 text-red-600',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function MyReservationsModal({ open, onClose }: MyReservationsModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setCancellingId(id);
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    api.get('/reservations/my-reservations')
      .then(res => {
        const data = res.data;
        const list: any[] = Array.isArray(data) ? data : (data?.items || []);
        setReservations(list);
      })
      .catch(() => setError('Failed to load reservations.'))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-3 w-[480px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] flex flex-col max-h-[75vh] overflow-hidden"
    >
      {/* Notch */}
      <div className="absolute -top-2 right-5 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45 z-10" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F97316] text-xl">book_online</span>
          <h2 className="text-base font-bold text-[#0F172A]">My Reservations</h2>
          {reservations.length > 0 && (
            <span className="bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{reservations.length}</span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#F97316]">progress_activity</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <span className="material-symbols-outlined text-4xl text-red-300">error</span>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200">event_busy</span>
            <p className="text-sm text-slate-500 font-medium">No reservations yet.</p>
            <p className="text-xs text-slate-400">Browse equipment and make your first rental!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reservations.map((r) => {
              const total = r.payment?.amount
                ?? r.items?.reduce((acc: number, item: any) =>
                    acc + Number(item.unitPrice || item.equipment?.rentalPrice || 0) * (item.quantity || 1), 0)
                ?? 0;
              const itemCount = r.items?.length ?? 0;
              const startDate = r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
              const endDate = r.endDate ? new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

              return (
                <div key={r.id} className="py-3.5 flex items-start gap-3 group">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[#F97316] text-lg">receipt_long</span>
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[#0F172A] truncate">
                        {r.items?.[0]?.equipment?.name || 'Reservation'}
                        {itemCount > 1 && <span className="text-slate-400 font-normal"> +{itemCount - 1} more</span>}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{startDate} → {endDate}</p>
                    <p className="text-xs font-bold text-[#F97316] mt-1">Rs.{Number(total).toFixed(2)}</p>
                  </div>

                  {/* Actions & Payment */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {r.payment && (
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${r.payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.payment.status === 'PAID' ? '✓ Paid' : 'Pending'}
                      </div>
                    )}
                    {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={cancellingId === r.id}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
        <p className="text-[11px] text-slate-400 text-center">
          Showing your {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
