import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/go/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
