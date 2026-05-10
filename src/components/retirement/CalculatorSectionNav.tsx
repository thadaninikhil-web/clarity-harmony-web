import { useEffect, useState } from "react";
import { BookOpen, HelpCircle } from "lucide-react";

const LINKS = [
  { id: "how-to-use", label: "How to use", icon: HelpCircle },
  { id: "how-it-works", label: "How the calculator works", icon: BookOpen },
] as const;

export function CalculatorSectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(
      (e): e is HTMLElement => !!e,
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
      setActive(id);
    }
  };

  return (
    <nav
      aria-label="Calculator section navigation"
      className="sticky top-24 z-30 -mx-4 border-y border-border bg-background/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-md sm:border"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {LINKS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-muted text-foreground border-b-2 border-gold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4 text-accent" aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
