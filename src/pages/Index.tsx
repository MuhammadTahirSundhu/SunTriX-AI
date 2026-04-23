import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import DepartmentsSection from "@/components/DepartmentsSection";
import AgencyIntroVideo from "@/components/AgencyIntroVideo";
import VideoDemoSection from "@/components/VideoDemoSection";
import HowWeWorkSection from "@/components/HowWeWorkSection";
import TechStackSection from "@/components/TechStackSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SocialBranding from "@/components/SocialBranding";
import CTASection from "@/components/CTASection";
import PageTransition from "@/components/PageTransition";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "SunTriX AI Solutions — Enterprise AI Agency",
    description: "SunTriX is an AI-first technology partner helping enterprises design, build, and scale intelligent systems.",
    canonicalUrl: "https://www.suntrix.ai/",
  });

  return (
    <Layout>
      <PageTransition>
        <HeroSection />
        <SocialProofBar />
        <DepartmentsSection />
        <AgencyIntroVideo />
        <HowWeWorkSection />
        <TechStackSection />
        <TestimonialsSection />
        <SocialBranding />
        <VideoDemoSection />
        <CTASection />
      </PageTransition>
    </Layout>
  );
};

export default Index;
