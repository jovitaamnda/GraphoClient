"use client";

import LandingHero from "@/components/landing/LandingHero";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8F4] text-[#221A13] pt-32">
      <LandingHero />
      <LandingFooter />
    </main>
  );
}
