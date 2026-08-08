'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { MaintenanceRecord } from './types';

// ─── Badge ────────────────────────────────────────────────────────────

export function MaintBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    UNDER_MAINTENANCE: { label: 'Under Maintenance', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    COMPLETED:         { label: 'Completed',          cls: 'bg-green-50 text-green-700 border-green-200' },
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
  maintenance: MaintenanceRecord[];
  loading: boolean;
  search: string;
  onRefresh: () => void;
}

// ─── Maintenance Tab ──────────────────────────────────────────────────

export default function MaintenanceTab({ maintenance, loading, search, onRefresh }: Props) {
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const filtered = maintenance.filter(m =>
    m.equipment.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    setStatusLoading(id);
    try {
      await api.patch(`/inventory/maintenance/${id}/status`, { status });
      onRefresh();
    } catch {
      alert('Failed to update maintenance status.');
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
        <span className="material-symbols-outlined text-4xl">build</span>
        <p className="text-sm mt-2">No maintenance records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map(m => (
        <div key={m.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                {m.equipment.images?.[0] ? (
                  <img src={m.equipment.images[0]} alt={m.equipment.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-sm">construction</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{m.equipment.name}</p>
                <p className="text-xs text-slate-500">
                  {m.quantity} unit{m.quantity !== 1 ? 's' : ''} • Recorded by {m.recordedBy.name}
                </p>
                <p className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <MaintBadge status={m.status} />
          </div>

          <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            {m.description}
          </p>

          {m.status === 'UNDER_MAINTENANCE' && (
            <div className="mt-3">
              <button
                disabled={statusLoading === m.id}
                onClick={() => updateStatus(m.id, 'COMPLETED')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
