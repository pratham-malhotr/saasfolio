import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME, short_name: SITE_NAME, description: SITE_DESCRIPTION,
    id: "/", start_url: "/", scope: "/", display: "browser",
    background_color: "#050505", theme_color: "#C6FF3D",
    icons: [192, 512].map(size => ({ src: `/brand/icon-${size}.png`, sizes: `${size}x${size}`, type: "image/png", purpose: "any" })),
  };
}
