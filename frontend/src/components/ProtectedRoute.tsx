'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
    else if (allowedRoles && !allowedRoles.includes(user.role)) router.push('/dashboard');
  }, [user]);

  if (!user) return null;
  return <>{children}</>;
}

export default ProtectedRoute;