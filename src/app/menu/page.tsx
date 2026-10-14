import MenuAccordion from '@/components/menu/MenuAccordion';
import { getMenuTree } from '@/lib/menu';

// Statik önbellek (cache) aktif. Yönetim paneli güncellediğinde API üzerinden cache temizlenecek.

export const metadata = {
  title: 'Menü - Emmoğlu Menu',
  description: 'Emmoğlu menü, lezzetlerimizi keşfedin.',
};

export default async function MenuPage() {
  let menuData: Awaited<ReturnType<typeof getMenuTree>> = [];
  try {
    menuData = await getMenuTree();
  } catch (error) {
    console.error('Menü çekilirken hata:', error);
  }

  return (
    <div className="bg-black md:bg-gray-50 min-h-screen pb-20">
      {/* Menu Hero */}
      <section className="bg-black py-20 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage: "url('/images/gece-mekan.png')",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-zcool text-white">Menümüz</h1>
          <div className="h-1 w-20 bg-[#bc906b] mx-auto mt-6"></div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <MenuAccordion menuData={menuData} />
      </section>
    </div>
  );
}
