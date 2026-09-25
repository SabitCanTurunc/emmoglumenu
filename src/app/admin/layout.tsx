import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/admin/Sidebar';
import LoginForm from '@/components/admin/LoginForm';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Paneli - Emmoğlu',
  description: 'Emmoğlu menü yönetim paneli',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_session');
  const isAuthenticated = authCookie?.value === 'authenticated';

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-[#111111] text-white ${inter.className}`}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
