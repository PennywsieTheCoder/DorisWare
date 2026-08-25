import Hero from "../components/Hero";
import FeaturedProducts from "../components/Featuredproducts";
import PromoBanner from "../components/Promobanner";
import WhyChooseUs from "../components/Whychooseus";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Faq";
import Newsletter from "../components/Newsletter";

export default function HomePage() {
  return (
    <div className="bg-stone-50/50 dark:bg-stone-950 transition-colors duration-200">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products */}
      <FeaturedProducts limit={6} />

      {/* Promo / Sale Banner with Countdown */}
      <PromoBanner />

      {/* Why Choose Us Perks */}
      <WhyChooseUs />

      {/* Collapsible FAQ Section */}
      <FAQ />

      {/* Customer Reviews Grid */}
      <Testimonials />

      {/* Newsletter Signup Box */}
      <Newsletter />
    </div>
  );
}
