import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const calculators = [
  {
    title: "Retirement simulator",
    path: "/calculators/retirementsimulator",
  },
  {
    title: "Safe withdrawal simulator",
    path: "/calculators/safewithdrawalsimulation",
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
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {calculators.map((c) => (
            <Card key={c.path} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-6">
                <Link
                  to={c.path}
                  className="flex items-center justify-between gap-4 text-lg font-semibold text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {c.title} <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
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