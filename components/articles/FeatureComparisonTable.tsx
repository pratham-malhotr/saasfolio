import React from "react";

interface FeatureComparisonTableProps {
  headers: string[];
  rows: { feature: string; values: string[] }[];
}

export function FeatureComparisonTable({ headers, rows }: FeatureComparisonTableProps) {
  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-[#09090C]">
      <table className="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`py-4 px-6 text-xs font-mono uppercase tracking-wider ${
                  idx === 0 ? "text-zinc-400 font-medium" : "text-white font-bold"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-mono text-xs">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-6 font-medium text-zinc-300">
                {row.feature}
              </td>
              {row.values.map((val, vIdx) => {
                const isHighlight = vIdx === row.values.length - 1; // Last column is usually our target
                return (
                  <td
                    key={vIdx}
                    className={`py-4 px-6 ${
                      isHighlight
                        ? "text-[#C6FF3D] font-bold"
                        : "text-zinc-400"
                    }`}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
