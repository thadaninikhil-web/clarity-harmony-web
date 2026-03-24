import { ScrollReveal } from "@/components/ScrollReveal";
import { MutualFundDisclaimer } from "@/components/MutualFundDisclaimer";
import storyImage from "@/assets/story-planning.jpg";

const testimonials = [
  {
    situation: "An NRI based out of Singapore with assets across India, Singapore and USA. Assets were mostly in savings account or low yielding deposits with certain investments in US stocks and ETFs",
    strategy: "Discovered financial goals, allocated assets and recommended rebalancing across all three geographies to match goal tenors and risk profile. Also identified Ireland domiciled UCITS to replace US ETFs for better tax efficiency",
    outcome: "Achieved clarity on all goals, initiated rebalancing over 18 to 24 months in a tax efficient manner. Each goal now has assets and future investments aligned to them.",
  },
  {
    situation: "Singapore domiciled NRI planning to start a family soon who was investing mostly based on advice from friends or family ",
    strategy: "Comprehensive plan distributing incremental investments across India and Global Equities with execution in a systematic manner. Each investment serves a specific purpose in life.",
    outcome: "Automated investments across geographies on track to meet goals ranging from education to retirement to starting up in the long run",
  },
  {
    situation: "A senior corporate professional based in Mumbai had investments primarily in real estate, low yielding endowment / money back policies, and certain Mutual Funds through SIPs",
    strategy: "Created a complete financial plan allocating assets to goals. Realigned equity mutual funds investments into core (stable) and satellite (high return high risk) as per time remaining to goal.",
    outcome: "Outcome based investing aligned to goals rather than different assets bought at different points of time in the quest for returns",
  },
];

export const ClientStoriesSection = () => (
  <section className="py-28 md:py-40 overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      {/* Visual storytelling banner */}
      <ScrollReveal>
        <div className="relative mb-20 overflow-hidden">
          <img
            src={storyImage}
            alt="Financial planning consultation"
            className="w-full h-64 md:h-80 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="label-caps text-accent tracking-[0.15em] mb-4">Results That Matter</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-accent text-balance">
                Client Stories
              </h2>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <ScrollReveal key={i} delay={i * 120}>
            <div className="border border-border p-10 h-full flex flex-col group hover:border-accent/20 transition-colors duration-500">
              <div className="mb-8 flex-1">
                <p className="label-caps text-accent/50 mb-3">Situation</p>
                <p className="text-sm text-muted-foreground text-justify">{t.situation}</p>
              </div>
              <div className="mb-8 flex-1">
                <p className="label-caps text-accent/50 mb-3">Strategy</p>
                <p className="text-sm text-muted-foreground text-justify">{t.strategy}</p>
              </div>
              <div className="pt-8 border-t border-border flex-1">
                <p className="label-caps text-accent/50 mb-3">Outcome</p>
                <p className="text-sm text-foreground font-medium text-justify">{t.outcome}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={400}>
        <div className="mt-10 space-y-4">
          <p className="text-xs text-muted-foreground/60 text-center">
            The above are illustrative case studies. Individual results may vary based on personal circumstances and market conditions.
          </p>
          <MutualFundDisclaimer variant="compact" />
        </div>
      </ScrollReveal>
    </div>
  </section>
);
