import { AlertTriangle } from "lucide-react";

/**
 * Slim notice rendered at the top of every calculator page to make clear
 * the tool is currently a beta release under active testing.
 */
export function BetaBanner() {
  return (
    <div className="border-b border-amber-300/60 bg-amber-50 text-amber-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 text-xs sm:text-sm">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Beta:</strong> this calculator is
          a beta version under testing. Numbers may change as we refine the
          model — please don&apos;t treat outputs as final advice.
        </span>
      </div>
    </div>
  );
}