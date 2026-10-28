export type SavingsCollectionSlug = "coupon-codes" | "startup-deals" | "student-discounts" | "nonprofit-discounts";
export type SavingsLink = { label: string; href: string };
export type SavingsProgram = {
  brandSlug: string;
  name: string;
  sourceUrl: string;
  audience: string;
  check: string;
};
export type SavingsCollection = {
  slug: SavingsCollectionSlug;
  navLabel: string;
  title: string;
  description: string;
  heading: string;
  answer: string;
  intro: string;
  updatedAt: string;
  programs: SavingsProgram[];
  steps: { title: string; text: string }[];
  comparison: { route: string; requirement: string; costCheck: string }[];
  faqs: { question: string; answer: string }[];
  articleSlugs: string[];
};

// Each collection serves a different buying decision. These are editorial
// application routes, not a feed of guaranteed discounts or invented codes.
// Current offer cards come only from the separately checked offer catalog.
export const SAVINGS_COLLECTIONS: SavingsCollection[] = [
  {
    slug: "coupon-codes", navLabel: "Software coupon codes",
    title: "Software Coupon Codes & SaaS Promo Codes",
    description: "Find source-reported software coupon codes and SaaS promo codes. Compare expiry, eligible plans and renewal terms before trying a code at checkout.",
    heading: "Software coupon codes & SaaS promo codes",
    answer: "Compare current software coupon codes below, with their reporting source, check date, product restrictions and published expiry. Confirm the payable total at the provider before purchasing; these codes are source-reported and have not been checkout tested.",
    intro: "This page lists codes currently present in SaaSFolio’s sourced catalog. It does not fill gaps with guessed codes: a brand can have a detailed discount guide while having no current public coupon recorded. The cards distinguish the publisher reporting a code from proof that a merchant accepted it.",
    updatedAt: "2026-10-28", programs: [],
    steps: [
      { title: "Start with the exact product", text: "Match the code to the product and purchase you intend to make. A domain registration code, hosting offer and email subscription can have different rules even when the same company sells them. Open the listing’s source to inspect the original wording rather than relying on the brand name alone." },
      { title: "Check the customer and billing rules", text: "Look for new-customer restrictions, excluded plans, minimum commitments and region limits. A monthly subscription may not qualify for an annual promotion. A displayed expiry is a deadline, not evidence that every account qualifies until that moment." },
      { title: "Compare with the route that needs no code", text: "Check the equivalent direct price and the provider’s annual option before applying a promo. A code can replace an automatic offer instead of adding to it. If a partner requires a membership, include that access fee and keep provider approval separate from membership eligibility." },
      { title: "Confirm acceptance before payment", text: "Enter the recorded code at the provider’s own checkout, then inspect the payable total, billing period and renewal amount. If it is rejected, check the plan and account conditions or report the listing for review. Copying a code successfully does not validate it or reserve the offer." },
    ],
    comparison: [
      { route: "Public coupon code", requirement: "A recorded code and an eligible checkout", costCheck: "Payable total after the code, then the standard renewal" },
      { route: "Automatic annual saving", requirement: "The same plan with an annual commitment", costCheck: "Full upfront payment, seats and usage rather than the monthly equivalent alone" },
      { route: "Partner or application offer", requirement: "Approval and sometimes a separate access fee", costCheck: "Membership, activation rules and the duration of the approved benefit" },
    ],
    faqs: [
      { question: "Are these working or verified SaaS coupon codes?", answer: "The catalog records source checks and published conditions. Current codes have not been checkout tested, so SaaSFolio does not describe them as guaranteed working or checkout verified. Acceptance depends on the merchant, account, product, billing period and current terms." },
      { question: "Why are there only a few software brands with a code?", answer: "Only codes with qualifying recorded evidence appear here. Many SaaS providers use annual pricing, application-based benefits, free plans or trials instead. Browse the brand discount guides for those routes; their existence does not imply an undisclosed coupon." },
      { question: "Can I combine a promo code with annual or student pricing?", answer: "Do not assume that promotions stack. Check the source restrictions and compare the final amount for the same plan. An approved education or nonprofit account may follow a separate billing path that does not accept public codes." },
      { question: "What should I do when a software coupon is rejected?", answer: "Check the exact product, customer status, region, expiry and billing commitment. If the published conditions appear to match, contact the provider or report the listing with the offer URL and its response. Do not send payment details or passwords." },
    ],
    articleSlugs: ["find-and-use-saas-coupon-codes", "compare-saas-deal-membership-fees"],
  },
  {
    slug: "startup-deals", navLabel: "Startup software deals",
    title: "Startup Software Deals, Discounts & Credits",
    description: "Compare startup software deals, SaaS discounts and credit programs. Check funding, partner access, existing-account rules and costs after the benefit ends.",
    heading: "Startup software deals, discounts & credits",
    answer: "Startup software benefits usually require approval rather than a universal coupon. Compare temporary plan access, service credits and subscription discounts separately, then budget for the first invoice after the benefit. Funding, company age, partner affiliation and previous paid use can change eligibility.",
    intro: "Build a shortlist around software your team actually needs. A large credit balance is useful only if it covers the workload you would otherwise pay for; a free period can create a much larger renewal commitment. The program directory below links official application routes and the matching brand buying guides.",
    updatedAt: "2026-10-28",
    programs: [
      { brandSlug: "notion", name: "Notion for Startups", sourceUrl: "https://www.notion.com/startups", audience: "Startups seeking workspace access through an approved application", check: "Confirm the approved Business-plan period, existing-workspace restrictions and paid renewal for your team." },
      { brandSlug: "hubspot", name: "HubSpot for Startups", sourceUrl: "https://www.hubspot.com/startups", audience: "Startups qualifying through the provider’s funding and partner routes", check: "Compare your eligible program tier, the products covered and the cost as introductory benefits change." },
      { brandSlug: "sentry", name: "Sentry startup credits", sourceUrl: "https://sentry.io/for/startups/apply/", audience: "Young companies meeting Sentry’s funding and previous-payment conditions", check: "Check approved credit, expiry, covered usage and how overages are billed; credits are not cash." },
      { brandSlug: "fibery", name: "Fibery startup program", sourceUrl: "https://fibery.com/startups", audience: "Startups applying for a temporary workspace benefit", check: "Verify current application requirements, the included plan and the cost of keeping the workspace afterward." },
      { brandSlug: "linear", name: "Linear startup partnerships", sourceUrl: "https://linear.app/startups", audience: "Startups with an eligible investor, accelerator or other listed partner", check: "An independent startup may need another route. Check partner affiliation and which workspace can activate the benefit." },
      { brandSlug: "rootly", name: "Rootly for Startups", sourceUrl: "https://rootly.com/startups", audience: "Startups applying for incident-management program pricing", check: "Compare the approved plan, users, excluded products and renewal terms with your actual incident workflow." },
      { brandSlug: "intercom", name: "Intercom Early Stage", sourceUrl: "https://www.intercom.com/early-stage", audience: "Early-stage businesses meeting the provider’s program conditions", check: "Separate the subscription benefit from AI, support usage and other charges; read the later program-year terms." },
    ],
    steps: [
      { title: "Write down one paid baseline", text: "List the plan, required users and realistic usage your team would purchase without a program. Include only tools needed for an identified workflow. This gives you a comparison that does not depend on collecting every available startup perk or treating unused credits as a saving." },
      { title: "Confirm the qualifying company and account", text: "Read the official application requirements for company age, funding, partner affiliation and previous paid use. Apply for the workspace or organization your team intends to keep. A personal account, separate company or existing subscription may not qualify through the same route." },
      { title: "Distinguish credits from temporary access", text: "A credit balance can run out as usage grows, while a plan-access benefit can end on a date even if usage is low. Check what products consume the balance, whether unused value expires, and whether a payment method is required for overages. Record the limits in your software budget." },
      { title: "Plan the first full-price invoice", text: "Model the next twelve months using your expected seat count and workload after the benefit. Keep program expiry, credit exhaustion and subscription renewal as separate reminders. If an offer requires a paid partner membership, add its incremental cost before deciding that the application route is cheaper." },
    ],
    comparison: [
      { route: "Startup service credits", requirement: "An approved company and covered usage", costCheck: "Credit expiry, excluded services and paid overages" },
      { route: "Temporary paid-plan access", requirement: "A qualifying workspace and activation window", costCheck: "Seat count and the first invoice after the free period" },
      { route: "Staged subscription discount", requirement: "The approved program tier and products", costCheck: "Changing program-year rates, add-ons and renewal commitment" },
    ],
    faqs: [
      { question: "Can a bootstrapped startup get software discounts?", answer: "Some programs accept direct applications and others require an eligible partner or funding history. Check the current provider requirements rather than assuming that every young company qualifies. If a program is unavailable to you, compare the direct free plan or annual quote without counting an unapproved benefit." },
      { question: "Are startup credits the same as a cash discount?", answer: "No. Credits normally apply to specified services and can expire or exclude products. Their useful value depends on approved coverage and the eligible usage your team would otherwise purchase. Keep taxes, overages and later subscription charges in the comparison." },
      { question: "Can an existing paid account activate a startup offer?", answer: "The provider decides. Some programs restrict previous paid use or require an application before activation. Check with the official program before changing a subscription or creating another workspace; a second account is not proof of eligibility." },
    ],
    articleSlugs: ["startup-software-credits-and-renewal-costs", "build-a-saas-budget-before-buying"],
  },
  {
    slug: "student-discounts", navLabel: "Student software discounts",
    title: "Student Software Discounts & Education Offers",
    description: "Compare student software discounts and education programs for design, coding and productivity. Check verification, included apps and access after graduation.",
    heading: "Student software discounts & education offers",
    answer: "Student software savings can be an individual education account, an institution-provided license or an application-based benefit. Check which route you qualify for, which applications it includes and when eligibility must be renewed. A school email address alone does not guarantee every provider’s education offer.",
    intro: "Start with your school’s existing software access before buying another subscription. An individual education benefit and a campus-managed license can have different storage, collaboration and account-ownership rules. The links below lead to official education programs and the relevant brand terms, rather than guessed student promo codes.",
    updatedAt: "2026-10-28",
    programs: [
      { brandSlug: "github", name: "GitHub Student Developer Pack", sourceUrl: "https://education.github.com/pack", audience: "Students verified through GitHub Education", check: "Inspect each partner benefit separately: activation requirements and duration can differ across the pack." },
      { brandSlug: "figma", name: "Figma for Education", sourceUrl: "https://www.figma.com/education/", audience: "Verified students and educators using the education route", check: "Check the current education workspace, product coverage and any restrictions on the work you plan to do." },
      { brandSlug: "notion", name: "Notion Education Plan", sourceUrl: "https://www.notion.com/help/notion-for-education", audience: "Eligible individual students and teachers, with a separate student-organization route", check: "Distinguish a one-member education workspace from an approved multi-member student organization." },
      { brandSlug: "microsoft-365", name: "Microsoft Office 365 Education", sourceUrl: "https://www.microsoft.com/en-us/education/products/office", audience: "Eligible students, educators and participating institutions", check: "Confirm the institution’s license and whether it includes the web or desktop apps your course needs." },
      { brandSlug: "adobe-creative-cloud", name: "Adobe student and teacher plans", sourceUrl: "https://helpx.adobe.com/creative-cloud/faq/students-teachers.html", audience: "Students and teachers meeting Adobe’s education verification rules", check: "An introductory payment may belong to an annual commitment. Check the renewal price and cancellation terms in your region." },
      { brandSlug: "miro", name: "Miro Education Plan", sourceUrl: "https://miro.com/education-whiteboard/", audience: "Students and educators applying for Miro’s education plan", check: "Check verification, team ownership, collaboration limits and the process when education status changes." },
    ],
    steps: [
      { title: "Check what your institution already provides", text: "Ask which license your school supplies and which account controls it. Campus access can cover the work you need without an additional personal purchase, but the institution may control storage and account removal. Verify product coverage, installation rights and collaboration before assuming that all editions are included." },
      { title: "Apply through the education route", text: "Use the official verification or application page and provide only the proof it requests. A normal consumer checkout may not recognize education eligibility automatically. Individual students, teachers and student organizations can have separate account requirements, so choose the route matching your actual use." },
      { title: "Check commercial and collaboration requirements", text: "A tool that suits coursework may not provide the team permissions, commercial-use rights or publishing features needed for paid client work. Review the provider’s terms before moving a business project into an education workspace. Compare the required paid plan if the education benefit does not cover that workflow." },
      { title: "Prepare for re-verification or graduation", text: "Record when verification is renewed and what happens when access ends. Keep an export or ownership-transfer plan for projects you need to retain. For a paid introductory subscription, compare both its initial commitment and later renewal; an education label does not mean the price stays unchanged indefinitely." },
    ],
    comparison: [
      { route: "Individual student account", requirement: "The provider’s current student verification", costCheck: "Re-verification, personal workspace limits and later pricing" },
      { route: "Institution-provided license", requirement: "An eligible institution and school-managed account", costCheck: "Included applications, account ownership and access when you leave" },
      { route: "Partner education benefit", requirement: "Approval for the pack and the individual partner", costCheck: "Separate activation dates, plan limits and subscription renewals" },
    ],
    faqs: [
      { question: "Do I need an .edu email for student software discounts?", answer: "Requirements differ. A provider may use a recognized institution email, separate verification or an application. Read its current requirements, including those for institutions outside the United States. Do not assume that the email suffix alone proves or excludes eligibility." },
      { question: "Are education offers available to teachers or student clubs?", answer: "Some programs include teachers and some have a separate organization application. For example, the Notion help page distinguishes individual education workspaces from student organizations. Check the official route for the group and the people who will own the account." },
      { question: "Will a student discount continue after graduation?", answer: "Do not assume it will. Programs can require renewed verification, change access or move a paid plan to another price. Confirm the provider’s current process and keep a plan to export or transfer your work before the education account becomes unavailable." },
    ],
    articleSlugs: ["student-software-discounts-after-graduation", "compare-saas-pricing-limits"],
  },
  {
    slug: "nonprofit-discounts", navLabel: "Nonprofit software discounts",
    title: "Nonprofit Software Discounts & SaaS Programs",
    description: "Compare nonprofit software discounts for collaboration, project work and productivity. Check organization eligibility, approval routes, seats and renewal costs.",
    heading: "Nonprofit software discounts & SaaS programs",
    answer: "A nonprofit software program normally approves an organization and a specific product or workspace. Compare the provider’s eligibility rules, included users and activation process before counting a saving. Nonprofit status in one country or approval for one vendor does not automatically qualify every account elsewhere.",
    intro: "Choose software around the work your staff and volunteers need to do. A free base allocation, a reduced additional seat and a paid-plan discount solve different budgeting problems. The official application routes below help you check the organization requirements before migrating a team or purchasing an access membership.",
    updatedAt: "2026-10-28",
    programs: [
      { brandSlug: "google-workspace", name: "Google Workspace for Nonprofits", sourceUrl: "https://www.google.com/nonprofits/offerings/workspace/", audience: "Organizations qualifying for Google for Nonprofits in an eligible country", check: "Confirm organization approval, domain activation and the Workspace edition you need; other Google benefits have their own rules." },
      { brandSlug: "asana", name: "Asana for Nonprofits", sourceUrl: "https://asana.com/industry/nonprofit", audience: "Eligible organizations applying for Asana’s nonprofit plan offer", check: "Check the supported plan, organization validation and how the discount is applied to the billed workspace." },
      { brandSlug: "monday", name: "monday.com nonprofit program", sourceUrl: "https://monday.com/w/nonprofits", audience: "Nonprofits qualifying for the provider’s organization program", check: "Separate any base allocation from the price of additional seats and check billing requirements for the selected product." },
      { brandSlug: "airtable", name: "Airtable nonprofit plan", sourceUrl: "https://support.airtable.com/articles/4920135568-applying-for-non-profit-education-and-student-airtable-plans", audience: "Nonprofit organizations requesting an approved workspace plan", check: "Confirm the current eligible plan, workspace and billable collaborators instead of applying an organization-wide percentage to every product." },
      { brandSlug: "jira", name: "Atlassian social-impact licensing", sourceUrl: "https://www.atlassian.com/software/views/social-impact-license-request", audience: "Organizations applying through Atlassian’s current social-impact route", check: "Identify the exact Jira or Confluence cloud product and edition; approval for one product is not a general vendor coupon." },
      { brandSlug: "trello", name: "Trello nonprofit program", sourceUrl: "https://trello.com/en/use-cases/nonprofits", audience: "Qualifying nonprofit workspaces seeking Trello plan pricing", check: "Check approval, the workspace being billed and whether the intended subscription is covered before upgrading." },
      { brandSlug: "smartsuite", name: "SmartSuite organization pricing", sourceUrl: "https://help.smartsuite.com/en/articles/7786139-nonprofit-education-discount-program", audience: "Nonprofit and education organizations using the application route", check: "Request the approved plan and seat quote, and compare it with the team’s required capacity and annual commitment." },
      { brandSlug: "wpforms", name: "WPForms nonprofit application", sourceUrl: "https://wpforms.com/wpforms-coupon-code/", audience: "Qualifying nonprofits using the separate application route", check: "Confirm the approved license, required integrations, website allowance and renewal. Do not add the nonprofit benefit to the public new-license coupon." },
      { brandSlug: "gravity-forms", name: "Gravity Forms nonprofit license", sourceUrl: "https://www.gravityforms.com/nonprofit-license/", audience: "Registered nonprofit organizations applying for the dedicated license", check: "Compare the approved license's three-site scope, included add-ons and multisite exclusion with the organization's actual forms." },
    ],
    steps: [
      { title: "Identify the legal organization and billing owner", text: "Use the organization that will own the software account and receive invoices. Check supported countries and any excluded organization types in the official program. Gather the documentation requested by that provider rather than treating a registration number or a previous vendor approval as universal proof." },
      { title: "Apply before migrating or upgrading", text: "Confirm whether the application supports an existing workspace and whether approval must arrive before purchase. Moving a team first can create a normal paid renewal while approval is unresolved. Keep the program decision and the workspace activation separate in your implementation checklist." },
      { title: "Count the people and features being billed", text: "Differentiate staff, volunteers, guests, viewers and paid collaborators. A program can include a limited allocation while charging for additional users, a higher edition or separate products. Model the team size you expect to keep rather than the smallest possible account used in a headline example." },
      { title: "Keep approval and renewal records", text: "Store the provider’s approval, plan, covered workspace and next review date where another authorized administrator can find them. Check re-validation, partner administration fees and the cost of expanding the team. A free or discounted subscription still needs an owner responsible for permissions and renewal decisions." },
    ],
    comparison: [
      { route: "Included nonprofit allocation", requirement: "Organization approval and the supported edition", costCheck: "Additional seats, storage or products beyond the included allocation" },
      { route: "Discounted paid workspace", requirement: "The approved organization, workspace and plan", costCheck: "Billable collaborators, required billing term and renewal eligibility" },
      { route: "Partner validation route", requirement: "Provider approval and any required validation partner", costCheck: "Administration or membership fees in addition to the software invoice" },
    ],
    faqs: [
      { question: "Do all registered charities qualify for nonprofit SaaS discounts?", answer: "No universal qualification applies. Providers specify supported countries, organization types and documentation. Check the current program for the legal organization that owns the workspace; registration or approval with another vendor is not a guarantee." },
      { question: "Can an existing workspace get nonprofit pricing?", answer: "Sometimes, but the activation rules differ. Confirm whether the provider can apply the approved benefit to the existing billing account before upgrading, cancelling or moving data. Keep a copy of the approval and the workspace to which it applies." },
      { question: "Is a free nonprofit plan always the least expensive option?", answer: "Compare the complete workload. Extra paid seats, required features, administration fees and migration time can change the decision. The relevant comparison is the approved setup your team can use, including what happens if eligibility or team size changes." },
    ],
    articleSlugs: ["build-a-saas-budget-before-buying", "compare-saas-deal-membership-fees"],
  },
];

export const SAVINGS_COLLECTION_LINKS: SavingsLink[] = SAVINGS_COLLECTIONS.map(collection => ({ label: collection.navLabel, href: `/${collection.slug}` }));

export function getSavingsCollection(slug: string) {
  return SAVINGS_COLLECTIONS.find(collection => collection.slug === slug);
}
