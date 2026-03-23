import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary leading-[1.1] tracking-tight mb-8 text-balance">
              Privacy Policy
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">
              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">Information We Collect</h2>
                <p className="text-justify">
                  We collect personal information that you voluntarily provide to us when you express interest in obtaining information about us or our services, when you participate in activities on our website, or otherwise when you contact us. This may include your name, email address, phone number, and any other information you choose to provide.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">How We Use Your Information</h2>
                <p className="text-justify">
                  We use personal information collected via our website for legitimate business purposes including: to respond to your inquiries and provide you with requested services, to send you administrative information, to comply with legal obligations, and to protect against fraudulent or illegal activity.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">Information Sharing</h2>
                <p className="text-justify">
                  We do not sell, trade, or otherwise transfer your personal information to third parties. Your information may only be shared with trusted service providers who assist us in operating our website and conducting our business, so long as those parties agree to keep this information confidential.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">Data Security</h2>
                <p className="text-justify">
                  We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, no electronic transmission or storage method is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">Your Rights</h2>
                <p className="text-justify">
                  You have the right to access, correct, or delete your personal information at any time. To exercise these rights, please contact us at nikhil@balancingact.co.in.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">Contact Us</h2>
                <p className="text-justify">
                  If you have questions or concerns about this privacy policy, please contact us at nikhil@balancingact.co.in or call +91 99875 22690.
                </p>
              </div>

              <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border">
                Last updated: March 2026
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default PrivacyPolicy;
