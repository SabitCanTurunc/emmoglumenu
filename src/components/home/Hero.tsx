import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: "url('https://emmoglumenu.com/wp-content/uploads/2026/04/1banner-yatay-2-bannerPic-8.jpg')",
        }}
      />
      
      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#111111]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#bc906b]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 rounded-full border border-[#bc906b]/30 bg-[#1a1a1a]/50 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#bc906b] animate-pulse"></span>
            <span className="text-[#bc906b] text-sm font-semibold tracking-widest uppercase">1994'ten Beri</span>
          </div>

          <h1 className="font-zcool text-6xl md:text-7xl lg:text-8xl mb-6 tracking-wider font-normal leading-tight drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#bc906b] to-[#d4af37]">Emmoğlu </span> <br className="md:hidden" />Hatay'da
          </h1>
          
          <div className="flex items-center justify-center space-x-6 mb-12">
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-[#bc906b]" />
            <p className="text-lg md:text-2xl font-light text-gray-300 tracking-wide">
              Lezzetin ve kalitenin buluştuğu nokta
            </p>
            <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-[#bc906b]" />
          </div>

          <Link 
            href="/menu"
            className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-black bg-[#bc906b] rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(188,144,107,0.3)] hover:shadow-[0_0_40px_rgba(188,144,107,0.5)]"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-56 opacity-10"></span>
            <span className="relative tracking-widest text-lg uppercase">Menümüzü İnceleyin</span>
          </Link>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-gray-400 text-xs tracking-widest uppercase mb-2">Aşağı Kaydır</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#bc906b] to-transparent" />
      </div>
    </section>
  );
}
