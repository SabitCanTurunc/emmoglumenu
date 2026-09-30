'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const isHome = pathname === '/';

  return (
    <>
      {!isAdmin && <Header />}
      <main className={!isAdmin ? (isHome ? "flex-grow" : "flex-grow pt-0 md:pt-[104px]") : "flex-grow"}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
