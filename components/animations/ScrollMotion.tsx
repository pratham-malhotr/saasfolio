"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window) || !Element.prototype.animate) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(entries => {
      const compact = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
      for (const entry of entries) {
        if (!entry.isIntersecting || !motion.matches) continue;
        const element = entry.target as HTMLElement;
        seen.add(element);
        observer.unobserve(element);
        if (element.contains(document.activeElement)) continue;
        const index = Number(element.dataset.motion || 0);
        const animation = element.animate([
          { opacity: 0.7, translate: `0 ${compact ? 8 : 14}px` },
          { opacity: 1, translate: "0 0" },
        ], {
          duration: compact ? 360 : 500,
          delay: compact ? 0 : Math.min(index, 4) * 38,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "backwards",
        });
        animations.add(animation);
        animation.onfinish = animation.oncancel = () => animations.delete(animation);
      }
    }, { threshold: 0.12 });

    function syncMotion() {
      observer.disconnect();
      if (motion.matches) {
        root?.querySelectorAll("[data-motion]").forEach(element => {
          if (!seen.has(element)) observer.observe(element);
        });
      } else {
        animations.forEach(animation => animation.cancel());
        animations.clear();
      }
    }

    syncMotion();
    motion.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      motion.removeEventListener("change", syncMotion);
    };
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
