import { Component, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Called when the user clicks "Try again" — the parent should clear any
   *  transient state (chart cache, MC results) before re-rendering. */
  onRetry?: () => void;
}

interface State {
  error: Error | null;
  attempts: number;
}

/** Heuristically infer which input field most likely caused the error so we
 *  can give a friendlier hint than just dumping a stack trace. */
function guessCulprit(message: string): { field: string; selector: string; rule: string; hint: string } | null {
  const m = message.toLowerCase();
  if (m.includes("nan") || m.includes("infinity")) {
    return {
      field: "Numeric input",
      selector: "input[type='number'], input[inputmode='numeric']",
      rule: "Value must be a finite number (got NaN or Infinity).",
      hint: "One of the rate or amount fields is blank or non-numeric. Try clearing it and re-entering a value.",
    };
  }
  if (m.includes("life") || m.includes("retirement age")) {
    return {
      field: "Retirement age / life expectancy",
      selector: "[data-field='lifeExpectancyAge']",
      rule: "lifeExpectancyAge must be > retirementAge.",
      hint: "Make sure life expectancy is greater than retirement age.",
    };
  }
  if (m.includes("emergency")) {
    return {
      field: "Emergency fund (months)",
      selector: "#ef-mo",
      rule: "emergencyFundMonths must be an integer ≥ 0.",
      hint: "Months should be a non-negative whole number.",
    };
  }
  if (m.includes("sequence") || m.includes("min") || m.includes("max") || m.includes("cagr")) {
    return {
      field: "Sequence-of-returns (min / max / CAGR)",
      selector: "[data-field='sequenceCagr'], input[type='range']",
      rule: "sequenceMinReturn ≤ sequenceCagr ≤ sequenceMaxReturn.",
      hint: "Min must be ≤ Max, and CAGR should sit between them.",
    };
  }
  if (m.includes("dob") || m.includes("date") || m.includes("year")) {
    return {
      field: "Date of birth",
      selector: "[data-field='dob']",
      rule: "dob year must be between 1900 and the current year.",
      hint: "Use a valid past date in YYYY-MM-DD format.",
    };
  }
  return null;
}

export class InputsErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempts: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("InputsForm error boundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  retry = () => {
    this.props.onRetry?.();
    this.setState((s) => ({ error: null, attempts: s.attempts + 1 }));
  };

  render() {
    if (this.state.error) {
      const culprit = guessCulprit(this.state.error.message);
      return (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Something went wrong with your inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              We hit a hiccup while recalculating. Your saved data is still safe.
            </p>
            {culprit && (
              <div className="rounded-md border border-accent/40 bg-accent/10 p-3 space-y-2">
                <div className="font-medium">Likely culprit: {culprit.field}</div>
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Failing rule: </span>
                  <code className="rounded bg-muted px-1 py-0.5">{culprit.rule}</code>
                </div>
                <div className="text-xs text-muted-foreground">{culprit.hint}</div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const el = document.querySelector<HTMLElement>(culprit.selector);
                    if (!el) return;
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.classList.add("ring-2", "ring-destructive", "ring-offset-2");
                    setTimeout(() => {
                      el.classList.remove("ring-2", "ring-destructive", "ring-offset-2");
                    }, 2500);
                    if ("focus" in el) (el as HTMLInputElement).focus?.();
                  }}
                >
                  Highlight the field
                </Button>
              </div>
            )}
            <details className="rounded bg-muted p-2 text-xs">
              <summary className="cursor-pointer text-muted-foreground">Technical details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
            </details>
            <div className="flex gap-2">
              <Button size="sm" onClick={this.retry} className="gap-2">
                <RotateCcw className="size-4" />
                Try again
              </Button>
              <Button size="sm" variant="outline" onClick={this.reset}>
                Reset panel
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
