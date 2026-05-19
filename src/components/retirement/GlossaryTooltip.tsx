import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  term: string;
  /** Plain-English explanation, ~1–3 sentences. */
  children: React.ReactNode;
  className?: string;
}

/** Inline help icon. Hover or focus to see a beginner-friendly definition of
 *  a finance term used elsewhere in the calculator UI. */
export function GlossaryTooltip({ term, children, className }: Props) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={`What is ${term}?`}
          className={`inline-flex items-center align-middle text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-sm ${className ?? ""}`}
        >
          <Info className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs text-xs leading-relaxed">
          <div className="font-medium mb-1">{term}</div>
          <div className="text-muted-foreground">{children}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
