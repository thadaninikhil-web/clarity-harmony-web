import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MutualFundDisclaimerProps {
  variant?: "banner" | "inline" | "compact";
  className?: string;
}

export const MutualFundDisclaimer = ({ variant = "banner", className }: MutualFundDisclaimerProps) => {
  const text = "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Past performance may or may not be sustained in the future.";

  if (variant === "compact") {
    return (
      <p className={cn("text-xs text-muted-foreground/60 text-center", className)}>
        {text}
      </p>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-3 p-4 border border-border bg-card rounded", className)}>
        <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-primary/5 border-y border-border", className)} role="alert" aria-label="Investment risk disclaimer">
      <div className="container mx-auto px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-3">
          <AlertTriangle className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
          <p className="text-xs text-foreground/70 leading-relaxed text-center">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export const EducationalDisclaimer = ({ className }: { className?: string }) => (
  <div className={cn("bg-card border border-border p-4 rounded", className)}>
    <p className="text-xs text-muted-foreground leading-relaxed text-center">
      This content is intended for investor education and awareness. It does not constitute investment advice. Please consult your financial advisor before making any investment decisions.
    </p>
  </div>
);

export const SourceAttribution = ({ source, className }: { source: string; className?: string }) => (
  <p className={cn("text-[10px] text-muted-foreground/50 mt-2", className)}>
    Source: {source}
  </p>
);
