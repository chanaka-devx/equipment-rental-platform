'use client';

import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setErrorMsg('');

    if (data.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Call Register API
      await api.post('/auth/register', {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      // 2. Call Login API to authenticate immediately
      const loginRes = await api.post('/auth/login', {
        email: data.email.trim(),
        password: data.password,
      });

      const { access_token, refresh_token, user: userData } = loginRes.data;
      login(userData || { name: data.name, email: data.email, role: 'USER' }, { access_token, refresh_token });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration failed', error);
      const msg = error.response?.data?.message;
      const formattedMsg = Array.isArray(msg)
        ? msg.join('. ')
        : (msg || 'Failed to create account. Please check your information.');
      setErrorMsg(formattedMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-grow flex items-center justify-center relative overflow-hidden py-12 px-margin-mobile md:px-margin-desktop">
        {/* Background Industrial Hero Canvas */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACW-cHlcV4OCHkdgUar1cVi0_M7SQFIFpRiYCPTpdSUjUKbbcxMweo0zPMW6FGpy5k2ax5BOjmWGt0v5UFdh2vqUxwsgbs6JlCurOjrDvN_qiTFxlGwMp8zGK5fjlNM7NZ8W67Nmb0V4NE2DCXviACZLCkRrCsTlEkEuE969AjvMjbE2xsjpg_nUo7dGPAPlvNarbhEDgG2kjhtyCEx2j0yuy5ljFUFEkgQA2UM9uVTRZQZUGxDwcq')"
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0F172A] bg-opacity-75 mix-blend-multiply"></div>

        {/* Register Card */}
        <div className="relative z-10 w-full max-w-[460px] bg-[#FFFFFF] border border-slate-200 rounded-lg shadow-xl p-6 md:p-8 my-auto">
          {/* Header & Branding */}
          <div className="text-center mb-6">
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-[#0F172A] mt-1 mb-1">
              Create Account
            </h1>
            <p className="font-body-md text-body-md text-slate-600">
              Access nationwide professional rentals
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
              <label className="block font-label-md text-label-md text-[#0F172A] font-semibold mb-1" htmlFor="name">
                Full Name / Company
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: true })}
                placeholder="John Doe or Acme Inc."
                className="w-full px-3 py-2.5 bg-[#FFFFFF] text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none font-body-md transition-all"
              />
            </div>

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
              <label className="block font-label-md text-label-md text-[#0F172A] font-semibold mb-1" htmlFor="password">
                Password <span className="text-xs text-slate-400 font-normal">(Min 8 chars)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true, minLength: 8 })}
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
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316] accent-[#F97316]"
              />
              <label htmlFor="terms" className="ml-2 font-body-sm text-body-sm text-slate-600">
                I agree to the{' '}
                <Link href="/terms" className="text-[#F97316] hover:underline font-medium">
                  Terms
                </Link>{' '}
                &amp;{' '}
                <Link href="/privacy" className="text-[#F97316] hover:underline font-medium">
                  Privacy Policy
                </Link>
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="font-body-sm text-body-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#F97316] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
