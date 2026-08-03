'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import CartModal from '@/app/customer/CartModal';
import NotificationsModal from '@/app/customer/NotificationsModal';
import AccountModal from '@/app/customer/AccountModal';

export default function Navbar() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catBarVisible, setCatBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for trigger buttons (for positioning)
  const cartBtnRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLDivElement>(null);
  const accountBtnRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const closeAll = () => {
    setCartOpen(false);
    setNotificationsOpen(false);
    setAccountOpen(false);
  };

  const toggleCart = () => { closeAll(); setCartOpen((v) => !v); };
  const toggleNotifications = () => { closeAll(); setNotificationsOpen((v) => !v); };
  const toggleAccount = () => { closeAll(); setAccountOpen((v) => !v); };

  // Hide category bar on scroll down — with delta threshold to prevent oscillation
  useEffect(() => {
    const DELTA = 8; // px — minimum scroll amount before toggling
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      if (currentY < 10) {
        setCatBarVisible(true);
      } else if (diff > DELTA) {
        // scrolled down enough
        setCatBarVisible(false);
        lastScrollY.current = currentY;
      } else if (diff < -DELTA) {
        // scrolled up enough
        setCatBarVisible(true);
        lastScrollY.current = currentY;
      }
      // if |diff| < DELTA, do nothing — prevents oscillation
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Cameras & Photography', href: `/category?name=${encodeURIComponent('Cameras & Photography')}` },
    { name: 'Drones', href: `/category?name=${encodeURIComponent('Drones')}` },
    { name: 'Power Tools', href: `/category?name=${encodeURIComponent('Power Tools')}` },
    { name: 'Construction Equipment', href: `/category?name=${encodeURIComponent('Construction Equipment')}` },
    { name: 'Event', href: `/category?name=${encodeURIComponent('Event ')}` },
  ];

  return (
    <header className="w-full bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">

      {/* TIER 1: Top Utility Bar */}
      <div className="bg-[#0F172A] text-slate-200 py-2 text-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span className="material-symbols-outlined text-base text-[#F97316]">headset_mic</span>
            <span>+(94) 110 000 000</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5 font-medium">
              {user ? (
                <>
                  {/* Only show dashboard/admin links for staff */}
                  {['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/dashboard" className="hover:text-[#F97316] transition-colors">Dashboard</Link>
                  )}
                  {['ADMIN', 'STAFF'].includes(user.role) && (
                    <Link href="/reservations" className="hover:text-[#F97316] transition-colors">Reservations</Link>
                  )}
                  {['ADMIN', 'STAFF'].includes(user.role) && (
                    <Link href="/equipment" className="hover:text-[#F97316] transition-colors">Equipment</Link>
                  )}
                  {['ADMIN', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/inventory" className="hover:text-[#F97316] transition-colors">Inventory</Link>
                  )}
                  {['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/settings" className="hover:text-[#F97316] transition-colors">Settings</Link>
                  )}
                  {['CUSTOMER'].includes(user.role) && (
                    <Link href="/contact" className="hover:text-[#F97316] transition-colors">Contact Us</Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/equipment" className="hover:text-[#F97316] transition-colors">Equipment</Link>
                  <Link href="/contact" className="hover:text-[#F97316] transition-colors">Contact</Link>
                </>
              )}
            </nav>
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              {[
                { name: 'Facebook', url: 'https://www.facebook.com', svg: <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/> },
                { name: 'X', url: 'https://x.com', svg: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/> },
                { name: 'YouTube', url: 'https://youtube.com', svg: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
                { name: 'Instagram', url: 'https://instagram.com', svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> }
              ].map((icon, i) => (
                <a key={i} href={icon.url} target="_blank" rel="noopener noreferrer" aria-label={icon.name} className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-[#F97316] hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                    {icon.svg}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Logo, Search & Actions */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo2.svg" alt="RentForge Logo" width={48} height={48} className="h-10 w-auto" priority />
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="text-[#0F172A]">Rent</span><span className="text-[#F97316]">Forge</span>
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 mx-4 lg:mx-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
            }}
            className="w-full flex items-center"
          >
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">search</span>
              <input
                type="text"
                placeholder="Search Products, Tools & Machinery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 rounded-l-md pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent focus:bg-white transition-all"
              />
              <button type="submit" className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-r-md transition-colors shrink-0">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">

          {/* Cart */}
          <div className="relative" ref={cartBtnRef}>
            <button
              onClick={toggleCart}
              className="flex items-center gap-2 text-slate-700 hover:text-[#F97316] transition-colors relative focus:outline-none"
              aria-label="View Cart"
            >
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
          </div>

          {/* Notifications — only for logged-in users */}
          {user && (
            <div className="relative" ref={notifBtnRef}>
              <button
                onClick={toggleNotifications}
                className="flex items-center gap-2 text-slate-700 hover:text-[#F97316] transition-colors relative focus:outline-none"
                aria-label="Notifications"
              >
                <div className="relative inline-flex items-center">
                  <span className="material-symbols-outlined text-2xl">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              </button>
              <NotificationsModal
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onUnreadCountChange={setUnreadCount}
              />
            </div>
          )}

          {/* Account */}
          <div className="relative" ref={accountBtnRef}>
            {user ? (
              <>
                <button
                  onClick={toggleAccount}
                  className="flex items-center gap-2 text-left hover:text-[#F97316] transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-2xl text-slate-700">person</span>
                  <div className="hidden md:flex flex-col">
                    <span className="text-[11px] text-slate-500 leading-tight">Hello, {user.name || 'User'}</span>
                    <span className="text-xs font-bold text-[#F97316] flex items-center gap-0.5">
                      My Account <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                    </span>
                  </div>
                </button>
                <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-slate-700">person</span>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-slate-500 leading-tight">Sign in / Join Free</span>
                  <Link href="/login" className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5">
                    My Account <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 text-slate-700 hover:text-[#F97316] focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* TIER 3: Category Bar */}
      <div className={`bg-[#F97316] text-white transition-all duration-300 overflow-hidden ${catBarVisible ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <nav className="hidden lg:flex items-center justify-between overflow-x-auto px-60 py-2.5">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href} className="font-bold text-sm text-white hover:text-orange-100 transition-colors whitespace-nowrap">
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search Equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-md pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  {['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Dashboard</Link>
                  )}
                  <Link href="/equipment" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Equipment</Link>
                  {['ADMIN', 'STAFF'].includes(user.role) && (
                    <Link href="/reservations" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Reservations</Link>
                  )}
                  {['ADMIN', 'STAFF'].includes(user.role) && (
                    <Link href="/customers" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Customers</Link>
                  )}
                  {['ADMIN', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/inventory" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Inventory</Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link href="/payments" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Payments</Link>
                  )}
                  {['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Settings</Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/equipment" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Equipment</Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Contact</Link>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Equipment Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white font-medium text-xs py-2 px-3 rounded transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500">Signed in as <strong className="text-slate-800">{user.email}</strong></span>
                <button onClick={() => { setMobileMenuOpen(false); window.location.href = '/settings'; }} className="text-left text-sm font-bold text-slate-600">Settings</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-slate-100 text-slate-800 font-bold text-sm py-2 rounded">Sign In</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-[#F97316] text-white font-bold text-sm py-2 rounded">Join Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export { Navbar as Nav };