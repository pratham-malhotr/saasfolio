"use client";

import React, { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TableOfContentsProps {
  items: { id: string; title: string }[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "0px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  return (
    <nav className="p-6 rounded-2xl bg-[#09090C] border border-white/10 sticky top-28">
      <div className="flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
        <List className="w-3.5 h-3.5" />
        Table of Contents
      </div>

      <ul className="space-y-2.5 font-mono text-xs">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`block py-1 px-2.5 rounded-lg transition-all border-l-2 leading-relaxed ${
                  isActive
                    ? "border-[#C6FF3D] text-[#C6FF3D] bg-[#C6FF3D]/5 font-bold translate-x-1"
                    : "border-transparent text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
