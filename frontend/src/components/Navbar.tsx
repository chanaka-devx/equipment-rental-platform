'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const categories = [
    { name: 'Earthmoving', href: '/equipment?category=earthmoving' },
    { name: 'Aerial Lifts', href: '/equipment?category=aerial-lifts' },
    { name: 'Compaction', href: '/equipment?category=compaction' },
    { name: 'Generators & Power', href: '/equipment?category=generators' },
    { name: 'Material Handling', href: '/equipment?category=material-handling' },
    { name: 'Trucks & Trailers', href: '/equipment?category=trucks' },
    { name: 'Concrete', href: '/equipment?category=concrete' },
    { name: 'Tools & Other', href: '/equipment?category=tools' },
  ];

  return (
    <header className="w-full bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      {/* TIER 1: Top Utility Bar (Navy Dark Bar) */}
      <div className="bg-[#0F172A] text-slate-200 py-2 text-sm">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between">
          {/* Phone Contact & Customer Support */}
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span className="material-symbols-outlined text-base text-[#F97316]">headset_mic</span>
            <span>+(94) 110 000 000</span>
          </div>

          {/* Upper Line Links (User Request) */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5 font-medium">
              {user ? (
                <>
                  <Link href="/dashboard" className="hover:text-[#F97316] transition-colors">Dashboard</Link>
                  <Link href="/reservations" className="hover:text-[#F97316] transition-colors">Reservations</Link>
                  {user.role && ['ADMIN', 'STAFF'].includes(user.role) && (
                    <Link href="/customers" className="hover:text-[#F97316] transition-colors">Customers</Link>
                  )}
                  {user.role && ['ADMIN', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/inventory" className="hover:text-[#F97316] transition-colors">Inventory</Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link href="/payments" className="hover:text-[#F97316] transition-colors">Payments</Link>
                  )}
                  <Link href="/settings" className="hover:text-[#F97316] transition-colors">Settings</Link>
                </>
              ) : (
                <>
                  <Link href="/equipment" className="hover:text-[#F97316] transition-colors">Equipment</Link>
                  <Link href="/contact" className="hover:text-[#F97316] transition-colors">Contact</Link>
                </>
              )}
            </nav>

            {/* Social Icons */}
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <a href="#" aria-label="Facebook" className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] hover:bg-[#F97316] hover:text-white transition-colors">
                f
              </a>
              <a href="#" aria-label="Twitter" className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] hover:bg-[#F97316] hover:text-white transition-colors">
                t
              </a>
              <a href="#" aria-label="YouTube" className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] hover:bg-[#F97316] hover:text-white transition-colors">
                y
              </a>
              <a href="#" aria-label="Instagram" className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] hover:bg-[#F97316] hover:text-white transition-colors">
                i
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Main Branding, Search & User Bar */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-3 flex items-center justify-between gap-4">
        {/* RentForge Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A] shrink-0">
          <span className="material-symbols-outlined text-[#F97316] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            precision_manufacturing
          </span>
          <span className="text-[#0F172A]">RentForge</span>
        </Link>

        {/* Center Long Search Bar */}
        <div className="hidden md:flex flex-1 mx-4 lg:mx-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/equipment?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="w-full flex items-center"
          >
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search Products, Tools &amp; Machinery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 rounded-l-md pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-r-md transition-colors flex items-center justify-center shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Account & Cart */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          

          {/* User Account */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
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

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                      Signed in as <p className="font-bold text-slate-800 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link href="/reservations" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Rentals</Link>
                    <Link href="/settings" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</Link>
                    <button
                      onClick={() => { setAccountDropdownOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#F97316] hover:bg-orange-50 font-medium"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
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

          {/* Cart */}
          <Link href="/reservations" className="flex items-center gap-2 text-[#F97316] hover:text-orange-600 transition-colors">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            <span className="font-bold text-sm hidden sm:inline flex items-center gap-0.5">
              My Cart <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 text-slate-700 hover:text-[#F97316] focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* TIER 3: Category Navigation Bar (Industrial Orange Background) */}
      <div className="bg-[#F97316] text-white">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <nav className="hidden lg:flex items-center justify-between overflow-x-auto py-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="font-bold text-sm text-white hover:text-orange-100 transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4">
          {/* Mobile Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search Equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-md pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          {/* Upper Nav Links for Mobile */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Dashboard</Link>
                  <Link href="/equipment" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Equipment</Link>
                  <Link href="/reservations" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Reservations</Link>
                  {user.role && ['ADMIN', 'STAFF'].includes(user.role) && (
                    <Link href="/customers" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Customers</Link>
                  )}
                  {user.role && ['ADMIN', 'WAREHOUSE_OPERATOR'].includes(user.role) && (
                    <Link href="/inventory" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Inventory</Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link href="/payments" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Payments</Link>
                  )}
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Settings</Link>
                </>
              ) : (
                <>
                  <Link href="/equipment" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Equipment</Link>
                  <Link href="/locations" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Locations</Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-[#F97316]">Contact</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Categories */}
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

          {/* Mobile Account / Actions */}
          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500">Signed in as <strong className="text-slate-800">{user.email}</strong></span>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="text-left text-sm font-bold text-[#F97316]"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-slate-100 text-slate-800 font-bold text-sm py-2 rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-[#F97316] text-white font-bold text-sm py-2 rounded"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export { Navbar as Nav };