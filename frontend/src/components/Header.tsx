'use client';

import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
}

export default function Header({ title, onOpenSidebar }: HeaderProps) {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A] leading-tight">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" aria-label="Notifications">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#F97316] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 ml-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-[#0F172A] leading-tight">
              {user?.name || user?.email || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {user?.role?.toLowerCase() || 'admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
