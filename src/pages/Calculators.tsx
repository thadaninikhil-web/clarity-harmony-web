import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const calculators = [
  {
    title: "Three-Bucket Retirement Simulator",
    description:
      "Plan your retirement with the accumulation, preparation and withdrawal bucket framework, including Monte Carlo sequence-of-returns stress testing.",
    path: "/calculators/retirementsimulator",
    cta: "Open simulator",
  },
  {
    title: "Safe Withdrawal Rate Simulator",
    description:
      "Stress-test how long your retirement corpus lasts at a given monthly withdrawal — and goal-seek the safe withdrawal amount for a target confidence level.",
    path: "/calculators/safewithdrawalsimulation",
    cta: "Open simulator",
  },
];

const Calculators = () => {
  useEffect(() => {
    document.title = "Calculators | Balancing Act";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="label-caps text-gold mb-3">Tools</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Calculators
          </h1>
          <p className="max-w-2xl mx-auto text-base text-primary-foreground/80">
            Educational tools to model retirement, withdrawals and stress scenarios.
            More calculators are added over time.
          </p>
        </div>
      </section>
      <main className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {calculators.map((c) => (
            <Card key={c.path} className="shadow-[var(--shadow-card)] flex flex-col">
              <CardHeader>
                <CardTitle className="font-display text-xl">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  {c.description}
                </p>
                <Link
                  to={c.path}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-gold transition-colors"
                >
                  {c.cta} <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-12">
          Educational calculators — not investment advice.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Calculators;