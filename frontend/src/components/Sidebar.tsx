'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'event_available', label: 'Reservations', href: '/reservations' },
  { icon: 'construction', label: 'Equipment', href: '/equipment' },
  { icon: 'inventory_2', label: 'Inventory', href: '/inventory' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[240px] bg-[#0F172A] z-50
          flex flex-col py-6 px-3
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F97316] flex items-center justify-center shrink-0">
            <Image
              src="/logoRF.png"
              alt="RentForge"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-base leading-tight tracking-tight">
              RentForge
            </h1>
            <p className="text-slate-500 text-[10px] font-medium">Equipment Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold
                  ${isActive
                    ? 'bg-[#F97316] text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-white' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-800 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
