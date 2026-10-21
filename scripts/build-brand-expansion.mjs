import fs from "node:fs";
const categories = {
  "ai-tools": "Artificial Intelligence", marketing: "Growth & Marketing", "crm-sales": "CRM & Sales Automation",
  "dev-tools": "Developer & API Tools", design: "Design & Creative Systems", analytics: "Analytics & Product Telemetry",
  hosting: "Cloud Hosting & Edge Infra", finance: "Fintech, Billing & Invoicing", productivity: "Productivity & Knowledge Hubs",
  security: "Cybersecurity & Compliance", ecommerce: "E-Commerce & Checkout Engines", "project-management": "Project & Sprint Management",
};
const rows = fs.readFileSync(new URL("../lib/data/brand-expansion.txt", import.meta.url), "utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#"));
const tools = rows.map(line => {
  const [name, slug, categorySlug, pricingUrl, description, features] = line.split("|");
  if (!categories[categorySlug]) throw new Error(`Unknown category: ${categorySlug}`);
  return {
    id: `tool-${slug}`, name, slug, tagline: description, description,
    longDescription: `${description}\n\nIts product areas include ${features.split(";").join(", ").toLowerCase()}. Compare these capabilities with your team's workflow, integrations, and budget.\n\nFollow the official pricing link for current plans, usage allowances, and billing terms. SaaSFolio does not assign a customer rating or claim a discount without a recorded source.`,
    category: categories[categorySlug], categorySlug, website: new URL(pricingUrl).origin, pricingUrl, sourceUrl: pricingUrl,
    logoLetter: name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase(), rating: 0, reviewCount: 0,
    pricingStart: 0, pricingModel: "Paid", pricingVerified: false, verified: false,
    bestFor: description, keyFeatures: features.split(";"), pros: [], cons: [], pricingPlans: [], alternatives: [], reviews: [], dealsCount: 0,
    tier: "mid-tier", updatedAt: "2026-10-21T00:00:00.000Z",
  };
});
if (new Set(tools.map(t => t.slug)).size !== tools.length) throw new Error("Duplicate expansion slug");
fs.writeFileSync(new URL("../lib/data/expanded-tools.json", import.meta.url), `${JSON.stringify(tools, null, 2)}\n`);
console.log(`Generated ${tools.length} additional brand profiles`);
