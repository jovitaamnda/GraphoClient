"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LandingHero from "@/components/landing/LandingHero";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/user/dashboard");
    }
  }, [user, loading, router]);

  // Tampilkan landing page untuk tamu
  if (loading) return null;
  if (user) return null; // sedang redirect

  return (
    <main className="min-h-screen bg-[#FFF8F4] text-[#221A13] pt-32">
      <LandingHero />
      <LandingFooter />
    </main>
  );
}
