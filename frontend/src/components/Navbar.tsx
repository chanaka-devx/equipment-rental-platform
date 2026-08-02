'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, startDate, endDate, setStartDate, setEndDate, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [catBarVisible, setCatBarVisible] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const lastScrollY = useRef(0);
  const cartRef = useRef<HTMLDivElement>(null);

  const getDuration = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const duration = getDuration();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.equipment.rentalPrice ?? 0) * item.quantity * duration, 0);
  const totalDeposit = cart.reduce((sum, item) => sum + Number(item.equipment.deposit ?? 0) * item.quantity, 0);
  const grandTotal = subtotal + totalDeposit;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleReserve = () => {
    if (!user) {
      alert('Please log in or sign up to make a reservation!');
      window.location.href = `/login?redirect=/checkout`;
      return;
    }
    if (!startDate || !endDate) { setSubmitError('Please select both start and end dates.'); return; }
    if (new Date(endDate) <= new Date(startDate)) { setSubmitError('End date must be after start date.'); return; }
    setCartOpen(false);
    router.push('/checkout');
  };

  // Hide category bar on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) setCatBarVisible(true);
      else if (currentY > lastScrollY.current) setCatBarVisible(false);
      else setCatBarVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close cart on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    if (cartOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cartOpen]);

  const openCart = () => {
    setCartOpen(true);
  };

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
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              {['f', 't', 'y', 'i'].map((icon, i) => (
                <a key={i} href="#" className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] hover:bg-[#F97316] hover:text-white transition-colors">
                  {icon}
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
              if (searchQuery.trim()) window.location.href = `/equipment?search=${encodeURIComponent(searchQuery.trim())}`;
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

          {/* Cart Button with Dropdown */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={openCart}
              className="flex items-center gap-2 text-slate-700 hover:text-[#F97316] transition-colors relative focus:outline-none"
              aria-label="View Cart"
            >
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="font-bold text-sm hidden md:inline">Cart</span>
            </button>

            {/* Cart Dropdown Panel */}
            {cartOpen && (
              <div className="absolute right-0 top-full mt-3 w-[380px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[200] flex flex-col max-h-[80vh]">
                {/* Arrow notch */}
                <div className="absolute -top-2 right-5 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F97316] text-xl">shopping_cart</span>
                    <h2 className="text-base font-bold text-[#0F172A]">Your Rental Cart</h2>
                    {totalItems > 0 && (
                      <span className="bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>
                    )}
                  </div>
                  <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center space-y-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">shopping_cart_off</span>
                      <p className="text-sm text-slate-500 font-medium">Your cart is empty.</p>
                      <button onClick={() => setCartOpen(false)} className="text-xs text-[#F97316] hover:underline font-bold">
                        Continue Browsing
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Items */}
                      <div className="divide-y divide-slate-100">
                        {cart.map((item) => {
                          const img = item.equipment.images?.[0] || 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png';
                          return (
                            <div key={item.equipment.id} className="py-3 flex gap-3">
                              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={img} alt={item.equipment.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="font-bold text-xs text-[#0F172A] truncate">{item.equipment.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">${Number(item.equipment.rentalPrice ?? 0).toFixed(2)}/day</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <button
                                    onClick={() => updateQuantity(item.equipment.id, item.quantity - 1)}
                                    className="w-5 h-5 rounded border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] flex items-center justify-center text-xs font-bold"
                                  >-</button>
                                  <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.equipment.id, item.quantity + 1)}
                                    className="w-5 h-5 rounded border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] flex items-center justify-center text-xs font-bold"
                                  >+</button>
                                  <div className="flex-grow" />
                                  <button
                                    onClick={() => removeFromCart(item.equipment.id)}
                                    className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-0.5"
                                  >
                                    <span className="material-symbols-outlined text-[11px]">delete</span>Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Rental Dates */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Rental Period</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Start</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-[#F97316]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">End</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-[#F97316]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl space-y-3">
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-bold text-slate-800">{duration} {duration === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rental Cost:</span>
                        <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span className="font-bold text-slate-800">${totalDeposit.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="flex justify-between text-sm font-extrabold text-[#0F172A]">
                        <span>Total Estimated:</span>
                        <span className="text-[#F97316]">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">error</span>
                        <span>{submitError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleReserve}
                      className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">calendar_month</span>Confirm Reservation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* My Reservations */}
          <Link href="/reservations" className="flex items-center gap-2 text-[#334155] hover:text-orange-600 transition-colors">
            <span className="material-symbols-outlined text-2xl">book_online</span>
            <span className="font-bold text-sm hidden sm:inline">My Reservations</span>
          </Link>

          {/* Account */}
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
                    >Log Out</button>
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
                <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="text-left text-sm font-bold text-[#F97316]">Log Out</button>
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