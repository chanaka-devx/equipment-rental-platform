'use client';

import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: data.email.trim(),
        password: data.password,
      });
      const { access_token, refresh_token, user: userData } = res.data;
      login(userData || { email: data.email, role: 'USER' }, { access_token, refresh_token });
      const staffRoles = ['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'];
      const destination = staffRoles.includes(userData?.role) ? '/dashboard' : '/';
      router.push(destination);
    } catch (error: any) {
      console.error('Login failed', error);
      const msg = error.response?.data?.message;
      const formattedMsg = Array.isArray(msg)
        ? msg.join('. ')
        : (msg || 'Failed to sign in. Please check your credentials.');
      setErrorMsg(formattedMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <main className="flex-grow flex items-center justify-center relative overflow-hidden py-12 px-margin-mobile md:px-margin-desktop">
        {/* Background Industrial Hero Canvas */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
          style={{
            backgroundImage:
              "url('https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/events.png')"
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0F172A] bg-opacity-75 mix-blend-multiply"></div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[460px] bg-[#FFFFFF] border border-slate-200 rounded-lg shadow-xl p-6 md:p-8 my-auto">
          {/* Header & Branding */}
          <div className="text-center mb-6">
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-[#0F172A] mt-1 mb-1">
              Sign In
            </h1>
            <p className="font-body-md text-body-md text-slate-600">
              Rent the gear. Get the job done.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded font-body-sm">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-label-md text-label-md text-[#0F172A] font-semibold mb-1" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { required: true })}
                placeholder="name@company.com"
                className="w-full px-3 py-2.5 bg-[#FFFFFF] text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none font-body-md transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-label-md text-label-md text-[#0F172A] font-semibold" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="font-label-sm text-label-sm text-gray-500 hover:text-[#F97316] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-[#FFFFFF] text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none font-body-md transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A]"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316] accent-[#F97316]"
              />
              <label htmlFor="remember" className="ml-2 font-body-sm text-body-sm text-slate-600">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F97316] text-white font-headline-md py-3 rounded hover:bg-orange-600 transition-colors shadow-sm font-bold uppercase tracking-wider text-[15px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="font-body-sm text-body-sm text-slate-600">
              New to RentForge?{' '}
              <Link href="/register" className="text-[#F97316] font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}