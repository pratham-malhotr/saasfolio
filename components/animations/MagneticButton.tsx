"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
  asLink?: boolean;
}

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  variant = "primary",
  size = "md",
  href,
  target,
  rel,
  asLink = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const variantStyles = {
    primary:
      "bg-[#C6FF3D] text-black font-bold hover:bg-[#D6FF66] shadow-[0_0_25px_rgba(198,255,61,0.3)] hover:shadow-[0_0_35px_rgba(198,255,61,0.5)] border border-[#C6FF3D]",
    secondary:
      "bg-[#141416] text-white hover:text-[#C6FF3D] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#1a1a1e]",
    outline:
      "bg-transparent text-white hover:text-[#C6FF3D] border border-white/20 hover:border-[#C6FF3D]",
    ghost:
      "bg-transparent text-zinc-300 hover:text-white hover:bg-white/5",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors select-none cursor-pointer overflow-hidden",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      onClick={onClick}
    >
      {/* Subtle shine highlight */}
      <span
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none -translate-x-full",
          isHovered && "translate-x-full"
        )}
      />
      {children}
    </motion.div>
  );

  if (asLink && href) {
    return (
      <a href={href} target={target} rel={rel} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
}
