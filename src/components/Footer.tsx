import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="gradient-bg h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-extrabold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-foreground">SunTriX</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-first technology partner for enterprises building intelligent systems at scale.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/services/agentic-ai" className="hover:text-primary transition-colors">Agentic AI</Link></li>
              <li><Link to="/services/ai-ml" className="hover:text-primary transition-colors">AI & ML</Link></li>
              <li><Link to="/services/computer-vision" className="hover:text-primary transition-colors">Computer Vision</Link></li>
              <li><Link to="/services/saas-platform" className="hover:text-primary transition-colors">AI Product / SaaS</Link></li>
              <li><Link to="/technologies" className="hover:text-primary transition-colors">Technologies</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/how-we-work" className="hover:text-primary transition-colors">How We Work</Link></li>
              <li><Link to="/work" className="hover:text-primary transition-colors">Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SunTriX. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
