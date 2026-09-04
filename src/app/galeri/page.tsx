import Image from 'next/image';
import galleryData from '@/data/gallery.json';

export const metadata = {
  title: 'Galeri - Emmoğlu Menu',
  description: 'Emmoğlu galeri sayfası',
};

export default function GaleriPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="bg-black py-20 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('https://emmoglumenu.com/wp-content/uploads/2026/04/1banner-yatay-2-bannerPic-8.jpg')",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-zcool text-white">Galeri</h1>
          <div className="h-1 w-20 bg-[#bc906b] mx-auto mt-6"></div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryData.map((src: string, index: number) => (
            <div 
              key={index} 
              className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl shadow-md group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Galeri Görseli ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
