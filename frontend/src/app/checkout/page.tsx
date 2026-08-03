'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export default function CheckoutPage() {
  const { cart, startDate, endDate, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<PaymentStep>('form');
  const [reservationId, setReservationId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Card form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Derived totals
  const getDuration = () => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };
  const duration = getDuration();
  const subtotal = cart.reduce((s, i) => s + Number(i.equipment.rentalPrice ?? 0) * i.quantity * duration, 0);
  const deposit = cart.reduce((s, i) => s + Number(i.equipment.deposit ?? 0) * i.quantity, 0);
  const grandTotal = subtotal + deposit;

  // Redirect if cart is empty or not logged in
  useEffect(() => {
    if (!user) { router.push('/login?redirect=/checkout'); return; }
    if (cart.length === 0 && step === 'form') router.push('/');
  }, [user, cart, step, router]);

  // Format card number with spaces
  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  // Format expiry MM/YY
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) {
      setErrorMsg('Please fill in all card details correctly.');
      return;
    }
    setErrorMsg('');
    setStep('processing');

    try {
      // Step 1: Create Reservation
      const resData = await api.post('/reservations', {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: cart.map(item => ({ equipmentId: item.equipment.id, quantity: item.quantity })),
      });
      const resId = resData.data?.id || resData.data?.reservationId || resData.data?.data?.id;
      setReservationId(resId);

      // Step 2: Initiate Payment
      const payData = await api.post(`/payments/${resId}/initiate`);
      const pId = payData.data?.id || payData.data?.paymentId || payData.data?.data?.id;
      setPaymentId(pId);

      // Step 3: Simulate successful payment
      await api.patch(`/payments/${pId}/simulate`, { outcome: 'PAID' });

      clearCart();
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };

  // ─── Success State ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Payment Successful!</h1>
            <p className="text-slate-500 text-sm mt-2">Your reservation has been confirmed and payment processed.</p>
          </div>
          {reservationId && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reservation ID</p>
              <p className="text-sm font-mono font-bold text-[#0F172A] mt-0.5 truncate">{reservationId}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href="/reservations"
              className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">book_online</span>
              View My Reservations
            </Link>
            <Link
              href="/"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Processing State ──────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-12 text-center space-y-5">
          <div className="w-16 h-16 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Processing Payment…</h2>
            <p className="text-sm text-slate-500 mt-1">Creating reservation and confirming payment. Please wait.</p>
          </div>
        </div>
      </main>
    );
  }

  // ─── Main Form ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
          <span className="text-slate-400">Cart</span>
          <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
          <span className="font-bold text-[#0F172A]">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Order Summary ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#F97316]">receipt_long</span>
              <h2 className="text-lg font-bold text-[#0F172A]">Order Summary</h2>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const img = item.equipment.images?.[0] || 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png';
                const lineTotal = Number(item.equipment.rentalPrice ?? 0) * item.quantity * duration;
                return (
                  <div key={item.equipment.id} className="flex gap-4 py-3 border-b border-slate-50 last:border-0">
                    <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                      <img src={img} alt={item.equipment.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-sm text-[#0F172A] truncate">{item.equipment.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.quantity} × Rs.{Number(item.equipment.rentalPrice ?? 0).toFixed(2)}/day × {duration} {duration === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-[#0F172A] shrink-0">Rs.{lineTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            {/* Rental Period */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-[#F97316] text-2xl">calendar_month</span>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rental Period</p>
                <p className="text-sm font-bold text-[#0F172A]">{startDate} → {endDate}</p>
                <p className="text-xs text-slate-500">{duration} {duration === 1 ? 'day' : 'days'}</p>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Rental Cost</span>
                <span className="font-bold">Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security Deposit <span className="text-xs text-slate-400">(Refundable)</span></span>
                <span className="font-bold">Rs.{deposit.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-100 my-1" />
              <div className="flex justify-between text-base font-extrabold text-[#0F172A]">
                <span>Total Due</span>
                <span className="text-[#F97316] text-lg">Rs.{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Back link */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#F97316] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to cart
            </button>
          </div>

          {/* ── Right: Payment Form ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#F97316]">credit_card</span>
              <h2 className="text-lg font-bold text-[#0F172A]">Payment Details</h2>
            </div>

            <form onSubmit={handlePay} className="space-y-5">

              {/* Card Number */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    maxLength={19}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent focus:bg-white transition-all"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-6 h-4 bg-[#EB001B] rounded-sm opacity-80" />
                    <div className="w-6 h-4 bg-[#F79E1B] rounded-sm opacity-80 -ml-2" />
                  </div>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {(errorMsg || step === 'error') && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
                  <span className="material-symbols-outlined text-sm mt-0.5">error</span>
                  <span>{errorMsg || 'An error occurred. Please try again.'}</span>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl text-base transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined">lock</span>
                Pay ${grandTotal.toFixed(2)}
              </button>

              {/* Retry on error */}
              {step === 'error' && (
                <button
                  type="button"
                  onClick={() => { setStep('form'); setErrorMsg(''); }}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Try Again
                </button>
              )}
            </form>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm text-blue-500">shield</span>
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm text-[#F97316]">lock</span>
                <span>PCI Compliant</span>
              </div>
            </div>

            {/* Test card hint */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              <strong>Demo Mode:</strong> Use any card number, name, expiry (future date), and CVV to simulate a successful payment.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
