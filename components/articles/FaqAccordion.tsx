"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // First open by default

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="my-8 space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-[#09090C] overflow-hidden transition-colors hover:border-white/20"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 transition-colors"
            >
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {faq.question}
              </span>
              <span
                className={`p-1.5 rounded-lg bg-white/5 text-zinc-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#C6FF3D]" : ""
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>

            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
