'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Staff/admin-only roles that can access the dashboard area */
const STAFF_ROLES = ['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'];

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        const roles = allowedRoles ?? STAFF_ROLES;
        if (!roles.includes(user.role)) {
          // Customers get redirected to home page
          router.push('/');
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="material-symbols-outlined animate-spin text-2xl text-[#F97316]">progress_activity</span>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roles = allowedRoles ?? STAFF_ROLES;
  if (!roles.includes(user.role)) return null;

  return <>{children}</>;
}

export default ProtectedRoute;