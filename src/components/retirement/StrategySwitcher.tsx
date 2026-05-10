import { Link } from "react-router-dom";

type Active = "one" | "two" | "three" | "compare";

const base =
  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
const inactive =
  "text-primary-foreground/80 hover:bg-primary-foreground/10";
const active = "bg-gold text-primary";

export function StrategySwitcher({ activeTab }: { activeTab: Active }) {
  return (
    <div className="mt-6 inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 p-1">
      {activeTab === "one" ? (
        <span className={`${base} ${active}`}>One-Bucket</span>
      ) : (
        <Link to="/calculators/onebucket" className={`${base} ${inactive}`}>
          One-Bucket
        </Link>
      )}
      {activeTab === "three" ? (
        <span className={`${base} ${active}`}>Three-Bucket</span>
      ) : (
        <Link to="/calculators/retirementsimulator" className={`${base} ${inactive}`}>
          Three-Bucket
        </Link>
      )}
      {activeTab === "two" ? (
        <span className={`${base} ${active}`}>Two-Bucket</span>
      ) : (
        <Link to="/calculators/twobucket" className={`${base} ${inactive}`}>
          Two-Bucket
        </Link>
      )}
      {activeTab === "compare" ? (
        <span className={`${base} ${active}`}>Compare</span>
      ) : (
        <Link to="/calculators/compare" className={`${base} ${inactive}`}>
          Compare
        </Link>
      )}
    </div>
  );
}