export function offerReportHref(offerSlug: string): string {
  return `/contact?offer=${encodeURIComponent(offerSlug)}#contact-form`;
}
export function brandReportHref(brandSlug: string): string {
  return `/contact?brand=${encodeURIComponent(brandSlug)}#contact-form`;
}
