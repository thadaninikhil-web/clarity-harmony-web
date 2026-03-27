import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/config/site";

const Book = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // If Web3Forms key is configured, send directly
    if (SITE_CONFIG.web3formsKey) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: SITE_CONFIG.web3formsKey,
            subject: `Discovery Call Request from ${form.name}`,
            from_name: form.name,
            email: form.email,
            phone: form.phone,
            city: form.city,
            message: form.message,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Request sent! We'll be in touch within 24 hours.");
          setForm({ name: "", email: "", phone: "", city: "", message: "" });
        } else {
          throw new Error("Submission failed");
        }
      } catch {
        toast.error("Something went wrong. Please try again or email us directly.");
      }
    } else {
      // Fallback to mailto
      const subject = encodeURIComponent(`Discovery Call Request from ${form.name}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCity/Country: ${form.city}\n\nWhat they need help with:\n${form.message}`
      );
      window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
      toast.success("Opening your email client. We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", phone: "", city: "", message: "" });
    }

    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24 md:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <ScrollReveal>
                <p className="label-caps text-gold mb-4">Get Started</p>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance">
                  Let's Talk About Your Financial Goals
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                  The discovery call is a free, no-obligation conversation to understand your financial goals and explore whether we're the right fit.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold text-primary">What happens during the call</h2>
                  {[
                    "Understanding your financial goals and priorities",
                    "Reviewing your current financial situation at a high level",
                    "Discussing potential planning strategies",
                    "Determining if the partnership is a good fit for both sides",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gold mt-2.5 shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={200}>
              <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">Name</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">Email</label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">City or Country</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">What would you like help with?</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="bg-background border-border resize-none"
                  />
                </div>
                <Button variant="hero" size="lg" type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending…" : "Book a Discovery Call"}
                </Button>
                <p className="text-xs text-muted-foreground/60 text-center">
                  Free &bull; No obligation &bull; 30 minutes
                </p>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Book;
