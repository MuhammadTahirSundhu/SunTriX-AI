import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  { name: "Agentic AI & Automation", desc: "Autonomous agents & workflow automation", href: "/services/agentic-ai" },
  { name: "AI & Machine Learning", desc: "Predictive analytics & custom models", href: "/services/ai-ml" },
  { name: "Computer Vision", desc: "Object detection & image analysis", href: "/services/computer-vision" },
  { name: "AI Product / SaaS", desc: "End-to-end platform development", href: "/services/saas-platform" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="gradient-bg h-9 w-9 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-extrabold text-sm">S</span>
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            Sun<span className="text-primary">Tri</span>X
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          
          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services <ChevronDown className={`h-3 w-3 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] rounded-xl border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl"
                >
                  {services.map((s) => (
                    <Link
                      key={s.name}
                      to={s.href}
                      className="flex flex-col rounded-lg p-3 hover:bg-primary/5 transition-colors group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </Link>
                  ))}
                  <div className="mt-2 border-t border-border pt-2">
                    <Link to="/request-task" className="flex items-center gap-2 rounded-lg p-3 text-sm text-primary hover:bg-primary/5 transition-colors">
                      Not sure? Request a Custom Task <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/how-we-work" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Work</Link>
          <Link to="/work" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Book a Call
          </Link>
          <Link to="/request-task" className="gradient-bg rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all hover:shadow-[0_0_20px_hsl(24_100%_50%/0.25)]">
            Request a Task
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              <Link to="/" className="rounded-lg px-4 py-3 text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Home</Link>
              {services.map(s => (
                <Link key={s.name} to={s.href} className="rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>{s.name}</Link>
              ))}
              <Link to="/how-we-work" className="rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>How We Work</Link>
              <Link to="/work" className="rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Portfolio</Link>
              <Link to="/about" className="rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>About</Link>
              <Link to="/contact" className="rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Contact</Link>
              <Link to="/request-task" className="gradient-bg mt-2 rounded-lg px-4 py-3 text-center font-semibold text-primary-foreground" onClick={() => setMobileOpen(false)}>Request a Task</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
