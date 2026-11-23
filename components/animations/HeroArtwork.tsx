"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HeroArtwork({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let x = 0, y = 0;

    function move(event: PointerEvent) {
      if (!motion.matches || event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        element.style.setProperty("--art-x", `${(x - bounds.left - bounds.width / 2) / bounds.width * 14}px`);
        element.style.setProperty("--art-y", `${(y - bounds.top - bounds.height / 2) / bounds.height * 14}px`);
        element.setAttribute("data-pointer", "");
      });
    }

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      element?.style.removeProperty("--art-x");
      element?.style.removeProperty("--art-y");
      element?.removeAttribute("data-pointer");
    }

    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    motion.addEventListener("change", reset);
    return () => {
      reset();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", reset);
    };
  }, []);

  return <div ref={panel} className="home-art">
    {children}
    <span className="home-art-light" aria-hidden="true" />
  </div>;
}
