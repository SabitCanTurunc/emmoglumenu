import { Sofa, Utensils, Star } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: 'Konsept',
      description: 'Rahat oturum alanına sahip.',
      icon: Sofa,
    },
    {
      title: 'Lezzet',
      description: 'Özel şeflerimiz ve özel malzemelerimizle ortaya çıkardığımız lezzetlere bayılacaksınız.',
      icon: Utensils,
    },
    {
      title: 'Hizmet',
      description: 'Kaliteli hizmet politikası',
      icon: Star,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
              >
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-[#bc906b]/10 rounded-full scale-150 group-hover:scale-175 transition-transform duration-300" />
                  <Icon className="w-12 h-12 text-[#bc906b] relative z-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-zcool text-gray-900 mb-4 group-hover:text-[#bc906b] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
