'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { Equipment } from './types';

// ─── Record Damage Modal ──────────────────────────────────────────────

function RecordDamageModal({
  equipment,
  onClose,
  onDone,
}: {
  equipment: Equipment;
  onClose: () => void;
  onDone: () => void;
}) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Please enter a description.'); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) { setError('Quantity must be at least 1.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/inventory/damages', {
        equipmentId: equipment.id,
        description: description.trim(),
        quantity: qty,
      });
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to record damage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[420px] max-w-full">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">report</span>
            <h2 className="text-base font-bold text-slate-900">Record Damage</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
              {equipment.images?.[0] ? (
                <img src={equipment.images[0]} alt={equipment.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-lg">construction</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{equipment.name}</p>
              <p className="text-xs text-slate-500">{equipment.stockQuantity} units in stock</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Damage Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Front wheel bent, frame cracked..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Damaged Quantity</label>
              <input
                type="number" min={1} max={equipment.stockQuantity} value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60">
                {loading ? 'Saving...' : 'Record Damage'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Record Maintenance Modal ─────────────────────────────────────────

function RecordMaintenanceModal({
  equipment,
  onClose,
  onDone,
}: {
  equipment: Equipment;
  onClose: () => void;
  onDone: () => void;
}) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Please enter a description.'); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) { setError('Quantity must be at least 1.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/inventory/maintenance', {
        equipmentId: equipment.id,
        description: description.trim(),
        quantity: qty,
      });
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create maintenance record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[420px] max-w-full">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">build</span>
            <h2 className="text-base font-bold text-slate-900">Send for Maintenance</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
              {equipment.images?.[0] ? (
                <img src={equipment.images[0]} alt={equipment.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-lg">construction</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{equipment.name}</p>
              <p className="text-xs text-slate-500">{equipment.stockQuantity} units available</p>
            </div>
          </div>

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              ⚠ This will reduce available stock by the quantity entered. Stock is restored when marked as Completed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Maintenance Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Annual service, belt replacement..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantity</label>
              <input
                type="number" min={1} max={equipment.stockQuantity} value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60">
                {loading ? 'Saving...' : 'Send for Maintenance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────

interface Props {
  equipment: Equipment[];
  loading: boolean;
  search: string;
  onRefresh: () => void;
}

// ─── Stock Tab ────────────────────────────────────────────────────────

export default function StockTab({ equipment, loading, search, onRefresh }: Props) {
  const [damageModal, setDamageModal] = useState<Equipment | null>(null);
  const [maintModal, setMaintModal]   = useState<Equipment | null>(null);

  const filtered = equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

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
        <span className="material-symbols-outlined text-4xl">inventory_2</span>
        <p className="text-sm mt-2">No equipment found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {filtered.map(eq => (
          <div key={eq.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {eq.images?.[0] ? (
                <img src={eq.images[0]} alt={eq.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">construction</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{eq.name}</p>
              <p className="text-xs text-slate-500">{eq.category?.name}</p>
            </div>

            <div className="text-right mr-4 hidden sm:block">
              <p className={`text-lg font-bold ${
                eq.stockQuantity === 0 ? 'text-red-600' : eq.stockQuantity <= 2 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {eq.stockQuantity}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">in stock</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setDamageModal(eq)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">report</span>
                <span className="hidden sm:inline">Damage</span>
              </button>
              <button
                onClick={() => setMaintModal(eq)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">build</span>
                <span className="hidden sm:inline">Maintenance</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {damageModal && (
        <RecordDamageModal
          equipment={damageModal}
          onClose={() => setDamageModal(null)}
          onDone={() => { setDamageModal(null); onRefresh(); }}
        />
      )}
      {maintModal && (
        <RecordMaintenanceModal
          equipment={maintModal}
          onClose={() => setMaintModal(null)}
          onDone={() => { setMaintModal(null); onRefresh(); }}
        />
      )}
    </>
  );
}
