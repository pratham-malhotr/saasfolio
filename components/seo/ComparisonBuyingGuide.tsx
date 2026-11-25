import Link from "next/link";
import type { ComparisonGuide } from "@/lib/data/comparison-guides";

export function ComparisonBuyingGuide({ guide, relatedArticles }: {
  guide: ComparisonGuide;
  relatedArticles: readonly { slug: string; title: string }[];
}) {
  return (
    <section id="analysis" data-editorial-comparison="true" className="mb-12 space-y-8 rounded-2xl border border-white/10 bg-[#09090C] p-5 sm:p-8">
      <header className="space-y-3">
        <p className="text-xs text-zinc-400">SaaSFolio editorial · Documentation reviewed <time dateTime={guide.reviewedAt}>{guide.reviewedAt}</time></p>
        <h2 className="font-display text-3xl font-bold text-white">Which approach fits your work?</h2>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-200">{guide.decision}</p>
      </header>

      <div role="region" aria-label="Decision scenarios" tabIndex={0} className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Decision scenarios and their trade-offs</caption>
          <thead><tr className="border-b border-white/20 bg-white/5 text-white">
            {["Your situation", "A useful starting point", "Why it matters"].map(title => <th key={title} scope="col" className="p-3">{title}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/10 text-zinc-300">
            {guide.rows.map(row => (
              <tr key={row.situation}>
                <th scope="row" className="p-3 font-medium">{row.situation}</th>
                <td className="p-3">{row.approach}</td>
                <td className="p-3">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {guide.sections.map(section => (
        <section key={section.heading} className="max-w-3xl space-y-2">
          <h3 className="text-xl font-semibold text-white">{section.heading}</h3>
          <p className="leading-relaxed text-zinc-300">{section.text}</p>
        </section>
      ))}

      <section className="max-w-3xl space-y-3">
        <h3 className="text-xl font-semibold text-white">A practical evaluation to run</h3>
        <ol className="list-decimal space-y-3 pl-5 text-zinc-300">{guide.exercise.map(step => <li key={step}>{step}</li>)}</ol>
      </section>

      {!!guide.questions?.length && (
        <section className="max-w-3xl space-y-4">
          <h3 className="text-xl font-semibold text-white">Common questions</h3>
          <dl className="space-y-4">
            {guide.questions.map(question => (
              <div key={question.question}>
                <dt className="font-semibold text-zinc-100">{question.question}</dt>
                <dd className="mt-1 leading-relaxed text-zinc-300">{question.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="max-w-3xl space-y-3">
        <h3 className="text-xl font-semibold text-white">Sources and scope</h3>
        <p className="text-sm leading-relaxed text-zinc-400">
          This evaluation is based on the official documentation below. Confirm current prices and plan limits with each provider. <Link href="/editorial-policy" className="text-[#C6FF3D] underline">Editorial method and corrections</Link>.
        </p>
        <ul className="space-y-2">
          {guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C6FF3D] underline underline-offset-4">{source.label} ↗</a></li>)}
        </ul>
      </section>

      {relatedArticles.length > 0 && (
        <nav aria-label="Related software research" className="space-y-3 border-t border-white/10 pt-5">
          <h3 className="text-xl font-semibold text-white">Related reviews and buying guides</h3>
          <ul className="space-y-2">
            {relatedArticles.map(article => <li key={article.slug}><Link prefetch={false} href={`/articles/${article.slug}`} className="text-sm text-[#C6FF3D] underline underline-offset-4">{article.title}</Link></li>)}
          </ul>
        </nav>
      )}
    </section>
  );
}
