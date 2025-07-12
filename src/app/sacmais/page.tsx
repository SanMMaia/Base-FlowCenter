'use client';

import { Suspense } from 'react';
import NewLayout from '@/components/NewLayout';
import Loading from '@/components/Loading';

export default function SacmaisPage() {
  return (
    <NewLayout>
      <div className="relative h-full">
        <button 
          className="fixed top-1 right-55 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-[100]"
          onClick={() => {/* Lógica para novo item */}}
        >
          Novo
        </button>
        <Suspense fallback={<Loading />}>
          <iframe 
            src="https://app2.sacmais.com.br/" 
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            allowFullScreen
            loading="lazy"
          />
        </Suspense>
      </div>
    </NewLayout>
  );
}
