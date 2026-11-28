import type { DiscountGuideEntry } from "@/lib/data/discount-guide-builder";

// High-demand programs with sourced offers, reviewed 2026-11-27 on the
// providers' own pages (GitHub Education and HubSpot for Startups).
const entries: DiscountGuideEntry[] = [
  {
    slug: "github", name: "GitHub", url: "https://github.com/pricing", reviewedAt: "2026-11-27",
    searchTitle: "GitHub Student Discount: Free Pro & Copilot",
    meta: "GitHub Student Developer Pack: free GitHub Pro and Copilot for verified students, who qualifies, the documents to upload and how to apply.",
    intro: "The GitHub Student Developer Pack gives verified students a free GitHub Pro account and free GitHub Copilot, plus partner offers from other developer tools. Teachers can get GitHub Team and Copilot Pro free.",
    summary: "If you are 13 or older and enrolled in a degree- or diploma-granting program, apply through GitHub Education with dated proof of enrollment. The benefits last while you remain a student, so there is no reason to pay for GitHub Pro during school.",
    best: "The best GitHub discount for students is the Student Developer Pack: GitHub Pro and GitHub Copilot are free once your student status is verified, with no coupon code needed. Teachers at accredited institutions get GitHub Team and Copilot Pro free. Everyone else pays GitHub's standard plans; there is no public promo code.",
    related: ["coderabbit", "sentry", "checkly"],
    profile: { isNew: false, categorySlug: "dev-tools", pricingModel: "Freemium", description: "GitHub hosts code repositories with pull requests, Actions CI/CD, Codespaces, packages and GitHub Copilot AI assistance for individuals and teams.", features: ["Git repositories and pull requests", "GitHub Actions CI/CD", "Codespaces cloud dev environments", "GitHub Copilot AI assistant", "Packages and Pages"], longDescription: "GitHub is where most open-source and commercial software teams store code, review changes and run automated builds. Plans add private collaboration features, Actions minutes, Codespaces hours and storage. Students and teachers can get paid features free through GitHub Education." },
    savings: [
      { type: "Education offer", saving: "Free GitHub Pro and Copilot for verified students", terms: "GitHub Education gives verified students a free GitHub Pro account and free GitHub Copilot access, plus Student Developer Pack partner offers. Applicants must be 13 or older, enrolled in a degree- or diploma-granting program and provide dated proof of enrollment.", sourceUrl: "https://education.github.com/pack" },
    ],
    options: [
      ["Student Developer Pack", "Students 13+ in a degree- or diploma-granting program", "Dated proof of enrollment or an academic email"],
      ["GitHub Education for teachers", "Educators at accredited institutions", "Faculty ID or employment letter and institutional email"],
      ["Paid GitHub plans", "Everyone else", "Private collaboration, Actions minutes and Codespaces needs"],
    ],
    sections: [
      ["What verified students get", "GitHub Education upgrades a verified student's personal account to GitHub Pro at no cost. That includes unlimited private repositories, 3,000 Actions minutes and 180 Codespaces hours a month, 2 GB of Packages storage and 20 GB of Codespaces storage. GitHub Copilot is also free for verified students through the Copilot Student plan. On top of that, the Student Developer Pack lists partner offers from other developer tools, each with its own terms and duration, so check every partner offer before you rely on it for a project."],
      ["Who qualifies and what to upload", "You must be at least 13 years old, enrolled in a degree- or diploma-granting program such as a high school, college, university or homeschool, and own a personal GitHub account. GitHub asks for documents that prove current enrollment: a school ID showing a current enrollment date, a class schedule, a transcript, or an enrollment verification letter. If other students from your school have verified with an academic email, you will need to use one too; if your school does not issue them, upload official documentation instead."],
      ["How to apply", "Open your GitHub settings, go to Education benefits, choose Start an application and complete the form with your school and proof of enrollment. Use a clear, dated document whose name matches your GitHub profile. After approval, the GitHub Education portal lists your benefits and the partner offers you can activate. Benefits continue while you remain a verified student."],
      ["Teachers and everyone else", "Educators employed at an accredited institution can get GitHub Team free for their classes and GitHub Copilot Pro free, using a faculty ID or employment letter and an institutional email. If you are not a student or teacher, there is no public GitHub coupon code: compare the Free, Team and Enterprise plans on GitHub's pricing page by private collaboration, Actions minutes, Codespaces hours and security features. When student benefits end after you graduate, a paid plan renews at the standard price, so check the renewal date and how to cancel or downgrade in your billing settings before it starts."],
    ],
    redeem: [
      "Sign in to the personal GitHub account you want upgraded.",
      "Open Settings, then Education benefits, and choose Start an application.",
      "Upload dated proof of enrollment or use your academic email, then submit.",
      "After approval, activate GitHub Pro, Copilot and any partner offers from the GitHub Education portal.",
    ],
    eligibility: [
      ["Age and enrollment", "13 or older and enrolled in a degree- or diploma-granting program."],
      ["Proof", "A dated school ID, class schedule, transcript or enrollment letter, or an academic email."],
      ["Duration", "Benefits continue while you remain a verified student; partner offers have their own terms."],
    ],
    troubleshooting: [
      ["The application was rejected", "Upload a clearer dated document whose name matches your profile, or use your academic email if classmates verified with one."],
      ["Copilot still asks for payment", "Confirm your student status is approved in the GitHub Education portal, then activate the Copilot Student plan there."],
    ],
    notes: [
      "GitHub Education gives verified students a free GitHub Pro account and free GitHub Copilot, plus Student Developer Pack partner offers.",
      "Applicants must be 13 or older, enrolled in a degree- or diploma-granting program and provide dated proof of enrollment; teachers get GitHub Team and Copilot Pro free.",
    ],
    faqs: [
      ["Is GitHub free for students?", "Yes. Verified students get GitHub Pro and GitHub Copilot free through GitHub Education's Student Developer Pack, plus partner offers from other developer tools."],
      ["Who is eligible for the GitHub Student Developer Pack?", "Anyone 13 or older enrolled in a degree- or diploma-granting program, including high school and homeschool, with a GitHub account and dated proof of enrollment."],
      ["Do I need a school email for GitHub Education?", "Not always. If other students from your school verified with an academic email you must use one; otherwise a dated school ID, schedule, transcript or enrollment letter works."],
      ["Is GitHub Copilot free for students?", "Yes. GitHub Copilot is free for verified students through the Copilot Student plan, and Copilot Pro is free for verified teachers."],
    ],
    sources: [
      { label: "GitHub Student Developer Pack", url: "https://education.github.com/pack" },
      { label: "GitHub Docs: apply to GitHub Education as a student", url: "https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student" },
      { label: "GitHub Education for teachers", url: "https://github.com/education/teachers" },
    ],
  },
  {
    slug: "hubspot", name: "HubSpot", url: "https://www.hubspot.com/pricing", reviewedAt: "2026-11-27",
    searchTitle: "HubSpot for Startups Discount: Up to 90% Off",
    meta: "HubSpot for Startups: up to 90% off year one, then 50% and 25%, for pre-seed to Series A startups. Check eligibility, partners and renewal costs.",
    intro: "HubSpot for Startups gives eligible startups up to 90% off HubSpot in year one, 50% in year two and 25% in year three. It is for companies that raised pre-seed, seed or Series A funding.",
    summary: "Check the tier you qualify for before planning a budget: the 90% tier requires pre-seed to Series A funding and an approved partner or verified venture funding, while a second tier through entrepreneurial organizations starts at 30% off. Plan for the step-down in years two and three.",
    best: "The biggest HubSpot discount is HubSpot for Startups: up to 90% off in year one, then 50% and 25%, for startups with pre-seed, seed or Series A funding (not Series B or later). A second tier for members of approved entrepreneurial organizations lists 30% off year one and 15% in year two. Everyone else pays standard HubSpot pricing; there is no public coupon code.",
    related: ["intercom", "smartlead", "snov-io"],
    profile: { isNew: false, categorySlug: "crm-sales", pricingModel: "Freemium", description: "HubSpot is a CRM platform with marketing, sales, customer service, content and operations hubs, AI agents and free tools.", features: ["CRM and contact management", "Marketing automation", "Sales pipeline and sequences", "Customer service help desk", "AI agents and reporting"], longDescription: "HubSpot connects a shared CRM with hubs for marketing, sales, service, content and operations, so teams work from the same customer records. Paid editions add automation, reporting and seats, and the price rises with contacts and editions. Eligible startups can get large first-year discounts through HubSpot for Startups." },
    savings: [
      { type: "Organization offer", saving: "Up to 90% off year one, then 50% and 25%, for eligible startups", terms: "HubSpot for Startups lists 90% off year one, 50% in year two and 25% in year three for startups that raised pre-seed, seed or Series A funding (not Series B or later) and are affiliated with an approved partner or have verified venture funding. Members of approved entrepreneurial organizations qualify for 30% off year one and 15% in year two.", sourceUrl: "https://www.hubspot.com/startups" },
    ],
    options: [
      ["Tier 1: up to 90% off", "Pre-seed to Series A startups with a partner or verified funding", "Funding stage, partner affiliation and the products you need"],
      ["Tier 2: 30% off", "Members of approved entrepreneurial organizations", "Organization membership and the year-two price"],
      ["Standard pricing", "Series B+ or unaffiliated companies", "Editions, seats and contact tiers"],
    ],
    sections: [
      ["How the HubSpot for Startups discount steps down", "The program's top tier lists 90% off in the first year, 50% in the second and 25% in the third, so the discount shrinks each year rather than ending all at once. That makes year one cheap but means the real decision is whether HubSpot still fits your budget in year three. Price the editions and seats you will need at full price, apply each year's discount, and put the renewal dates in your calendar before you sign."],
      ["Who qualifies for the 90% tier", "HubSpot lists two conditions for Tier 1: the company raised pre-seed, seed or Series A funding but not Series B or later, and it is affiliated with an approved HubSpot for Startups partner or has raised verified venture funding. Thousands of accelerators, incubators and VCs are listed as partners, so ask your investor or program whether they are one. HubSpot's eligibility checker gives a quick answer before you apply."],
      ["The 30% tier and bootstrapped teams", "Startups associated with one of HubSpot's approved entrepreneurial organizations can qualify for a second tier with 30% off in year one and 15% in year two. Bootstrapped or unfunded companies may not qualify for either tier; in that case start with HubSpot's free tools and upgrade only the hub you need, because paid editions are priced per seat and by marketing contacts."],
      ["Scope the hubs before you apply", "A first-year discount is easy to over-buy against. Before applying, list which hubs your team will actually use in the next year — marketing, sales, service, content or operations — and how many people need a paid seat. Start with the one hub that solves your most urgent problem and add others when you have a process ready for them. A smaller setup keeps the year-two and year-three bills manageable when the discount steps down."],
      ["Partner offers from other tools", "Members of HubSpot for Startups also get access to partner offers from other software companies, each with its own eligibility rules. These are separate from the HubSpot discount itself. Treat them as a bonus and check each offer's terms, rather than choosing HubSpot because of a partner deal you may not qualify for."],
    ],
    redeem: [
      "Use HubSpot's eligibility checker on the HubSpot for Startups page.",
      "Ask your accelerator, incubator or VC whether they are an approved partner, or prepare proof of venture funding.",
      "Create your account through the HubSpot for Startups sign-up and confirm your tier.",
      "Price the editions and seats you need at full price, apply each year's discount, and note the renewal dates and cancellation terms.",
    ],
    eligibility: [
      ["Funding", "Pre-seed, seed or Series A funding, and not Series B or later, for the 90% tier."],
      ["Affiliation", "An approved HubSpot for Startups partner or verified venture funding."],
      ["Step-down", "50% off in year two and 25% in year three; check the year-four renewal price."],
    ],
    troubleshooting: [
      ["The checker says you are not eligible", "Ask your accelerator or investor whether they are a HubSpot partner, or check the 30% tier for entrepreneurial organizations."],
      ["The renewal quote is much higher", "The discount steps down each year; compare the next year's discounted price and full price before renewing."],
    ],
    notes: [
      "HubSpot for Startups lists up to 90% off year one, then 50% in year two and 25% in year three, for pre-seed, seed and Series A startups.",
      "A second tier for approved entrepreneurial organizations lists 30% off year one and 15% in year two.",
    ],
    faqs: [
      ["How much is the HubSpot for Startups discount?", "Up to 90% off in year one, 50% in year two and 25% in year three for eligible startups, or 30% then 15% for members of approved entrepreneurial organizations."],
      ["Who qualifies for HubSpot for Startups?", "Startups that raised pre-seed, seed or Series A funding (not Series B or later) and are affiliated with an approved partner or have verified venture funding."],
      ["Does HubSpot have a coupon code?", "HubSpot does not publish a public coupon code. Its biggest discount is the HubSpot for Startups program for eligible funded startups."],
      ["What happens after the HubSpot startup discount ends?", "The discount steps down from 90% to 50% to 25% over three years, after which standard pricing applies. Check renewal dates and the full price before committing."],
    ],
    sources: [
      { label: "HubSpot for Startups", url: "https://www.hubspot.com/startups" },
      { label: "HubSpot for Startups program tiers", url: "https://www.hubspot.com/startups/about" },
    ],
  },
];

export const PROGRAM_DISCOUNT_ENTRIES = entries;
