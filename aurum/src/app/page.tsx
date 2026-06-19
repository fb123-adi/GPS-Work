import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { Manifesto } from "@/components/sections/Manifesto";
import { SignatureCollections } from "@/components/sections/SignatureCollections";
import { WhyAurum } from "@/components/sections/WhyAurum";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { AtelierShowcase } from "@/components/sections/AtelierShowcase";
import { SocialProof } from "@/components/sections/SocialProof";
import { Lifestyle } from "@/components/sections/Lifestyle";
import { Newsletter } from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <>
      {/* 1 — Cinematic Hero */}
      <Hero />
      <Marquee />
      {/* 2 — Collection Categories */}
      <CategoryShowcase />
      {/* 3 — Brand Manifesto */}
      <Manifesto />
      {/* 4 — Signature Collections */}
      <SignatureCollections />
      {/* 5 — Why AURUM */}
      <WhyAurum />
      {/* 6 — Featured Products */}
      <FeaturedProducts />
      {/* 6b — Interactive 3D Atelier (360° view) */}
      <AtelierShowcase />
      {/* 7 — Social Proof */}
      <SocialProof />
      {/* 8 — AURUM Lifestyle */}
      <Lifestyle />
      {/* 9 — Newsletter */}
      <Newsletter />
      {/* 10 — Footer lives in the root layout */}
    </>
  );
}
