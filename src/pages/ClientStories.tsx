import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MutualFundDisclaimer } from "@/components/MutualFundDisclaimer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stories = [
  {
    title: "Cross-Border Clarity for an NRI",
    situation: "An NRI based out of Singapore with assets across India, Singapore and USA. Assets were mostly in savings account or low yielding deposits with certain investments in US stocks and ETFs",
    strategy: "Discovered financial goals, allocated assets and recommended rebalancing across all three geographies to match goal tenors and risk profile. Also identified Ireland domiciled UCITS to replace US ETFs for better tax efficiency",
    outcome: "Achieved clarity on all goals, initiated rebalancing over 18 to 24 months in a tax efficient manner. Each goal now has assets and future investments aligned to them.",
  },
  {
    title: "Building a Foundation for the Future",
    situation: "Singapore domiciled NRI planning to start a family soon who was investing mostly based on advice from friends or family ",
    strategy: "Comprehensive plan distributing incremental investments across India and Global Equities with execution in a systematic manner. Each investment serves a specific purpose in life.",
    outcome: "Automated investments across geographies on track to meet goals ranging from education to retirement to starting up in the long run",
  },
  {
    title: "From Product-Led to Goal-Led Investing",
    situation: "A senior corporate professional based in Mumbai had investments primarily in real estate, low yielding endowment / money back policies, and certain Mutual Funds through SIPs",
    strategy: "Created a complete financial plan allocating assets to goals. Realigned equity mutual funds investments into core (stable) and satellite (high return high risk) as per time remaining to goal.",
    outcome: "Outcome based investing aligned to goals rather than different assets bought at different points of time in the quest for returns",
  },
];

const ClientStories = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">Results</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            Client Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed text-justify mb-6">
            Real planning journeys that demonstrate the impact of disciplined, unbiased financial advice. Individual results may vary based on personal circumstances and market conditions.
          </p>
          <MutualFundDisclaimer variant="inline" className="max-w-2xl" />
        </ScrollReveal>
      </div>
    </section>
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8 space-y-16">
        {stories.map((s, i) => (
          <ScrollReveal key={i} delay={i * 100}>
            <div className="border border-border p-8 md:p-12">
              <h2 className="font-display text-2xl font-semibold text-primary mb-8">{s.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col">
                  <p className="label-caps text-gold/60 mb-3">Situation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed text-justify flex-1">{s.situation}</p>
                </div>
                <div className="flex flex-col">
                  <p className="label-caps text-gold/60 mb-3">Strategy</p>
                  <p className="text-sm text-muted-foreground leading-relaxed text-justify flex-1">{s.strategy}</p>
                </div>
                <div className="flex flex-col">
                  <p className="label-caps text-gold/60 mb-3">Outcome</p>
                  <p className="text-sm text-foreground font-medium leading-relaxed text-justify flex-1">{s.outcome}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
        <ScrollReveal delay={300}>
          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground mb-6">Your story begins with a conversation.</p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
    <Footer />
  </div>
);

export default ClientStories;
