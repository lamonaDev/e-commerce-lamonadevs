"use client";
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainContext } from '@/app/_Context/MainContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userToken } = useContext(MainContext) as { userToken: string | null };
  const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const router = useRouter();

  useEffect(() => {
    if (!localToken) {
      router.push('/login');
    }
  }, [router, localToken]);

  return userToken ? <>{children}</> : null;
}