import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Hero from "@/components/sections/Hero";
import BrandMarquee from "@/components/sections/BrandMarquee";
import Categories from "@/components/sections/Categories";
import Manifesto from "@/components/sections/Manifesto";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import BrandPillars from "@/components/sections/BrandPillars";
import Testimonials from "@/components/sections/Testimonials";
import Lifestyle from "@/components/sections/Lifestyle";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="bg-aurum-black">
        <Navbar />
        <Hero />
        <BrandMarquee />
        <Categories />
        <Manifesto />
        <FeaturedProducts />
        <BrandPillars />
        <Testimonials />
        <Lifestyle />
        <Newsletter />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
