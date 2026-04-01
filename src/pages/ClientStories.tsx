import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientStories } from "@/hooks/useClientStories";

const ClientStories = () => {
  const { data: stories = [], isLoading } = useClientStories();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4 text-left">Results</p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
              Client Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
              Real planning journeys that demonstrate the impact of disciplined, unbiased financial thinking. Individual outcomes may vary based on personal circumstances and market conditions.
            </p>
          </ScrollReveal>
        </div>
      </section>
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-6 lg:px-8 space-y-16">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="border border-gold/20 p-8 md:p-12">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((j) => (
                    <div key={j}>
                      <Skeleton className="h-3 w-20 mb-3" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            stories.map((s, i) => (
              <ScrollReveal key={s._id} delay={i * 100}>
                <div className="border border-gold/20 p-8 md:p-12 hover:border-gold/40 transition-colors duration-500">
                  <h2 className="font-display text-2xl font-semibold text-primary mb-8">{s.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <p className="label-caps text-gold/60 mb-3 text-left">Situation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.situation}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="label-caps text-gold/60 mb-3 text-left">Strategy</p>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.strategy}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="label-caps text-gold/60 mb-3 text-left">Outcome</p>
                      <p className="text-sm text-foreground font-medium leading-relaxed flex-1">{s.outcome}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))
          )}
          <ScrollReveal delay={300}>
            <div className="text-center mt-8">
              <p className="text-lg text-muted-foreground mb-6 text-center">Your story begins with a conversation.</p>
              <Button variant="gold" size="xl" asChild>
                <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </ScrollReveal>
          <p className="text-xs text-muted-foreground/60 text-center">
            These case studies reflect specific client situations. Financial decisions and outcomes may differ based on individual circumstances and market conditions.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClientStories;
