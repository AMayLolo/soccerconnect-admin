import FeaturedClubs from "@/app/(public)/components/FeaturedClubs";
import HeroSection from "@/app/(public)/components/HeroSection";
import HowItWorks from "@/app/(public)/components/HowItWorks";
import PublicFooter from "@/app/(public)/components/PublicFooter";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import ReviewHighlights from "@/app/(public)/components/ReviewHighlights";
import ValueProps from "@/app/(public)/components/ValueProps";

export default async function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <PublicHeader />

      <div className="flex-1 space-y-24">
        <HeroSection />
        <ValueProps />
        <FeaturedClubs />
        <HowItWorks />
        <ReviewHighlights />
      </div>

      <PublicFooter />
    </main>
  );
}
