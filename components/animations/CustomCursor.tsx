"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/lib/use-media-query";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const isTouchDevice = useMediaQuery("(pointer: coarse), (prefers-reduced-motion: reduce)", true);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for the follower ring
  const springX = useSpring(mouseX, { stiffness: 450, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 450, damping: 30 });

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      // Check for custom cursor targets
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("a, button, input, textarea, [role='button']");
      const cursorTarget = target.closest("[data-cursor-label]") as HTMLElement | null;

      if (cursorTarget) {
        setCursorLabel(cursorTarget.getAttribute("data-cursor-label"));
        setIsHovered(true);
      } else if (interactive) {
        setCursorLabel(null);
        setIsHovered(true);
      } else {
        setCursorLabel(null);
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isTouchDevice, mouseX, mouseY]);

  if (isTouchDevice) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300">
      {/* Inner precise dot */}
      <motion.div
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-[#C6FF3D] pointer-events-none z-[10000]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? (cursorLabel ? 0 : 1) : 0,
        }}
      />

      {/* Follower ring / Label capsule */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none flex items-center justify-center font-mono text-[10px] font-bold tracking-widest uppercase"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: cursorLabel ? 76 : isHovered ? 44 : 28,
          height: cursorLabel ? 32 : isHovered ? 44 : 28,
          backgroundColor: cursorLabel
            ? "rgba(198, 255, 61, 0.95)"
            : isHovered
            ? "rgba(198, 255, 61, 0.15)"
            : "rgba(255, 255, 255, 0.04)",
          borderColor: cursorLabel
            ? "#C6FF3D"
            : isHovered
            ? "rgba(198, 255, 61, 0.8)"
            : "rgba(255, 255, 255, 0.25)",
          color: cursorLabel ? "#000000" : "#C6FF3D",
          borderRadius: cursorLabel ? 9999 : 9999,
          borderWidth: cursorLabel ? 0 : 1.5,
          backdropFilter: "blur(4px)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {cursorLabel && <span>{cursorLabel}</span>}
      </motion.div>
    </div>
  );
}
