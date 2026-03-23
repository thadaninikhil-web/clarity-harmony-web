import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Linkedin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent. We'll respond within 24 hours.");
    setForm({ name: "", email: "", message: "" });
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
                  <a href="mailto:nikhil@balancingact.co.in" className="flex items-center gap-4 text-foreground hover:text-gold transition-colors group">
                    <Mail className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>nikhil@balancingact.co.in</span>
                  </a>
                  <a href="tel:+919987522690" className="flex items-center gap-4 text-foreground hover:text-gold transition-colors">
                    <Phone className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>+91 99875 22690</span>
                  </a>
                  <a href="https://wa.me/919987522690" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-gold transition-colors">
                    <MessageCircle className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    <span>WhatsApp</span>
                  </a>
                  <a href="https://www.linkedin.com/in/thadaninikhil" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-gold transition-colors">
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
                  <label className="label-caps text-muted-foreground mb-2 block">Message</label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="bg-background border-border resize-none" />
                </div>
                <Button variant="hero" size="lg" type="submit" className="w-full">
                  Send Message
                </Button>
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
