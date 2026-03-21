import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Motto */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-8 py-16 text-center">
          <p className="font-display text-3xl md:text-5xl text-gold tracking-tight">
            Clarity &bull; Stability &bull; Prosperity
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="label-caps text-gold mb-4">Navigate</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", path: "/" },
                { label: "Our Process", path: "/process" },
                { label: "Services", path: "/services" },
                { label: "About Nikhil", path: "/about" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm text-primary-foreground/60 hover:text-gold transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="label-caps text-gold mb-4">Resources</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Client Stories", path: "/client-stories" },
                { label: "Insights", path: "/insights" },
                { label: "Who We Work With", path: "/who-we-work-with" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm text-primary-foreground/60 hover:text-gold transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="label-caps text-gold mb-4">Connect</p>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/60">
              <a href="mailto:nikhil@balancingact.co.in" className="hover:text-gold transition-colors">
                nikhil@balancingact.co.in
              </a>
              <a href="tel:+919987522690" className="hover:text-gold transition-colors">
                +91 99875 22690
              </a>
              <a
                href="https://linkedin.com/in/thadaninikhil"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-display text-lg text-primary-foreground/80">Balancing Act</p>
          <p className="text-xs text-primary-foreground/40">
            &copy; {new Date().getFullYear()} Balancing Act Financial Advisory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
