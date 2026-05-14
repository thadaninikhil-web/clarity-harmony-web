import { Link } from "react-router-dom";

type Active = "one" | "two" | "three" | "compare";
type Mode = "retirement" | "swr";

const base =
  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary";
const inactive =
  "text-primary-foreground/80 hover:bg-primary-foreground/10";
const active = "bg-gold text-primary";

const ROUTES: Record<Mode, Record<Active, string>> = {
  retirement: {
    one: "/calculators/retirementsimulator/onebucket",
    two: "/calculators/retirementsimulator/twobucket",
    three: "/calculators/retirementsimulator/threebucket",
    compare: "/calculators/retirementsimulator/compare",
  },
  swr: {
    one: "/calculators/safewithdrawalsimulation/onebucket",
    two: "/calculators/safewithdrawalsimulation/twobucket",
    three: "/calculators/safewithdrawalsimulation/threebucket",
    compare: "/calculators/safewithdrawalsimulation/compare",
  },
};

const TABS: Array<{ id: Active; label: string }> = [
  { id: "one", label: "One-Bucket" },
  { id: "two", label: "Two-Bucket" },
  { id: "three", label: "Three-Bucket" },
  { id: "compare", label: "Compare" },
];

export function StrategySwitcher({
  activeTab,
  mode = "retirement",
}: {
  activeTab: Active;
  mode?: Mode;
}) {
  const routes = ROUTES[mode];
  return (
    <div
      role="tablist"
      aria-label="Calculator scenario"
      className="mt-6 inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 p-1"
    >
      {TABS.map(({ id, label }) =>
        activeTab === id ? (
          <span
            key={id}
            role="tab"
            aria-selected="true"
            className={`${base} ${active}`}
          >
            {label}
          </span>
        ) : (
          <Link
            key={id}
            role="tab"
            aria-selected="false"
            to={routes[id]}
            className={`${base} ${inactive}`}
          >
            {label}
          </Link>
        ),
      )}
    </div>
  );
}