import { BRAND_MARK } from "@/lib/brand-mark.mjs";

export function BrandMark({ size = 40, className }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true" focusable="false">
    <rect width="64" height="64" rx="15" fill={BRAND_MARK.background} />
    <path d={BRAND_MARK.path} fill="none" stroke={BRAND_MARK.ink} strokeWidth="10" strokeLinejoin="round" />
    <polygon points={BRAND_MARK.foldPoints} fill={BRAND_MARK.fold} />
  </svg>;
}
