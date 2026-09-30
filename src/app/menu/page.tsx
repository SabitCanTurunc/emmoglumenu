import MenuAccordion from '@/components/menu/MenuAccordion';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic'; // Her zaman güncel veriyi çekmesi için

export const metadata = {
  title: 'Menü - Emmoğlu Menu',
  description: 'Emmoğlu menü, lezzetlerimizi keşfedin.',
};

async function getMenuData() {
  try {
    await connectToDatabase();
    
    // Kategorileri sırasına göre getir
    const categories = await Category.find({}).sort({ order: 1 }).lean();
    
    // Her kategori için ürünleri çek
    const menuData = await Promise.all(
      categories.map(async (cat: any) => {
        const products = await Product.find({ category: cat._id }).sort({ order: 1 }).lean();
        return {
          id: cat._id.toString(),
          category: cat.name,
          image: cat.image,
          order: cat.order,
          items: products.map((p: any) => ({
            id: p._id.toString(),
            title: p.title,
            price: p.price,
            description: p.description,
            image: p.image,
            order: p.order,
          })),
        };
      })
    );
    return menuData;
  } catch (error) {
    console.error('Menü çekilirken hata:', error);
    return [];
  }
}

export default async function MenuPage() {
  const menuData = await getMenuData();

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
