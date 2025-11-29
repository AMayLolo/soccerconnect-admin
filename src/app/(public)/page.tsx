import FeaturedClubs from "./components/FeaturedClubs";
import HeroSection from "./components/HeroSection";
import ReviewHighlights from "./components/ReviewHighlights";
import ValueProps from "./components/ValueProps";

export default function HomePage() {
  return (
    <div className="space-y-24">
      <HeroSection />
      <ValueProps />
      <FeaturedClubs />
      <ReviewHighlights />
    </div>
  );
}
