import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import AnnouncementBar from "@/components/AnnouncementBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnnouncementBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Layout;
