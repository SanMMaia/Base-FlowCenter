'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

type NewLayoutProps = {
  children: ReactNode;
  className?: string;
};

export default function NewLayout({ children, className = '' }: NewLayoutProps) {
  return (
    <div className={`flex h-screen bg-background/80 backdrop-blur-sm ${className}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
