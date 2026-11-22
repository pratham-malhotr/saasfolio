export type FolioVariant = "directory" | "hosting" | "compare";

interface View {
  name: string;
  detail: string;
  link: string;
  href: string;
  accent: `#${string}`;
}

export const folioContent: Record<FolioVariant, { label: string; views: [View, View, View] }> = {
  directory: {
    label: "Explore SaaSFolio",
    views: [
      { name: "Discover", detail: "Find tools for the work you need to do.", link: "Browse software brands", href: "/brands", accent: "#c6ff3d" },
      { name: "Compare", detail: "Weigh features, plan limits and trade-offs.", link: "Compare SaaS tools", href: "/compare", accent: "#bcabff" },
      { name: "Save", detail: "Check deals against the total subscription cost.", link: "Explore software deals", href: "/deals", accent: "#ffcd79" },
    ],
  },
  hosting: {
    label: "Explore hosting options",
    views: [
      { name: "VPS", detail: "Choose your configuration and plan for upkeep.", link: "Compare two VPS providers", href: "/articles/hetzner-vs-digitalocean-small-business-vps", accent: "#93eaff" },
      { name: "WordPress", detail: "Check what the host handles for your site.", link: "VPS vs managed WordPress", href: "/articles/hostinger-vps-vs-managed-wordpress-solo-blogger", accent: "#a3bcff" },
      { name: "App platforms", detail: "Check deployment, storage and recovery needs.", link: "Explore app platform hosting", href: "/articles/digitalocean-app-platform-review", accent: "#95f9bf" },
    ],
  },
  compare: {
    label: "What matters in a comparison?",
    views: [
      { name: "Features", detail: "Match both tools to the same task.", link: "Pick two tools", href: "#pick-tools", accent: "#bcabff" },
      { name: "Pricing", detail: "Use equivalent seats, usage and billing terms.", link: "Calculate annual savings", href: "/savings-calculator", accent: "#c6ff3d" },
      { name: "Workflow", detail: "Check which limits affect the work you repeat.", link: "Read the plan-limits guide", href: "/articles/compare-saas-pricing-limits", accent: "#8ce8f3" },
    ],
  },
};
