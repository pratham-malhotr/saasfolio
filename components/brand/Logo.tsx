"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";

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
      <BrandMark size={size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 44 : 56} className={cn("shrink-0", iconSizes[size])} />

      {/* Wordmark */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-display font-black tracking-tighter leading-none text-white flex items-center",
            textSizes[size]
          )}
        >
          SaaS<span className="text-[#C6FF3D]">Folio</span>
        </span>
        {withTagline && (
          <span className="font-mono text-[9px] tracking-widest text-[#8E8E93] uppercase mt-0.5">
            Software savings. Clear terms.
          </span>
        )}
      </div>
    </Link>
  );
}
