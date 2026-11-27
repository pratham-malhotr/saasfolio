import logoSlugs from "@/lib/data/brand-logo-slugs.json";

const LOGOS = new Set<string>(logoSlugs);

// A brand's own icon (fetched once and served locally by scripts/fetch-brand-logos.mjs)
// on a white tile, or its initials when no icon of sufficient quality is available.
export function BrandAvatar({ name, slug, letters, category, className = "" }: {
  name: string;
  slug?: string;
  letters?: string;
  category?: string;
  className?: string;
}) {
  if (slug && LOGOS.has(slug)) {
    return (
      <span aria-hidden="true" data-category={category} className={`brand-avatar brand-avatar-logo ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 128px local icon; next/image adds no benefit here */}
        <img src={`/brand-logos/${slug}.png`} alt="" width={128} height={128} loading="lazy" decoding="async" />
      </span>
    );
  }
  const initials = name.trim().split(/[\s.-]+/).slice(0, 2).map(word => word.charAt(0)).join("");

  return (
    <span aria-hidden="true" data-category={category} className={`brand-avatar ${className}`}>
      {letters || initials.toUpperCase() || "#"}
    </span>
  );
}
