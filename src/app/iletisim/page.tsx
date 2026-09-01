export const metadata = {
  title: 'İletişim - Emmoğlu Menu',
  description: 'Emmoğlu iletişim sayfası',
};

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-zcool text-[#bc906b] mb-4">İletişim</h1>
        <p className="text-2xl md:text-4xl text-gray-700 font-light tracking-wide uppercase">
          Pek Yakında
        </p>
        <div className="w-24 h-1 bg-[#bc906b] mx-auto mt-8"></div>
      </div>
    </div>
  );
}
