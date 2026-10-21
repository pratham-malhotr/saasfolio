"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

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
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });



  return (
    <div ref={ref} className={cn("overflow-visible", className)}>
      <motion.div
        initial={false}
        animate={
          isInView
            ? {
                opacity: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
              }
            : {}
        }
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
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
                  "inline-block will-change-transform",
                  isHighlight && highlightClassName
                )}
                initial={false}
                animate={isInView ? { y: "0%", rotate: 0 } : {}}
                transition={{
                  duration: 0.85,
                  delay: delay + index * 0.065,
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
