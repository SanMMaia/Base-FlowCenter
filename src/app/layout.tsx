import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowCenter',
  description: 'Sistema de gestão de fluxos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background/95 backdrop-blur-sm`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
