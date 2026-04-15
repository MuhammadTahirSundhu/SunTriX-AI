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

const Index = () => {
  return (
    <Layout>
      <PageTransition>
        <HeroSection />
        <SocialProofBar />
        <DepartmentsSection />
        <AgencyIntroVideo />
        <VideoDemoSection />
        <HowWeWorkSection />
        <TechStackSection />
        <TestimonialsSection />
        <SocialBranding />
        <CTASection />
      </PageTransition>
    </Layout>
  );
};

export default Index;
