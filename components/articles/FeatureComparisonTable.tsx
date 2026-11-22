interface FeatureComparisonTableProps {
  headers: string[];
  rows: { feature: string; values: string[] }[];
}

export function FeatureComparisonTable({ headers, rows }: FeatureComparisonTableProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-400 sm:hidden">Scroll the table to see all columns.</p>
      <div role="region" aria-label="Side-by-side comparison" tabIndex={0} className="overflow-x-auto rounded-2xl border border-white/10 bg-[#09090C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6FF3D]">
        <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.05]">
              {headers.map(header => <th key={header} scope="col" className="px-3 py-3 align-top font-semibold text-white sm:px-5">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map(row => (
              <tr key={row.feature}>
                <th scope="row" className="px-3 py-3 align-top font-medium text-white sm:px-5">{row.feature}</th>
                {row.values.map((value, index) => <td key={headers[index + 1]} className="px-3 py-3 align-top text-zinc-300 sm:px-5">{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
