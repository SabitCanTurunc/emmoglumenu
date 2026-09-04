import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import ContactInfo from '@/components/home/ContactInfo';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <ContactInfo />
    </>
  );
}
