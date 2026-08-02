'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 py-8">
          {/* Welcome Banner */}
          <div className="bg-[#0F172A] text-white rounded-lg p-6 md:p-8 shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="bg-[#F97316] text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                {user?.role || 'Customer'} Account
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || user?.email || 'User'}!
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Manage your equipment rentals, reservations, and account settings.
              </p>
            </div>
            <Link
              href="/equipment"
              className="bg-[#F97316] hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded transition-colors text-sm shrink-0"
            >
              Browse Equipment
            </Link>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Equipment Catalog</h2>
                <p className="text-slate-600 text-sm">
                  Browse our full fleet of heavy-duty machinery and tools available for rent.
                </p>
              </div>
              <Link href="/equipment" className="mt-4 text-[#F97316] font-bold text-sm hover:underline inline-flex items-center gap-1">
                View Catalog <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">My Reservations</h2>
                <p className="text-slate-600 text-sm">
                  Track active rentals, view upcoming reservations, and manage returns.
                </p>
              </div>
              <Link href="/reservations" className="mt-4 text-blue-600 font-bold text-sm hover:underline inline-flex items-center gap-1">
                View Rentals <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Account Settings</h2>
                <p className="text-slate-600 text-sm">
                  Update your contact details, company profile, and password.
                </p>
              </div>
              <Link href="/settings" className="mt-4 text-slate-700 font-bold text-sm hover:underline inline-flex items-center gap-1">
                Manage Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
