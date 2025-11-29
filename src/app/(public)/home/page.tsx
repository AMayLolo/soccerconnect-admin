import PublicHeader from "../components/PublicHeader";
import HeroSection from "../components/HeroSection";
import ValueProps from "../components/ValueProps";
import FeaturedClubs from "../components/FeaturedClubs";
import HowItWorks from "../components/HowItWorks";
import ReviewHighlights from "../components/ReviewHighlights";
import PublicFooter from "../components/PublicFooter";

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
