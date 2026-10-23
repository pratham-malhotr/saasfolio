// Original SaaSFolio folded-folio S. Shared by the website and exported icons.
export const BRAND_MARK = {
  background: "#C6FF3D",
  ink: "#10120B",
  fold: "#FFFFFF",
  path: "M48 17H26C20 17 16 21 16 27S20 37 26 37H38C42 37 46 40 46 44S42 49 38 49H16",
  foldPoints: "40,12 48,12 48,20",
};

export function brandMarkSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="15" fill="${BRAND_MARK.background}"/><path d="${BRAND_MARK.path}" fill="none" stroke="${BRAND_MARK.ink}" stroke-width="10" stroke-linejoin="round"/><polygon points="${BRAND_MARK.foldPoints}" fill="${BRAND_MARK.fold}"/></svg>`;
}
