"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withTagline?: boolean;
}

export function Logo({ className, size = "md", withTagline = false }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 transition-opacity hover:opacity-90 cursor-pointer select-none",
        className
      )}
      aria-label="SaaSFolio Homepage"
    >
      {/* Dynamic Monogram Bracket Motif */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-black border border-white/10 p-1.5 transition-all duration-300 group-hover:border-[#C6FF3D]/60 group-hover:shadow-[0_0_20px_rgba(198,255,61,0.25)] shrink-0",
          iconSizes[size]
        )}
        style={{
          width: size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 44 : 56,
          height: size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 44 : 56,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="w-full h-full block"
        >
          {/* Left bracket */}
          <path
            d="M9 7L5 11V21L9 25"
            stroke="#EDEDED"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors group-hover:stroke-white"
          />
          {/* Dynamic 'S' slash / discount bolt */}
          <path
            d="M19 8L11 16H20L13 24"
            stroke="#C6FF3D"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right bracket */}
          <path
            d="M23 7L27 11V21L23 25"
            stroke="#EDEDED"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors group-hover:stroke-white"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-display font-black tracking-tighter uppercase leading-none text-white flex items-center",
            textSizes[size]
          )}
        >
          SaaS<span className="text-[#C6FF3D]">Folio</span>
          <span className="inline-block ml-1 w-1.5 h-1.5 rounded-full bg-[#C6FF3D] animate-pulse" />
        </span>
        {withTagline && (
          <span className="font-mono text-[9px] tracking-widest text-[#8E8E93] uppercase mt-0.5">
            Discover ✦ Save ✦ Scale
          </span>
        )}
      </div>
    </Link>
  );
}
