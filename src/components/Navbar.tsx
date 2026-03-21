import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Our Process", path: "/process" },
  { label: "Who We Work With", path: "/who-we-work-with" },
  { label: "About Nikhil", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Insights", path: "/insights" },
  { label: "Client Stories", path: "/client-stories" },
  { label: "Contact", path: "/contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-6 lg:px-8">
        <Link to="/" className="font-display text-xl font-semibold text-primary tracking-tight">
          Balancing Act
        </Link>

        {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 text-xs font-body font-medium tracking-wide uppercase transition-colors duration-200 ${
                location.pathname === link.path
                  ? "text-gold"
                  : "text-primary/70 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden xl:block">
          <Button variant="hero" size="default" asChild>
            <Link to="/book">Book a Call</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="xl:hidden p-2 text-primary"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-cream/98 backdrop-blur-md border-t border-border">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-3 text-sm font-body font-medium tracking-wide uppercase border-b border-border/50 ${
                  location.pathname === link.path
                    ? "text-gold"
                    : "text-primary/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="hero" size="lg" className="mt-4" asChild>
              <Link to="/book">Book a Discovery Call</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
