import { Coffee, UtensilsCrossed, Users } from 'lucide-react';

export default function Stats() {
  const stats = [
    {
      label: 'Masa',
      value: '50',
      icon: Coffee,
    },
    {
      label: 'Lezzet',
      value: '174',
      icon: UtensilsCrossed,
    },
    {
      label: 'Ekip',
      value: '19',
      icon: Users,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-zcool text-gray-900 mb-4">
            <span className="text-[#bc906b]">Emmoğlu'nu</span> Keşfedin
          </h2>
          <div className="flex justify-center mb-6">
            <div className="h-[2px] w-24 bg-[#bc906b]" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            İştah açıcı ve damağınıza hitap edecek birbirinden özel lezzetlerimiz size çok yakın.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center group"
              >
                <div className="bg-[#bc906b]/10 p-4 rounded-full mb-6 group-hover:bg-[#bc906b] transition-colors duration-300">
                  <Icon className="w-8 h-8 text-[#bc906b] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-gray-500 font-medium text-lg uppercase tracking-wider mb-2">
                  {stat.label}
                </div>
                <div className="text-5xl font-bold text-gray-900 font-zcool">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
