import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

// Native disclosure keeps every answer in the server HTML, so search engines,
// answer engines and readers without JavaScript all receive the full text.
export function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <div className="my-8 space-y-3">
      {faqs.map((faq, idx) => (
        <details
          key={faq.question}
          open={idx === 0}
          className="group rounded-2xl border border-white/10 bg-[#0b0d0b] overflow-hidden transition-colors hover:border-white/20 open:border-[#C6FF3D]/30"
        >
          <summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="font-display font-bold text-sm sm:text-base text-white group-open:text-[#C6FF3D]">
              {faq.question}
            </h3>
            <span className="rounded-lg bg-white/5 p-1.5 text-zinc-400 transition-transform duration-200 group-open:rotate-180 group-open:text-[#C6FF3D]">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </summary>
          <p className="border-t border-white/5 px-6 pb-5 pt-3 text-sm leading-relaxed text-zinc-300">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
