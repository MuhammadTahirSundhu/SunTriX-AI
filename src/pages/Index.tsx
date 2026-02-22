import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import DepartmentsSection from "@/components/DepartmentsSection";
import HowWeWorkSection from "@/components/HowWeWorkSection";
import TechStackSection from "@/components/TechStackSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <SocialProofBar />
      <DepartmentsSection />
      <HowWeWorkSection />
      <TechStackSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
