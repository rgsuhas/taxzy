import Navbar from "./_components/landing/Navbar";
import Hero from "./_components/landing/Hero";
import SocialProof from "./_components/landing/SocialProof";
import ProblemSolution from "./_components/landing/ProblemSolution";
import HowItWorks from "./_components/landing/HowItWorks";
import Features from "./_components/landing/Features";
import OpenSource from "./_components/landing/OpenSource";
import Pricing from "./_components/landing/Pricing";
import Testimonials from "./_components/landing/Testimonials";
import FAQ from "./_components/landing/FAQ";
import FinalCTA from "./_components/landing/FinalCTA";
import Footer from "./_components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="font-sans" style={{ background: "#F3F2EF" }}>
      <Navbar />
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <OpenSource />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
