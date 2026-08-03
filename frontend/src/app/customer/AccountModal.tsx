'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileModal from './ProfileModal';
import MyReservationsModal from './MyReservationsModal';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AccountModal({ open, onClose }: AccountModalProps) {
  const { user, logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reservationsOpen, setReservationsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Only close if profile modal is also not open, otherwise let profile handle it
        if (!profileOpen) onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, profileOpen, reservationsOpen]);

  if (!open) return null;

  const handleLogout = () => {
    onClose();
    logout();
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrator',
    STAFF: 'Staff',
    WAREHOUSE_OPERATOR: 'Warehouse',
    CUSTOMER: 'Customer',
  };

  return (
    <>
      <div
        ref={ref}
        className="absolute right-0 top-full mt-3 w-[240px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-hidden"
      >
        {/* Notch */}
        <div className="absolute -top-2 right-5 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45 z-10" />

        {/* User Info Header */}
        <div className="px-4 py-3.5 bg-gradient-to-br from-orange-50 to-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-[#0F172A] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1.5">
          {/* Profile */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-lg text-slate-300 group-hover:text-[#F97316] transition-colors">person</span>
            <span className="">Profile</span>
            <span className="material-symbols-outlined text-xs text-slate-300 ml-auto">chevron_right</span>
          </button>

          {/* My Reservations */}
          <button
            onClick={() => { setReservationsOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-lg text-slate-300 group-hover:text-[#F97316] transition-colors">book_online</span>
            <span>My Reservations</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => { onClose(); window.location.href = '/settings'; }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-lg text-slate-300 group-hover:text-[#F97316] transition-colors">settings</span>
            <span className="">Settings</span>
          </button>

          <div className="h-px bg-slate-100 mx-3 my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-lg text-red-400 group-hover:text-red-500 transition-colors">logout</span>
            <span className="">Log Out</span>
          </button>
        </div>
      </div>

      {/* Profile Sub-Modal */}
      {profileOpen && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onCloseAll={() => { setProfileOpen(false); onClose(); }}
        />
      )}

      {/* My Reservations Sub-Modal */}
      {reservationsOpen && (
        <MyReservationsModal
          open={reservationsOpen}
          onClose={() => setReservationsOpen(false)}
        />
      )}
    </>
  );
}
