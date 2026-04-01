import { ScrollReveal } from "@/components/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedClientStories } from "@/hooks/useClientStories";
import storyImage from "@/assets/story-planning.jpg";

export const ClientStoriesSection = () => {
  const { data: stories = [], isLoading } = useFeaturedClientStories();

  return (
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
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="border border-gold/20 p-10">
                  <Skeleton className="h-3 w-20 mb-6" />
                  <Skeleton className="h-16 w-full mb-8" />
                  <Skeleton className="h-3 w-20 mb-6" />
                  <Skeleton className="h-16 w-full mb-8" />
                  <Skeleton className="h-3 w-20 mb-6" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            : stories.map((t, i) => (
                <ScrollReveal key={t._id} delay={i * 120}>
                  <div className="border border-gold/20 p-10 h-full flex flex-col group hover:border-gold/40 transition-colors duration-500">
                    <div className="mb-8 flex-1">
                      <p className="label-caps text-gold/50 mb-3 text-left">Situation</p>
                      <p className="text-sm text-muted-foreground">{t.situation}</p>
                    </div>
                    <div className="mb-8 flex-1">
                      <p className="label-caps text-gold/50 mb-3 text-left">Strategy</p>
                      <p className="text-sm text-muted-foreground">{t.strategy}</p>
                    </div>
                    <div className="pt-8 border-t border-gold/15 flex-1">
                      <p className="label-caps text-gold/50 mb-3 text-left">Outcome</p>
                      <p className="text-sm text-foreground font-medium">{t.outcome}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
        </div>
        <ScrollReveal delay={400}>
          <div className="mt-10 space-y-4">
            <p className="text-xs text-muted-foreground/60 text-center">
              These case studies reflect specific client situations. Financial decisions and outcomes may differ based on individual circumstances and market conditions.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
