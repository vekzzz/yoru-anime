import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { gsap } from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ref.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ref.current!,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "all" },
      );
    });
    return () => mm.revert();
  }, [path]);

  return <div ref={ref}>{children}</div>;
}
