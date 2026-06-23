import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "../lib/use-iso-layout-effect";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger this element relative to siblings revealing together. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
};

// Single-element scroll reveal. Sets the hidden state before paint
// (useLayoutEffect) so there is no flash, and degrades to fully visible under
// reduced motion or if JS never runs.
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
