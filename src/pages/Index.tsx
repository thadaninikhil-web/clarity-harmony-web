import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-abstract.jpg";
import {
  Target, PieChart, Globe, Shield, Calculator, Users, BarChart3,
  Compass, Search, LineChart, FileText, ArrowRight, Briefcase, Heart
} from "lucide-react";

const services = [
  { icon: Target, title: "Goal Based Financial Planning", desc: "Align your investments with your life's most meaningful milestones." },
  { icon: PieChart, title: "Portfolio Review & Asset Allocation", desc: "Evaluate and restructure your portfolio for optimal risk-adjusted returns." },
  { icon: Globe, title: "Global Investing Guidance", desc: "Access international markets with a disciplined, diversified approach." },
  { icon: Shield, title: "Insurance Planning", desc: "Ensure adequate protection without over-insuring or under-insuring." },
  { icon: Calculator, title: "Tax Planning", desc: "Minimize tax liability through strategic, compliant planning." },
  { icon: Users, title: "Succession & Estate Planning", desc: "Preserve and transfer wealth across generations with clarity." },
  { icon: BarChart3, title: "Ongoing Financial Life Management", desc: "Continuous guidance as your life, markets, and goals evolve." },
];

const steps = [
  { num: "01", title: "Discover Your Goals", desc: "We listen deeply to understand what matters most to you." },
  { num: "02", title: "Assess Your Financial Position", desc: "A comprehensive review of your current financial landscape." },
  { num: "03", title: "Portfolio & Risk Analysis", desc: "Understanding your risk capacity and current asset allocation." },
  { num: "04", title: "Personalized Financial Strategy", desc: "A tailored plan built around your unique circumstances." },
  { num: "05", title: "Execution Support", desc: "Hands-on guidance to implement the strategy with discipline." },
  { num: "06", title: "Ongoing Monitoring & Guidance", desc: "Regular reviews and adjustments as life unfolds." },
];

const segments = [
  { icon: Briefcase, title: "Young Professionals", desc: "Starting their wealth building journey with clarity and confidence." },
  { icon: LineChart, title: "Senior Professionals", desc: "Preparing for financial independence with disciplined planning." },
  { icon: Compass, title: "Business Owners", desc: "Managing complex financial decisions across personal and business life." },
  { icon: Globe, title: "NRIs", desc: "Building globally diversified portfolios while managing cross-border complexity." },
  { icon: Heart, title: "Families", desc: "Planning long-term wealth preservation across generations." },
];

const testimonials = [
  {
    situation: "A senior IT professional in Bengaluru with scattered investments across 15 mutual funds, 3 insurance policies, and no clear retirement plan.",
    strategy: "Consolidated the portfolio, eliminated underperforming funds, and designed a goal-based investment strategy aligned with early retirement at 50.",
    outcome: "Achieved clarity on retirement corpus, reduced portfolio overlap by 70%, and is now on track to retire 5 years earlier than planned.",
  },
  {
    situation: "An NRI couple in Dubai wanting to build a diversified portfolio across India and global markets while planning for their children's education.",
    strategy: "Created a cross-border investment plan balancing Indian equities, global ETFs, and education-specific savings instruments with tax-efficient structures.",
    outcome: "Built a ₹2.5 Cr education fund on track for 2031, with clear visibility into global asset allocation and repatriation planning.",
  },
  {
    situation: "A family business owner with no separation between personal and business finances, and significant concentration risk in a single asset class.",
    strategy: "Separated personal wealth from business assets, introduced systematic diversification, and established a succession plan.",
    outcome: "Personal wealth grew independently of business performance, with a clear estate plan that protects both the family and the enterprise.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <p className="label-caps text-gold mb-4">Clarity &bull; Stability &bull; Prosperity</p>
              </div>
              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-primary leading-[1.1] tracking-tight animate-reveal-up text-balance"
                style={{ animationDelay: "300ms" }}
              >
                Achieve Balance in Your Financial Life
              </h1>
              <p
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-slide-up"
                style={{ animationDelay: "500ms" }}
              >
                <span className="font-display italic text-primary/80">Human Touch in the Age of AI.</span>
              </p>
              <p
                className="text-base text-muted-foreground max-w-lg leading-relaxed animate-slide-up"
                style={{ animationDelay: "600ms" }}
              >
                Balancing Act helps individuals discover their financial goals, understand their financial position, and build disciplined investment strategies that stand the test of time.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "700ms" }}>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/book">Book a Discovery Call</Link>
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <Link to="/process">Explore Our Process</Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5 animate-slide-up" style={{ animationDelay: "800ms" }}>
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Abstract architectural light and shadow"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-primary/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <p className="label-caps text-gold mb-4">Our Philosophy</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight mb-8 text-balance">
                Financial Advice Without Product Bias
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Most financial advice today is driven by product distribution — advisors earn commissions from the products they sell. Balancing Act is fundamentally different. We do not sell financial products. Our only commitment is to your financial well-being.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              "Understanding your life goals with depth and care",
              "Assessing your complete financial position objectively",
              "Designing disciplined investment strategies built for the long term",
              "Supporting you through changing markets and evolving life stages",
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="flex items-start gap-4 p-6 border border-border bg-background">
                  <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                  <p className="text-foreground">{item}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">What We Do</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight mb-16 text-balance">
              Comprehensive Financial Advisory
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {services.map((s, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="bg-background p-8 h-full hover:bg-cream-dark transition-colors duration-300 group">
                  <s.icon className="w-6 h-6 text-gold mb-6 group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold text-primary mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Framework */}
      <section className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">Our Framework</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-gold leading-tight tracking-tight mb-16 text-balance">
              The Balancing Act Financial Framework
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="border border-primary-foreground/10 p-8">
                  <span className="font-display text-4xl font-semibold text-gold/40">{step.num}</span>
                  <h3 className="font-display text-xl font-medium text-gold mt-4 mb-3">{step.title}</h3>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={500}>
            <p className="font-display italic text-xl text-gold/80 text-center mt-16 max-w-2xl mx-auto">
              Financial planning is not a one-time activity. It is a continuous journey.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">Who We Serve</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight mb-16 text-balance">
              Who We Work With
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {segments.map((seg, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-background p-8 h-full">
                  <seg.icon className="w-6 h-6 text-gold mb-6" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold text-primary mb-3">{seg.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{seg.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About Nikhil */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="label-caps text-gold mb-4">The Founder</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight mb-8 text-balance">
                Why I Started Balancing Act
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                With over 22 years of investing experience and having achieved financial independence at the age of 43, I founded Balancing Act with a simple conviction: financial planning should be about life goals, not products.
              </p>
            </ScrollReveal>
            <div className="space-y-4 mb-10">
              {[
                "22+ years of personal investing experience",
                "Achieved financial independence at 43",
                "Commitment to ethical, unbiased advice",
                "Strong discipline around asset allocation",
                "Long-term client partnerships built on trust",
              ].map((point, i) => (
                <ScrollReveal key={i} delay={150 + i * 60}>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-gold shrink-0" />
                    <p className="text-foreground">{point}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={500}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-display text-lg font-semibold text-primary">Nikhil Thadani</p>
                  <p className="text-sm text-muted-foreground">Founder, Balancing Act</p>
                </div>
              </div>
              <Button variant="hero" size="lg" className="mt-8" asChild>
                <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Client Stories */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">Results</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight mb-16 text-balance">
              Client Stories
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="border border-border p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <p className="label-caps text-gold/60 mb-2">Situation</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.situation}</p>
                  </div>
                  <div className="mb-6">
                    <p className="label-caps text-gold/60 mb-2">Strategy</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.strategy}</p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-border">
                    <p className="label-caps text-gold/60 mb-2">Outcome</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{t.outcome}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Preview */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="label-caps text-gold mb-4">Knowledge</p>
                <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight text-balance">
                  Insights
                </h2>
              </div>
              <Link to="/insights" className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-gold transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {[
              { cat: "Investing", title: "Why Asset Allocation Matters More Than Stock Picking", date: "March 2026" },
              { cat: "Behavioral Finance", title: "The Psychology of Selling at the Bottom", date: "February 2026" },
              { cat: "Financial Planning", title: "When Should You Start Planning for Retirement?", date: "January 2026" },
            ].map((article, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-background p-8 h-full hover:bg-cream-dark transition-colors duration-300 group cursor-pointer">
                  <p className="label-caps text-gold/60 mb-4">{article.cat}</p>
                  <h3 className="font-display text-lg font-semibold text-primary mb-4 group-hover:text-gold transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{article.date}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-primary">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-gold leading-tight tracking-tight mb-6 text-balance">
              Start Your Financial Planning Journey
            </h2>
            <p className="text-lg text-primary-foreground/60 mb-10 max-w-lg mx-auto">
              Financial clarity begins with a conversation.
            </p>
            <Button variant="gold" size="xl" asChild>
              <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
