"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  blur?: boolean;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  direction = "up",
  blur = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!element || !media.matches) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const x = direction === "left" ? -22 : direction === "right" ? 22 : 0;
      const y = direction === "up" ? 22 : direction === "down" ? -22 : 0;
      animation = element.animate([
        { opacity: 0, transform: `translate(${x}px, ${y}px)`, ...(blur ? { filter: "blur(5px)" } : {}) },
        { opacity: 1, transform: "none", ...(blur ? { filter: "blur(0px)" } : {}) },
      ], { duration: duration * 1000, delay: delay * 1000, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" });
    }, { rootMargin: "-40px" });
    observer.observe(element);
    const motionChanged = () => { if (!media.matches) { observer.disconnect(); animation?.cancel(); } };
    media.addEventListener("change", motionChanged);
    return () => { observer.disconnect(); animation?.cancel(); media.removeEventListener("change", motionChanged); };
  }, [blur, delay, direction, duration]);
  return (
      <div
        ref={ref}
        className={cn("overflow-visible", className)}
      >
        {children}
      </div>
  );
}

interface SplitRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  delay?: number;
  highlightWord?: string;
  highlightClassName?: string;
}

export function SplitReveal({
  text,
  className,
  as: Component = "h1",
  delay = 0.1,
  highlightWord,
  highlightClassName = "text-[#C6FF3D]",
}: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);

  const words = text.split(" ");

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        ref.current = node as HTMLHeadingElement | null;
      }}
      className={cn("overflow-hidden leading-tight", className)}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="flex flex-wrap justify-center gap-x-[0.28em] gap-y-1">
        {words.map((word, index) => {
          const isHighlight =
            highlightWord &&
            word.toLowerCase().includes(highlightWord.toLowerCase());

          return (
            <span key={index} className="inline-block overflow-hidden pb-1">
              <motion.span
                className={cn(
                  "inline-block",
                  isHighlight && highlightClassName
                )}
                initial={false}
                animate={isInView && !reducedMotion ? { y: ["100%", "0%"], rotate: [3, 0] } : { y: "0%", rotate: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.85,
                  delay: reducedMotion ? 0 : delay + index * 0.065,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          );
        })}
      </span>
    </Component>
  );
}
