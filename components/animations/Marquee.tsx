"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number; // duration in seconds
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden select-none",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-6",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
        {children}
        {children}
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-6",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}
