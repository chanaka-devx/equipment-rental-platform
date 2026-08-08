'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { DamageRecord, MaintenanceRecord } from './types';

// ─── Badges ───────────────────────────────────────────────────────────

export function DamageBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    DAMAGED:           { label: 'Damaged',          cls: 'bg-red-50 text-red-700 border-red-200' },
    UNDER_MAINTENANCE: { label: 'Under Maintenance', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    REPAIRED:          { label: 'Repaired',          cls: 'bg-green-50 text-green-700 border-green-200' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────

interface Props {
  damages: DamageRecord[];
  loading: boolean;
  search: string;
  onRefresh: () => void;
}

// ─── Damaged Tab ──────────────────────────────────────────────────────

export default function DamagedTab({ damages, loading, search, onRefresh }: Props) {
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const filtered = damages.filter(d =>
    d.equipment.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    setStatusLoading(id);
    try {
      await api.patch(`/inventory/damages/${id}/status`, { status });
      onRefresh();
    } catch {
      alert('Failed to update damage status.');
    } finally {
      setStatusLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-[#F97316] text-4xl">progress_activity</span>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <span className="material-symbols-outlined text-4xl">check_circle</span>
        <p className="text-sm mt-2">No damage records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map(d => (
        <div key={d.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                {d.equipment.images?.[0] ? (
                  <img src={d.equipment.images[0]} alt={d.equipment.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-sm">construction</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{d.equipment.name}</p>
                <p className="text-xs text-slate-500">
                  {d.quantity} unit{d.quantity !== 1 ? 's' : ''} • Recorded by {d.recordedBy.name}
                </p>
                <p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <DamageBadge status={d.status} />
          </div>

          <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            {d.description}
          </p>

          {d.status !== 'REPAIRED' && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {d.status === 'DAMAGED' && (
                <button
                  disabled={statusLoading === d.id}
                  onClick={() => updateStatus(d.id, 'UNDER_MAINTENANCE')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-sm">build</span>
                  Send to Maintenance
                </button>
              )}
              <button
                disabled={statusLoading === d.id}
                onClick={() => updateStatus(d.id, 'REPAIRED')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Mark Repaired
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
