import { AlertTriangle } from "lucide-react";
import type { ValidationIssue } from "@/lib/retirement";
import { Button } from "@/components/ui/button";

interface Props {
  issues: ValidationIssue[];
}

/** Inline banner shown above results when validateInputs() returns errors.
 *  Each issue is clickable — clicking scrolls to and pulses the matching
 *  input (data-field="<name>") so the user can fix it without hunting. */
export function ValidationBanner({ issues }: Props) {
  if (issues.length === 0) return null;
  const focusField = (field: string) => {
    if (typeof document === "undefined") return;
    const el = document.querySelector<HTMLElement>(`[data-field='${field}']`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-destructive", "ring-offset-2");
    setTimeout(() => {
      el.classList.remove("ring-2", "ring-destructive", "ring-offset-2");
    }, 2500);
    if ("focus" in el) (el as HTMLInputElement).focus?.();
  };
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-2">
      <div className="flex items-center gap-2 text-destructive font-medium">
        <AlertTriangle className="size-4" />
        Please fix {issues.length} input issue{issues.length === 1 ? "" : "s"} before we can run the projection.
      </div>
      <ul className="space-y-1.5 text-sm">
        {issues.map((iss, i) => (
          <li key={i} className="flex flex-wrap items-start gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => focusField(iss.field)}
            >
              Highlight {iss.field}
            </Button>
            <span className="text-foreground">{iss.message}</span>
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">
              Rule: {iss.rule}
            </code>
          </li>
        ))}
      </ul>
    </div>
  );
}
