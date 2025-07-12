'use client';

import AuthGuard from '@/components/AuthGuard';
import { usePathname } from 'next/navigation';

const publicRoutes = ['/login', '/register', '/forgot-password', '/update-password'];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <>
      {isPublicRoute ? (
        children
      ) : (
        <AuthGuard>
          {children}
        </AuthGuard>
      )}
    </>
  );
}
