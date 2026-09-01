import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[600px] w-full bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: "url('https://emmoglumenu.com/wp-content/uploads/2026/04/1banner-yatay-2-bannerPic-8.jpg')",
        }}
      />
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center text-white max-w-3xl">
          <h1 className="font-zcool text-5xl md:text-6xl lg:text-7xl mb-4 tracking-wide font-normal">
            <span className="text-[#bc906b]">Emmoğlu </span> Hatay'da
          </h1>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="h-px w-12 bg-white/50" />
            <p className="text-lg md:text-xl font-light">
              Lezzetin ve kalitenin buluştuğu nokta
            </p>
            <div className="h-px w-12 bg-white/50" />
          </div>

          <Link 
            href="/menu"
            className="inline-block border-2 border-[#bc906b] hover:bg-[#bc906b] hover:text-white transition-colors duration-300 text-[#bc906b] px-8 py-3 rounded-full font-semibold text-lg"
          >
            Menümüz
          </Link>
        </div>
      </div>
    </section>
  );
}
