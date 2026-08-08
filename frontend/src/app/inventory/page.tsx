'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { ActiveTab, Equipment, DamageRecord, MaintenanceRecord } from './types';

import ManageReservationTab from './ManageReservationTab';
import StockTab from './StockTab';
import DamagedTab from './DamagedTab';
import MaintenanceTab from './MaintenanceTab';

// ─── Tab config ───────────────────────────────────────────────────────

const TABS: { key: ActiveTab; label: string; icon: string }[] = [
  { key: 'reservations', label: 'Manage Reservation', icon: 'event_available' },
  { key: 'stock',        label: 'Stock',               icon: 'inventory_2' },
  { key: 'damages',      label: 'Damaged',             icon: 'report' },
  { key: 'maintenance',  label: 'Maintenance',         icon: 'build' },
];

// ─── Page ─────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState<ActiveTab>('reservations');

  // ── Warehouse shared state ──
  const [equipment,    setEquipment]    = useState<Equipment[]>([]);
  const [damages,      setDamages]      = useState<DamageRecord[]>([]);
  const [maintenance,  setMaintenance]  = useState<MaintenanceRecord[]>([]);
  const [wLoading,     setWLoading]     = useState(false);
  const [wSearch,      setWSearch]      = useState('');

  const fetchWarehouse = useCallback(async () => {
    setWLoading(true);
    try {
      const [eqRes, dmgRes, mntRes] = await Promise.all([
        api.get('/inventory/stock'),
        api.get('/inventory/damages'),
        api.get('/inventory/maintenance'),
      ]);
      setEquipment(Array.isArray(eqRes.data) ? eqRes.data : []);
      setDamages(Array.isArray(dmgRes.data) ? dmgRes.data : []);
      setMaintenance(Array.isArray(mntRes.data) ? mntRes.data : []);
    } catch {
      // silent – individual tabs will show empty state
    } finally {
      setWLoading(false);
    }
  }, []);

  // Lazy-load warehouse data when first visiting a warehouse tab
  useEffect(() => {
    if (activeTab !== 'reservations') fetchWarehouse();
  }, [activeTab, fetchWarehouse]);

  // ── Tab badge counts ──
  const badgeCounts: Record<ActiveTab, number> = {
    reservations: 0, // managed internally by ManageReservationTab
    stock:        equipment.length,
    damages:      damages.filter(d => d.status !== 'REPAIRED').length,
    maintenance:  maintenance.filter(m => m.status !== 'COMPLETED').length,
  };

  const isWarehouseTab = activeTab !== 'reservations';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
          <Header title="Inventory" onOpenSidebar={() => setSidebarOpen(true)} />

          <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* ── Tab Bar ── */}
              <div className="px-4 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setWSearch(''); }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === tab.key
                        ? 'border-[#F97316] text-[#F97316] bg-orange-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    {badgeCounts[tab.key] > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key ? 'bg-[#F97316] text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {badgeCounts[tab.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Manage Reservation Tab ── */}
              {activeTab === 'reservations' && <ManageReservationTab />}

              {/* ── Warehouse tabs: shared search + refresh bar ── */}
              {isWarehouseTab && (
                <>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="flex-1 relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                      <input
                        type="text"
                        placeholder="Search equipment..."
                        value={wSearch}
                        onChange={e => setWSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                      />
                    </div>
                    <button
                      onClick={fetchWarehouse}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#F97316] border border-slate-200 hover:border-[#F97316] rounded-lg px-2.5 py-2 transition-all bg-white"
                      title="Refresh"
                    >
                      <span className={`material-symbols-outlined text-sm ${wLoading ? 'animate-spin' : ''}`}>refresh</span>
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>

                  <div className="p-4">
                    {activeTab === 'stock' && (
                      <StockTab equipment={equipment} loading={wLoading} search={wSearch} onRefresh={fetchWarehouse} />
                    )}
                    {activeTab === 'damages' && (
                      <DamagedTab damages={damages} loading={wLoading} search={wSearch} onRefresh={fetchWarehouse} />
                    )}
                    {activeTab === 'maintenance' && (
                      <MaintenanceTab maintenance={maintenance} loading={wLoading} search={wSearch} onRefresh={fetchWarehouse} />
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
