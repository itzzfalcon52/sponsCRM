import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import CTASection from "@/components/landing/CTASection";


export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFA] selection:bg-indigo-500/30 selection:text-indigo-900">
      
      {/* Subtle Black Grid Lines Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-0 left-1/2 z-0 flex w-full -translate-x-1/2 justify-center pointer-events-none">
        <div className="h-[600px] w-full max-w-[1200px] bg-gradient-to-b from-indigo-500/20 via-purple-500/5 to-transparent blur-3xl rounded-full mix-blend-multiply"></div>
      </div>

      <HeroSection navigate={navigate} />
      <FeaturesSection />
      <ComparisonSection />
      <CTASection navigate={navigate} />
      
      
    </div>
  );
}