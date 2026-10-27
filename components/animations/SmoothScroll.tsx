"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { useMediaQuery } from "@/lib/use-media-query";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let lenis: Lenis | undefined;
    let animFrame = 0;
    const raf = (time: number) => {
      lenis?.raf(time);
      animFrame = requestAnimationFrame(raf);
    };
    const visibilityChanged = () => {
      cancelAnimationFrame(animFrame);
      if (!document.hidden) animFrame = requestAnimationFrame(raf);
    };
    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });
      visibilityChanged();
      document.addEventListener("visibilitychange", visibilityChanged);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animFrame);
      document.removeEventListener("visibilitychange", visibilityChanged);
      lenis?.destroy();
    };
  }, [enabled]);

  return <>{children}</>;
}
