"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useMediaQuery } from "@/lib/use-media-query";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let animFrame: number;
    function raf(time: number) {
      lenis.raf(time);
      animFrame = requestAnimationFrame(raf);
    }

    animFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animFrame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
