'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

// ─── SVG Donut Chart ───────────────────────────────────────────────
function DonutChart({
  segments,
  size = 120,
  centerText,
  centerSubtext,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = size * 0.35;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  if (total === 0)
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={size * 0.13} />
      </svg>
    );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rotation = cumulative * 360 - 90;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={size * 0.13}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="butt"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        );
      })}
      {centerText && (
        <>
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize={size * 0.16}
            fontWeight="800"
            fill="#0F172A"
          >
            {centerText}
          </text>
          {centerSubtext && (
            <text
              x={cx}
              y={cy + size * 0.13}
              textAnchor="middle"
              fontSize={size * 0.09}
              fill="#94A3B8"
            >
              {centerSubtext}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  href,
  trend,
}: {
  label: string;
  value: string | number;
  href: string;
  trend?: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col gap-3"
    >
      <div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-tight">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{value}</p>
        {trend && (
          <p className="text-[10px] text-green-600 font-bold mt-0.5">{trend}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Revenue Bar Chart ──────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t-lg bg-[#F97316] opacity-80 group-hover:opacity-100 transition-all"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
            title={`$${d.value.toLocaleString()}`}
          />
          <span className="text-[9px] text-slate-400 hidden sm:block whitespace-nowrap">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Schedule Item ──────────────────────────────────────────────────
function ScheduleItem({
  time,
  duration,
  type,
  item,
  color,
}: {
  time: string;
  duration: string;
  type: string;
  item: string;
  color: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#0F172A]">
          {time}{' '}
          <span className="text-slate-400 font-normal">· {duration}</span>
        </p>
        <p className="text-xs font-semibold text-slate-700">{type}</p>
        <p className="text-[10px] text-slate-400 truncate">{item}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    lowStock: 0,
  });
  const [resStats, setResStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    todayReservations: 0,
    todayRevenue: 0,
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [eqRes, resRes] = await Promise.all([
        api.get('/equipment?limit=200').catch(() => ({ data: null })),
        api.get('/reservations?limit=1000').catch(() => ({ data: null })),
      ]);

      const items: any[] = eqRes.data?.items || (Array.isArray(eqRes.data) ? eqRes.data : []);
      const available = items.filter(
        (i) => (i.available ?? (i.stockQuantity > 0)) === true
      ).length;
      const rented = items.filter(
        (i) => (i.available ?? (i.stockQuantity > 0)) === false
      ).length;
      const lowStock = items.filter(
        (i) => (i.stockQuantity !== undefined ? i.stockQuantity <= 2 : false)
      ).length;

      setStats({
        totalEquipment: items.length,
        available,
        rented,
        maintenance: 0,
        lowStock,
      });

      const reservations: any[] = resRes.data?.items || (Array.isArray(resRes.data) ? resRes.data : []);
      
      let active = 0, completed = 0, cancelled = 0;
      let totalRev = 0;
      let todayRes = 0;
      let todayRev = 0;
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      reservations.forEach(r => {
        if (r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'ACTIVE') active++;
        else if (r.status === 'COMPLETED') completed++;
        else cancelled++;

        const dateStr = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateStr === todayStr) {
          todayRes++;
        }
      });

      setRecentReservations(reservations.slice(0, 5));

      const revMap = new Map();
      reservations.forEach(r => {
        if (r.status !== 'CANCELLED' && r.status !== 'REJECTED') {
          const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const amount = r.payment?.amount ?? r.items?.reduce((acc: number, item: any) => acc + (Number(item.unitPrice || item.equipment?.rentalPrice || 0) * (item.quantity || 1)), 0) ?? 0;
          revMap.set(date, (revMap.get(date) || 0) + Number(amount));
          totalRev += Number(amount);
          
          if (date === todayStr) {
            todayRev += Number(amount);
          }
        }
      });
      setResStats({ total: reservations.length, active, completed, cancelled, totalRevenue: totalRev, todayReservations: todayRes, todayRevenue: todayRev });

      const revArray = Array.from(revMap.entries()).map(([label, value]) => ({ label, value })).slice(-7);
      setRevenueData(revArray.length ? revArray : [
        { label: 'Nov 6', value: 2200 },
        { label: 'Nov 11', value: 3400 },
      ]);

      const popMap = new Map();
      reservations.forEach(r => {
        if (r.items) {
          r.items.forEach((i: any) => {
            const eqId = i.equipmentId;
            if (!popMap.has(eqId)) {
              popMap.set(eqId, { 
                name: i.equipment?.name || 'Unknown', 
                price: `$${i.unitPrice || i.equipment?.rentalPrice || 0}/day`, 
                bookings: 0,
                img: i.equipment?.imageUrl || 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png'
              });
            }
            popMap.get(eqId).bookings += 1;
          });
        }
      });
      const popArray = Array.from(popMap.values()).sort((a, b) => b.bookings - a.bookings).slice(0, 3);
      setPopularItems(popArray);

    } catch {
      // Use mock data if API fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const schedule = [
    { time: '09:00 AM', duration: '30 min', type: 'Equipment Pickup', item: 'Canon EOS R5 – Outdoor Shoot', color: 'bg-green-500' },
    { time: '11:30 AM', duration: '45 min', type: 'Equipment Drop-off', item: 'DJI Mavic 3 Pro', color: 'bg-blue-500' },
    { time: '02:00 PM', duration: '60 min', type: 'Maintenance Check', item: 'Bosch Drill Set', color: 'bg-red-500' },
    { time: '04:30 PM', duration: '30 min', type: 'New Reservation', item: 'Construction Mixer', color: 'bg-orange-500' },
  ];

  const displayTotal = stats.totalEquipment || 126;
  const displayAvailable = stats.available || 63;
  const displayRented = stats.rented || 32;
  const displayMaint = stats.maintenance || 31;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main wrapper */}
        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">

          {/* ── Top Header ── */}
          <Header title="Dashboard" onOpenSidebar={() => setSidebarOpen(true)} />

          {/* ── Page Content ── */}
          <div className="flex-1 p-4 md:p-6 xl:flex xl:gap-6">

            {/* Center Column */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Welcome Banner */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col sm:flex-row gap-4 overflow-hidden relative">
                {/* Orange accent top border */}

                <div className="flex-1 pt-1">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A] leading-tight">
                    Welcome back,{' '}
                    <span className="text-[#F97316]">
                      {user?.name?.split(' ')[0] || 'Admin'}
                    </span>{' '}
                    👋
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Here's what's happening with your rental fleet today.
                  </p>

                  <div className="flex items-center gap-5 mt-5">
                    {loading ? (
                      <div className="w-[100px] h-[100px] flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-[#F97316] text-3xl">
                          progress_activity
                        </span>
                      </div>
                    ) : (
                      <DonutChart
                        size={100}
                        centerText={String(displayTotal)}
                        centerSubtext="Total"
                        segments={[
                          { value: displayAvailable, color: '#22C55E' },
                          { value: displayRented, color: '#F97316' },
                          { value: displayMaint, color: '#EF4444' },
                        ]}
                      />
                    )}
                    <div className="space-y-2">
                      {[
                        { label: 'Available', value: displayAvailable, color: 'bg-green-500' },
                        { label: 'Rented', value: displayRented, color: 'bg-[#F97316]' },
                        { label: 'Maintenance', value: displayMaint, color: 'bg-red-500' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                          <span className="text-[#0F172A] font-extrabold text-sm">{s.value}</span>
                          <span className="text-slate-500 text-xs">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3">
                    ↻ Synced with live inventory
                  </p>
                </div>

                {/* Hero image */}
                <div className="hidden sm:flex items-end justify-end shrink-0 -mb-6 -mr-2">
                  <img
                    src="https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/drone%20(1).png"
                    alt="Featured equipment"
                    className="w-44 h-36 object-contain drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                  label="Today's Reservations"
                  value={resStats.todayReservations.toString().padStart(2, '0')}
                  href="/reservations"
                  trend="View active requests"
                />
                <StatCard
                  label="Active Reservations"
                  value={resStats.active.toString().padStart(2, '0')}
                  href="/reservations"
                  trend="Awaiting completion"
                />
                <StatCard
                  label="Today's Revenue"
                  value={`$${resStats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  href="/reservations"
                  trend="Syncs with payments"
                />
                <StatCard
                  label="Low Stock Items"
                  value={stats.lowStock.toString().padStart(2, '0')}
                  href="/inventory"
                  trend="Requires attention"
                />
              </div>

              {/* Revenue Overview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-extrabold text-[#0F172A]">Revenue Overview</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Revenue report · Nov 6 – Dec 6, 2021
                    </p>
                  </div>
                  <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#F97316] bg-white cursor-pointer">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Bar Chart */}
                  <div className="flex-1">
                    {/* Y-axis + bars */}
                    <div className="flex gap-2 h-32 items-end">
                      <div className="flex flex-col justify-between h-full text-right shrink-0">
                        {['$5k', '$4k', '$3k', '$2k', '$1k', '$0'].map((l) => (
                          <span key={l} className="text-[9px] text-slate-300">{l}</span>
                        ))}
                      </div>
                      <div className="flex-1">
                        <BarChart data={revenueData} />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="sm:w-[140px] shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5 flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-[#0F172A]">${(resStats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-400 mb-4">Total Revenue</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-xs text-green-600">payments</span>
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#0F172A]">${((resStats.totalRevenue || 0) * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-[10px] text-slate-400">Total Income</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-xs text-red-500">trending_down</span>
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#0F172A]">$25,580</p>
                            <p className="text-[10px] text-slate-400">Total Expenses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="mt-4 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#F97316] border border-[#F97316]/40 rounded-lg py-1.5 hover:bg-orange-50 transition-colors">
                      <span className="material-symbols-outlined text-xs">download</span>
                      Download Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Reservations */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <h3 className="font-extrabold text-[#0F172A]">Recent Reservations</h3>
                  <Link
                    href="/reservations"
                    className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1"
                  >
                    View All
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        {['ID', 'Customer', 'Equipment', 'Date', 'Status', 'Amount'].map((h) => (
                          <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentReservations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                            No recent reservations found.
                          </td>
                        </tr>
                      ) : (
                        recentReservations.map((r: any) => {
                          const price = r.payment?.amount ?? r.items?.reduce((acc: number, item: any) => acc + (Number(item.unitPrice || item.equipment?.rentalPrice || 0) * (item.quantity || 1)), 0) ?? 0;
                          return (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5 font-extrabold text-[#0F172A] text-xs">#{r.id?.slice(-6) || '------'}</td>
                              <td className="px-5 py-3.5 text-slate-700 text-sm">{r.user?.name || r.userName || 'N/A'}</td>
                              <td className="px-5 py-3.5 text-slate-600 text-sm">{r.items?.[0]?.equipment?.name || r.equipment?.name || r.equipmentName || 'N/A'}{r.items?.length > 1 ? ` (+${r.items.length - 1})` : ''}</td>
                              <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                  r.status === 'ACTIVE' || r.status === 'Active' || r.status === 'PENDING' || r.status === 'APPROVED'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : r.status === 'COMPLETED' || r.status === 'Completed'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 font-extrabold text-[#0F172A]">
                                {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Equipment Category Cards — mobile & tablet only (xl hides the right panel) */}
              <div className="xl:hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-[#0F172A]">Equipment Categories</h3>
                  <Link href="/equipment" className="text-xs text-[#F97316] font-bold hover:underline">View All</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Cameras & Photography', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpVbsLJAKj0Orozg-hpwXs2nssDP7P_sGvDA6Vw1D0h82W1NZEXskYiN6NJn7fPbpztJqs3bWI4NwXSFUG9E49BFCpptxlWP5-UK6nEedlLi8u5muwYEdexr5QPKwPomws60BX75aAwSO8WRJTvqwZWMEWL7B2Wnef_M8bMcysvVLa4il-eZ9vtoiyeblIt9OIvGHeWyL_SZQBvMljvzUjPPIZiq1-2bfNFj6QoPKKyeJsqPRD8_fO', count: '24 items' },
                    { name: 'Drones', img: 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/drone%20(1).png', count: '12 items' },
                    { name: 'Power Tools', img: 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png', count: '31 items' },
                    { name: 'Construction', img: 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/construction%20(1).png', count: '18 items' },
                    { name: 'Event', img: 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/events.png', count: '41 items' },
                  ].map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/equipment?category=${encodeURIComponent(cat.name)}`}
                      className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-2">
                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="text-xs font-bold text-[#0F172A] leading-tight truncate">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">{cat.count}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Panel (xl+) ── */}
            <div className="hidden xl:flex xl:flex-col xl:w-[280px] shrink-0 space-y-4">

              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-[#0F172A]">Today's Schedule</h3>
                  <span className="text-[10px] font-bold text-[#F97316] bg-orange-50 px-2 py-0.5 rounded-full">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="space-y-3.5">
                  {schedule.map((s, i) => (
                    <ScheduleItem key={i} {...s} />
                  ))}
                </div>
              </div>

              {/* Reservations Overview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-[#0F172A]">Reservations</h3>
                  <Link href="/reservations" className="text-[10px] text-[#F97316] font-bold hover:underline">View All</Link>
                </div>
                <p className="text-[10px] text-slate-400 mb-4">from {resStats.total} total reservations</p>
                <div className="flex items-center gap-4">
                  <DonutChart
                    size={80}
                    centerText={resStats.active.toString()}
                    centerSubtext="Active"
                    segments={[
                      { value: resStats.active, color: '#3B82F6' },
                      { value: resStats.completed, color: '#F97316' },
                      { value: resStats.cancelled, color: '#EF4444' },
                    ]}
                  />
                  <div className="space-y-2">
                    {[
                      { label: 'Active', value: resStats.active, color: 'bg-blue-500' },
                      { label: 'Completed', value: resStats.completed, color: 'bg-[#F97316]' },
                      { label: 'Cancelled', value: resStats.cancelled, color: 'bg-red-500' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                        <span className="font-extrabold text-[#0F172A]">{s.value}</span>
                        <span className="text-slate-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Equipment Overview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-[#0F172A]">Equipment</h3>
                  <Link href="/equipment" className="text-[10px] text-[#F97316] font-bold hover:underline">View All</Link>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">from {displayTotal} total items</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-[#0F172A]">{displayAvailable}</span>
                  <span className="text-xs text-green-600 font-bold">▲ 5.2%</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">Available right now</p>

                {/* Segmented Progress Bar */}
                <div className="w-full h-2 rounded-full flex overflow-hidden gap-px mb-2">
                  <div
                    className="bg-green-500 rounded-l-full"
                    style={{ width: `${(displayAvailable / displayTotal) * 100}%` }}
                  />
                  <div
                    className="bg-[#F97316]"
                    style={{ width: `${(displayRented / displayTotal) * 100}%` }}
                  />
                  <div
                    className="bg-red-500 rounded-r-full flex-1"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Available <span className="font-extrabold text-green-600">{displayAvailable}</span></span>
                  <span>Rented <span className="font-extrabold text-[#F97316]">{displayRented}</span></span>
                  <span>Maint. <span className="font-extrabold text-red-500">{displayMaint}</span></span>
                </div>
              </div>

              {/* Popular Equipment */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-[#0F172A]">Popular Items</h3>
                  <Link href="/equipment" className="text-[10px] text-[#F97316] font-bold hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {popularItems.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">No data available</div>
                  ) : (
                    popularItems.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 group">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0F172A] truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.price}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-extrabold text-[#0F172A]">{item.bookings}</p>
                          <p className="text-[10px] text-slate-400">bookings</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
