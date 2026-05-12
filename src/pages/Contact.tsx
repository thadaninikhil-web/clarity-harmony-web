import { useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Linkedin, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/config/site";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(254, "Email is too long"),
  phone: z.string().trim().max(20, "Phone must be under 20 characters").optional().or(z.literal("")),
  city: z.string().trim().max(100, "City must be under 100 characters").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message must be under 1000 characters").optional().or(z.literal("")),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    const safe = parsed.data;
    setSending(true);

    if (SITE_CONFIG.web3formsKey) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: SITE_CONFIG.web3formsKey,
            subject: `Contact from ${safe.name}`,
            from_name: safe.name,
            email: safe.email,
            phone: safe.phone ?? "",
            city: safe.city ?? "",
            message: safe.message ?? "",
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Message sent! We'll respond within 24 hours.");
          setForm({ name: "", email: "", phone: "", city: "", message: "" });
        } else {
          throw new Error("Submission failed");
        }
      } catch (err) {
        console.error("Contact form submission failed", err);
        toast.error("Something went wrong. Please try again or email us directly.");
      }
    } else {
      const subject = encodeURIComponent(`Contact from ${safe.name}`);
      const body = encodeURIComponent(
        `Name: ${safe.name}\nEmail: ${safe.email}\nPhone: ${safe.phone ?? ""}\nCity/Country: ${safe.city ?? ""}\n\nMessage:\n${safe.message ?? ""}`
      );
      window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
      toast.success("Opening your email client. We'll respond within 24 hours.");
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
                <p className="label-caps text-gold mb-4">Reach Out</p>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary leading-[1.1] tracking-tight mb-8 text-balance">
                  Contact
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="space-y-6">
                  <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="flex items-center gap-4 text-foreground hover:text-gold transition-colors group">
                    <Mail className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>{SITE_CONFIG.contactEmail}</span>
                  </a>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="flex items-center gap-4 text-foreground hover:text-gold transition-colors">
                    <Phone className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>{SITE_CONFIG.phoneDisplay}</span>
                  </a>
                  <a href={SITE_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-gold transition-colors">
                    <MessageCircle className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>WhatsApp</span>
                  </a>
                  <a href={SITE_CONFIG.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-gold transition-colors">
                    <Linkedin className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>linkedin.com/in/thadaninikhil</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={200}>
              <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">Name</label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border" />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">Email</label>
                  <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-border" />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">Phone</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">City or Country</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background border-border" />
                </div>
                <div>
                  <label className="label-caps text-muted-foreground mb-2 block">What would you like help with?</label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="bg-background border-border resize-none" />
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

export default Contact;
