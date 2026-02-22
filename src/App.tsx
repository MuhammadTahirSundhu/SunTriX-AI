import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServicesOverview from "./pages/ServicesOverview";
import AgenticAI from "./pages/services/AgenticAI";
import AIML from "./pages/services/AIML";
import ComputerVision from "./pages/services/ComputerVision";
import SaaSPlatform from "./pages/services/SaaSPlatform";
import HowWeWork from "./pages/HowWeWork";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RequestTask from "./pages/RequestTask";
import Technologies from "./pages/Technologies";
import Partnership from "./pages/Partnership";
import Testimonials from "./pages/Testimonials";
import { PrivacyPolicy, TermsOfService, CookiePolicy } from "./pages/Legal";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<ServicesOverview />} />
        <Route path="/services/agentic-ai" element={<AgenticAI />} />
        <Route path="/services/ai-ml" element={<AIML />} />
        <Route path="/services/computer-vision" element={<ComputerVision />} />
        <Route path="/services/saas-platform" element={<SaaSPlatform />} />
        <Route path="/how-we-work" element={<HowWeWork />} />
        <Route path="/work" element={<Portfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request-task" element={<RequestTask />} />
        <Route path="/technologies" element={<Technologies />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/cookies" element={<CookiePolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
