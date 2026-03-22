import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FrameworkSection } from "@/components/home/FrameworkSection";
import { SegmentsSection } from "@/components/home/SegmentsSection";
import { FounderSection } from "@/components/home/FounderSection";
import { ClientStoriesSection } from "@/components/home/ClientStoriesSection";
import { InsightsPreview } from "@/components/home/InsightsPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PhilosophySection />
      <ServicesSection />
      <FrameworkSection />
      <SegmentsSection />
      <FounderSection />
      <ClientStoriesSection />
      <InsightsPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
