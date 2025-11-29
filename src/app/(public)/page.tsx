import HeroSection from "./components/HeroSection";
import ValueProps from "./components/ValueProps";
import FeaturedClubs from "./components/FeaturedClubs";
import ReviewHighlights from "./components/ReviewHighlights";

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
