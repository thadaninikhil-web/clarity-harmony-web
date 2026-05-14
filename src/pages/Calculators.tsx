import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BetaBanner } from "@/components/retirement/BetaBanner";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, PiggyBank, LineChart } from "lucide-react";

const calculators = [
  {
    title: "Retirement Calculator",
    description:
      "Project your retirement corpus across one-, two- and three-bucket strategies, with sequence-of-returns stress testing.",
    path: "/calculators/retirementsimulator",
    Icon: PiggyBank,
  },
  {
    title: "Safe Withdrawal Calculator",
    description:
      "Goal-seek the safe year-1 monthly withdrawal that keeps the corpus solvent for any target confidence level.",
    path: "/calculators/safewithdrawalsimulation",
    Icon: LineChart,
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
          </p>
        </div>
      </section>
      <main className="container mx-auto px-6 lg:px-8 py-12">
        <div className="-mx-6 lg:-mx-8 mb-6"><BetaBanner /></div>
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {calculators.map(({ title, description, path, Icon }) => (
            <Card key={path} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-6">
                <Link
                  to={path}
                  className="flex items-start gap-4 text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  aria-label={`${title} — ${description}`}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-lg font-semibold">{title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 mt-1.5" aria-hidden="true" />
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