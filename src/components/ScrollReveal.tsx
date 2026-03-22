import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
}

const getTransform = (direction: Direction, distance: number, isVisible: boolean) => {
  if (isVisible) return "translate3d(0,0,0)";
  switch (direction) {
    case "up": return `translate3d(0,${distance}px,0)`;
    case "down": return `translate3d(0,-${distance}px,0)`;
    case "left": return `translate3d(${distance}px,0,0)`;
    case "right": return `translate3d(-${distance}px,0,0)`;
    case "none": return "translate3d(0,0,0)";
  }
};

export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 700,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(direction, distance, isVisible),
        filter: isVisible ? "blur(0)" : "blur(3px)",
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
};
