'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onCloseAll: () => void;
}

export default function ProfileModal({ open, onClose, onCloseAll }: ProfileModalProps) {
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrator',
    STAFF: 'Staff',
    WAREHOUSE_OPERATOR: 'Warehouse Operator',
    CUSTOMER: 'Customer',
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const fields = [
    { icon: 'person', label: 'Name', value: user?.name || '—' },
    { icon: 'mail', label: 'Email', value: user?.email || '—' },
    { icon: 'badge', label: 'Role', value: roleLabel[user?.role] || user?.role || '—' },
  ];

  return (
    /* Positioned to overlay the account modal — absolute right-0 top-0, same anchor */
    <div
      ref={ref}
      className="absolute right-0 top-0 w-[240px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[310] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#0F172A] truncate leading-tight">{user?.name || 'User'}</p>
            <span className="text-[10px] text-[#F97316] font-semibold">{roleLabel[user?.role] || user?.role}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-slate-600 transition-colors focus:outline-none shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[15px] text-slate-300 shrink-0">{f.icon}</span>
            <div className="min-w-0">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">{f.label}</p>
              <p className="text-xs font-semibold text-[#0F172A] truncate mt-0.5">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
