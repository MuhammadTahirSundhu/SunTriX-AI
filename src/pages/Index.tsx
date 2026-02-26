import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import DepartmentsSection from "@/components/DepartmentsSection";
import HowWeWorkSection from "@/components/HowWeWorkSection";
import TechStackSection from "@/components/TechStackSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  return (
    <Layout>
      <PageTransition>
        <HeroSection />
        <SocialProofBar />
        <DepartmentsSection />
        <HowWeWorkSection />
        <TechStackSection />
        <TestimonialsSection />
        <CTASection />
      </PageTransition>
    </Layout>
  );
};

export default Index;
