import { Link } from "react-router-dom";


export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Motto */}
      <div className="border-b border-gold/15">
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
                { label: "Privacy Policy", path: "/privacy-policy" },
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
                href="https://wa.me/919987522690"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                WhatsApp
              </a>
              <a
                href="https://www.linkedin.com/in/thadaninikhil"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://my-planner.in/login"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                Client Login
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/15 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display text-lg text-primary-foreground/80">Balancing Act</span>
          <p className="text-xs text-primary-foreground/40">
            &copy; {new Date().getFullYear()} Balancing Act. All rights reserved.
          </p>
        </div>

        {/* SEBI Registration & Compliance */}
        <div className="mt-6 pt-6 border-t border-gold/15">
          <p className="text-xs text-primary-foreground/60 leading-relaxed text-center max-w-4xl mx-auto">
            AMFI Registered Mutual Fund Distributor | ARN-346988 | Date of Initial Registration: 23-Nov-2025 | Current Validity: 25-Nov-2026
          </p>
          <p className="text-xs text-primary-foreground/55 leading-relaxed text-center max-w-4xl mx-auto mt-3">
            Disclaimer: Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not indicative of future results. The information provided on this website is for general informational purposes only and should not be construed as investment advice. Please consult your advisor before making any investment decisions.
          </p>
          <p className="text-xs text-primary-foreground/55 text-center mt-3">
            <Link to="/privacy-policy" className="hover:text-gold transition-colors underline">Privacy Policy</Link>
            {" · "}
            <span>Terms & Conditions apply</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
