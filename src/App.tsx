import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServicesOverview from "./pages/ServicesOverview";
import AgenticAI from "./pages/services/AgenticAI";
import AIML from "./pages/services/AIML";
import ComputerVision from "./pages/services/ComputerVision";
import SaaSPlatform from "./pages/services/SaaSPlatform";
import HowWeWork from "./pages/HowWeWork";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RequestTask from "./pages/RequestTask";
import Technologies from "./pages/Technologies";
import Partnership from "./pages/Partnership";
import Testimonials from "./pages/Testimonials";
import { PrivacyPolicy, TermsOfService, CookiePolicy } from "./pages/Legal";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminContent from "./pages/admin/AdminContent";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminMedia from "./pages/admin/AdminMedia";
import { DynamicFavicon } from "@/components/DynamicFavicon";

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
        <Route path="/work/:slug" element={<PortfolioDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request-task" element={<RequestTask />} />
        <Route path="/technologies" element={<Technologies />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/cookies" element={<CookiePolicy />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DynamicFavicon />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  </ThemeProvider>
);

export default App;
