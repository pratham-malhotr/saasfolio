"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  cursorLabel?: string;
  onClick?: () => void;
}

export function TiltCard({
  children,
  className,
  glowColor = "rgba(198, 255, 61, 0.18)",
  cursorLabel = "VIEW",
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D tilt
  const springX = useSpring(mouseX, { stiffness: 300, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const xFromCenter = (e.clientX - rect.left) / width - 0.5;
    const yFromCenter = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(xFromCenter);
    mouseY.set(yFromCenter);

    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-cursor-label={cursorLabel}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-xl border border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md overflow-hidden transition-colors duration-300 hover:border-white/20 group",
        className
      )}
    >
      {/* Mouse-following spotlight glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 ease-out z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${glowColor}, transparent 80%)`,
        }}
      />

      {/* Card Content with 3D depth */}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
