import { BookOpen, HelpCircle } from "lucide-react";

export function CalculatorSectionNav() {
  const links = [
    { href: "#how-to-use", label: "How to use", icon: HelpCircle },
    { href: "#how-it-works", label: "How the calculator works", icon: BookOpen },
  ];

  return (
    <nav
      aria-label="Calculator section navigation"
      className="sticky top-24 z-30 -mx-4 border-y border-border bg-background/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-md sm:border"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {links.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Icon className="size-4 text-accent" aria-hidden="true" />
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}