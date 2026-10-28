import type { SavingsCollectionSlug } from "./savings-collections";

export interface CategorySearchContent {
  title: string;
  heading: string;
  description: string;
  answer: string;
  overview: string;
  decisions: { measure: string; compare: string; risk: string }[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
  articleSlugs: string[];
  collections: SavingsCollectionSlug[];
  updatedAt: string;
}

// Handwritten buying criteria for existing categories. The page URLs stay
// stable; extra keyword variants do not create duplicate category landings.
export const CATEGORY_SEARCH_CONTENT: Record<string, CategorySearchContent> = {
  "ai-tools": {
    title: "AI Tool Discounts, Deals & Free Trials", heading: "AI tool discounts & deals",
    description: "Compare AI tool discounts, sourced offers and free trials. Check generation credits, model access, commercial rights and renewal costs before subscribing.",
    answer: "Compare AI tool offers using the work you can complete: included generations, model access, output rights and paid overages. An attractive monthly equivalent is not a useful saving if the quoted plan excludes the model, resolution or volume your workflow requires.",
    overview: "An AI writing assistant, research tool, coding assistant and video generator can price very different units of work. Write down one representative task and test it within the provider’s trial or free limits where available. For research, inspect citation quality and document limits; for generated media, check resolution, watermarks and commercial use. Keep the evaluation separate from the advertised discount percentage.",
    decisions: [
      { measure: "Usable output", compare: "The same generation length, model and export quality", risk: "A cheaper tier can spend more credits on retries or omit an essential model." },
      { measure: "Credit allowance", compare: "Reset period, rollover and overage or top-up rules", risk: "Unused credits may expire, while a busy month can require another purchase." },
      { measure: "Publication and team use", compare: "Commercial rights, seats, workspace permissions and data controls", risk: "Personal or education access may not fit a client or production workflow." },
    ],
    checklist: ["Run a sample task before choosing an annual commitment.", "Separate a temporary trial allowance from recurring paid capacity.", "Compare the next renewal and any credit top-ups with your expected workload."],
    faqs: [
      { question: "Can I get an AI tool discount without a coupon code?", answer: "Some providers use annual billing or eligible education and startup routes instead. Open the brand guide for recorded options and compare the same model access and credit allowance. A free plan or trial is listed separately from a paid discount." },
      { question: "Do discounted AI subscriptions include unlimited generations?", answer: "Do not assume unlimited use. Check the plan’s credit accounting, fair-use rules, available models and output settings at the provider. Compare the capacity needed for your tasks before treating an advertised percentage as a lower total cost." },
    ],
    articleSlugs: ["compare-saas-pricing-limits", "find-and-use-saas-coupon-codes"], collections: ["student-discounts", "coupon-codes"], updatedAt: "2026-10-28",
  },
  marketing: {
    title: "Marketing Software Deals & Email Tool Discounts", heading: "Marketing software deals & discounts",
    description: "Compare marketing software deals for newsletters, email and social content. Check contact tiers, send limits, account seats and annual renewal costs.",
    answer: "Compare marketing software discounts at your expected audience size and publishing volume. Email tools may bill by contacts or sends, while social tools can charge for channels, brands or team members. A saving at today’s smallest tier may disappear as the campaign grows.",
    overview: "Start with the campaign you need to run, not a bundle of unrelated marketing features. For newsletters, record subscribers, monthly sends and required automation. For social publishing, count profiles, brands and collaborators. Include the features needed to move an existing audience, such as export, templates and integrations, before comparing an annual offer with a monthly plan.",
    decisions: [
      { measure: "Audience and sends", compare: "The same contact band, monthly volume and automation", risk: "Subscriber growth or a large campaign can move the account into another tier." },
      { measure: "Publishing workload", compare: "Brands, connected channels, scheduled posts and collaborators", risk: "A discounted individual plan may not include the client accounts your team manages." },
      { measure: "Migration and renewal", compare: "Import support, integrations and the next billing amount", risk: "An introductory period can end before an annual campaign has paid for the switch." },
    ],
    checklist: ["Price both your current audience and a realistic growth tier.", "Check whether required automation and exports are included.", "Include partner access fees and the subscription price after the promotion."],
    faqs: [
      { question: "How should I compare email marketing software discounts?", answer: "Use equivalent contact counts, send volume, automations and billing periods. Check what happens when your list crosses a tier and whether imports or add-ons cost more. The source and brand guide distinguish an actual promotion from ordinary plan pricing." },
      { question: "Does an annual marketing plan mean the discount lasts forever?", answer: "No. Check the approved promotional period and the next renewal. An annual quote can require an upfront commitment even when it is advertised as a monthly equivalent; introductory or partner benefits may end sooner." },
    ],
    articleSlugs: ["compare-saas-pricing-limits", "compare-saas-deal-membership-fees"], collections: ["startup-deals", "coupon-codes"], updatedAt: "2026-10-28",
  },
  "crm-sales": {
    title: "CRM Software Discounts & Sales Tool Deals", heading: "CRM software discounts & sales tool deals",
    description: "Compare CRM software discounts and sales tool offers. Check paid users, contact limits, enrichment credits and the cost of the required workflow.",
    answer: "Compare CRM and sales-tool offers using the complete sales workflow: paid users, contact records, enrichment, outreach volume and reporting. A discounted base seat does not necessarily include the data, automation or communication capacity your team needs to use it.",
    overview: "Separate customer relationship management from prospecting and outreach when building the quote. The CRM may cover pipeline records while a separate product supplies contact information or sends email. Check the actual hand-off between tools, the permissions each user needs and the cost of expanding the team. Trial access can help test the workflow, but it does not establish a paid-plan discount.",
    decisions: [
      { measure: "Users and access", compare: "Paid sales users, administrators and required reporting permissions", risk: "A low starting price may apply to a smaller role or a different product edition." },
      { measure: "Data capacity", compare: "Contact records, enrichment credits and export limits", risk: "Additional data or export capacity can be billed outside the advertised seat price." },
      { measure: "Outreach workflow", compare: "Sending limits, required accounts and integration costs", risk: "A bundle can contain tools you already pay for or omit a required connector." },
    ],
    checklist: ["Quote the complete team and the roles they require.", "Distinguish monthly data credits from stored CRM contacts.", "Confirm onboarding costs and the later program-year price."],
    faqs: [
      { question: "Are startup CRM offers available to existing customers?", answer: "The provider sets that restriction. Check previous-payment, workspace and partner rules before changing an existing subscription. Keep an unapproved startup benefit out of your confirmed software budget." },
      { question: "Do sales-tool coupons reduce enrichment and outreach costs too?", answer: "Only if the published terms cover those charges. Check the eligible product, credits, accounts and renewal period rather than applying a headline reduction to the entire sales stack." },
    ],
    articleSlugs: ["startup-software-credits-and-renewal-costs", "build-a-saas-budget-before-buying"], collections: ["startup-deals", "coupon-codes"], updatedAt: "2026-10-28",
  },
  "dev-tools": {
    title: "Developer Tool Discounts, Credits & Software Deals", heading: "Developer tool discounts & credits",
    description: "Compare developer tool discounts, startup credits and trials. Check API usage, projects, CI capacity, observability limits and paid overages.",
    answer: "Evaluate developer tool discounts against production usage, not only the first seat or a temporary credit balance. Projects, events, API requests, build minutes and retention can change the bill. Model the required workload before and after credits expire.",
    overview: "Choose a representative development or production environment and identify which activity creates charges. An observability tool, API backend and coding assistant measure different things. Check retention and export alongside raw capacity, and decide who owns the organization and its billing settings. A student benefit and a startup program can also have different rules for the same provider.",
    decisions: [
      { measure: "Metered workload", compare: "Events, requests, build time or other billable units", risk: "A small trial does not reveal the cost of a busy production day." },
      { measure: "Data and environments", compare: "Retention, projects, environments and export", risk: "Required history or an extra production environment may need a higher plan." },
      { measure: "Program credit", compare: "Covered services, approved balance, expiry and overages", risk: "Credit remaining in the account can still be unusable for an excluded service." },
    ],
    checklist: ["Measure one representative workload and a growth case.", "Set a reminder before credits or temporary access end.", "Check ownership and permissions before activating a partner benefit."],
    faqs: [
      { question: "Are developer startup credits a recurring discount?", answer: "Not necessarily. A finite balance or limited period can end while the project keeps running. Confirm the covered services, credit expiry and overage behavior, then budget for the normal paid workload." },
      { question: "Can students use developer tool benefits for a team project?", answer: "Read the individual provider and partner terms. Student verification does not automatically license every organization, production project or team member. Check the education route and account ownership before activation." },
    ],
    articleSlugs: ["startup-software-credits-and-renewal-costs", "student-software-discounts-after-graduation"], collections: ["startup-deals", "student-discounts"], updatedAt: "2026-10-28",
  },
  design: {
    title: "Design Software Discounts & Creative Tool Deals", heading: "Design software discounts & creative tool deals",
    description: "Compare design software discounts, creative tool trials and education offers. Check editors, commercial use, exports, assets and renewal commitments.",
    answer: "Compare design software offers around the people creating work and the rights needed to publish it. Check editor seats, exports, client hand-off, asset licensing and any annual commitment. An education account or free viewer does not automatically replace the paid creator plan your workflow requires.",
    overview: "A design editor, website builder and video creation tool can sit in the same creative workflow while charging for different features. Identify where the final work is stored, exported or published, and confirm who can make changes. For a student or nonprofit route, check the permitted account and project use rather than assuming the advertised benefit covers client work.",
    decisions: [
      { measure: "Creator access", compare: "Editors, viewers, collaborators and client hand-off", risk: "The collaborator role needed for delivery may be a paid seat." },
      { measure: "Output and licensing", compare: "Export quality, watermark removal and asset rights", risk: "A low-cost plan may not permit the output or usage the project requires." },
      { measure: "Publishing commitment", compare: "Hosting, custom domains, storage and subscription term", risk: "Creation access and a published site or asset subscription may renew separately." },
    ],
    checklist: ["Test an actual export and hand-off before subscribing.", "Confirm education or nonprofit eligibility for the intended work.", "Compare the full annual commitment with the displayed monthly payment."],
    faqs: [
      { question: "Are design software student discounts automatically applied?", answer: "Often there is a separate verification or application route. Check the current education page, account type and included products before paying through a standard checkout. Introductory pricing and annual commitment can still apply." },
      { question: "Does a creative tool discount include stock assets and commercial rights?", answer: "Only the provider’s terms can establish that. Check the asset subscription, export settings and permitted use separately from the editor price. Included creation features are not proof that every asset can be used in every project." },
    ],
    articleSlugs: ["student-software-discounts-after-graduation", "lifetime-software-deal-checklist"], collections: ["student-discounts", "nonprofit-discounts"], updatedAt: "2026-10-28",
  },
  analytics: {
    title: "Analytics Software Deals & Tracking Tool Discounts", heading: "Analytics software deals & discounts",
    description: "Compare analytics software deals and tracking tool offers. Check event limits, retention, sites, integrations and the price of your expected traffic.",
    answer: "Compare analytics tool savings at the traffic and retention your team needs. Events, page views, tracked users, connected sites and data history can create different bills. A discount on a starting tier is not a quote for every workload or reporting requirement.",
    overview: "Decide which questions the analytics setup must answer and what data is needed to answer them. A simple traffic dashboard and a product-event pipeline have different collection and storage requirements. Check integrations, export and reporting access before switching tools. Privacy-related marketing terms should also be checked against the provider’s actual data handling and the way you configure the service.",
    decisions: [
      { measure: "Collection volume", compare: "Page views, events or tracked-user definitions", risk: "The same traffic can consume different billable units across providers." },
      { measure: "History and access", compare: "Retention, exports, sites and report-sharing permissions", risk: "A required history window or additional site may change the eligible plan." },
      { measure: "Integration and data use", compare: "Connectors, server-side collection and the stated privacy terms", risk: "A convenient integration may add processing or a separate subscription charge." },
    ],
    checklist: ["Use expected monthly traffic and a peak-period estimate.", "Check how existing history can be exported or retained.", "Separate a trial evaluation from a permanent tracking migration."],
    faqs: [
      { question: "How can I compare analytics discounts fairly?", answer: "Match the collection volume, event definition, retention and number of sites. Include the integrations and reporting access you need, then inspect overage and renewal terms for that exact setup." },
      { question: "Does a privacy-focused analytics offer need no review?", answer: "A marketing label is not a complete data-processing description. Read the provider’s terms and your configuration before sending data. A discount does not establish that a service fits a particular data or consent requirement." },
    ],
    articleSlugs: ["verify-software-privacy-claims", "compare-saas-pricing-limits"], collections: ["startup-deals", "coupon-codes"], updatedAt: "2026-10-28",
  },
  hosting: {
    title: "Web Hosting Deals, Discounts & Promo Codes", heading: "Web hosting deals, discounts & promo codes",
    description: "Compare web hosting deals and source-reported promo codes. Check initial term, renewal, domains, backups and cloud usage before committing.",
    answer: "Compare hosting offers using the total initial payment and the next renewal, plus the resources needed for your site or application. Domain, email, backup and usage charges can sit outside the advertised hosting price. A multi-year introductory rate is different from a repeatable monthly saving.",
    overview: "Separate shared hosting, managed application hosting and metered cloud services before comparing their percentages. Match the site count, storage, expected traffic and support you need. A domain registration code can have its own purchase and renewal rules even when the host sells it in the same checkout. Check the exact product attached to each recorded offer.",
    decisions: [
      { measure: "Initial commitment", compare: "Full payment, contract length and included resources", risk: "A small monthly equivalent can require several years paid upfront." },
      { measure: "Related services", compare: "Domains, email, backups, certificates and migration", risk: "An included first period may become a separate renewal charge." },
      { measure: "Usage and expansion", compare: "Traffic, storage, compute and paid upgrade paths", risk: "Workload growth can change the appropriate hosting class or generate overages." },
    ],
    checklist: ["Match each code to hosting, domain, email or another exact product.", "Record the invoice total and the standard renewal separately.", "Compare a realistic traffic case before using cloud credits as a cost estimate."],
    faqs: [
      { question: "Do hosting promo codes work on domain renewals?", answer: "Do not assume that they do. Codes can apply to a specific product, new registrations, transfers or an initial hosting term. Read the recorded source and checkout conditions for the purchase you intend to make." },
      { question: "Is the largest hosting discount the cheapest plan?", answer: "Compare the actual resource limits, commitment and renewal. A large reduction on a longer term can require more upfront spending or exclude a needed service. The payable total matters more than the headline percentage alone." },
    ],
    articleSlugs: ["find-and-use-saas-coupon-codes", "saas-coupon-renewal-price-checklist"], collections: ["coupon-codes", "startup-deals"], updatedAt: "2026-10-28",
  },
  finance: {
    title: "Billing & Invoicing Software Deals and Discounts", heading: "Billing & invoicing software deals",
    description: "Compare billing and invoicing software deals. Check transaction charges, active customers, integrations and the subscription price after the offer.",
    answer: "Compare billing and invoicing offers using both subscription charges and the activity they support. Transactions, active customers, currencies, integrations and paid features can affect the total. A free trial does not remove payment-processing fees or establish that the product supports every workflow.",
    overview: "Start with the actual invoicing or subscription-billing process: who creates invoices, how payments are collected and what information must move into other systems. Check the provider’s supported features for your intended use. Keep setup and migration decisions separate from a short promotional period so that the software can remain useful after its normal price returns.",
    decisions: [
      { measure: "Billable activity", compare: "Transactions, active customers and recurring-subscription volume", risk: "The quoted base subscription can exclude activity-based charges." },
      { measure: "Required workflow", compare: "Currencies, recurring invoices and accounting integrations", risk: "A needed integration or automation may belong to another plan." },
      { measure: "Operational continuity", compare: "Data export, setup and the regular subscription price", risk: "Changing the billing system twice can outweigh a short introductory benefit." },
    ],
    checklist: ["Obtain a quote for your expected transaction and customer volume.", "Check integration and export before moving live billing data.", "Keep software fees separate from payment-provider charges."],
    faqs: [
      { question: "Does an invoicing software discount reduce transaction fees?", answer: "Only if those fees are explicitly included in the promotion. Compare the subscription, processing arrangement and any volume-based charges separately using the provider’s current terms." },
      { question: "Can I evaluate billing software through a free trial?", answer: "A trial can help inspect the workflow and integration, but its limits and account requirements still apply. Use an appropriate test setup, and verify the paid plan and renewal before moving a live process." },
    ],
    articleSlugs: ["build-a-saas-budget-before-buying", "compare-saas-pricing-limits"], collections: ["startup-deals", "nonprofit-discounts"], updatedAt: "2026-10-28",
  },
  productivity: {
    title: "Productivity Software Discounts & Workspace Deals", heading: "Productivity software discounts & workspace deals",
    description: "Compare productivity software discounts, workspace offers and trials. Check members, guests, storage, AI add-ons and annual renewal costs.",
    answer: "Compare productivity software offers around the workspace you will keep: paid members, guests, storage, search and the automation or AI features needed for daily work. A personal free plan and a discounted shared workspace can provide very different access and ownership.",
    overview: "Map where notes, documents, meetings and decisions will live after the switch. Count the people who must edit rather than only view, and inspect the process for sharing work with clients or volunteers. For an education, startup or nonprofit route, confirm which workspace receives the benefit and whether later additions create paid users.",
    decisions: [
      { measure: "Workspace membership", compare: "Paid members, guest permissions and administrative ownership", risk: "Inviting another editor can create a charge on a shared workspace." },
      { measure: "Content and automation", compare: "Storage, history, integrations and AI allowances", risk: "An AI add-on or retention requirement may sit outside the base plan." },
      { measure: "Account lifecycle", compare: "Exports, program expiry and plan renewal", risk: "Work can remain in an account whose education or startup benefit has ended." },
    ],
    checklist: ["Distinguish individual, student-organization and team workspaces.", "Check editing roles, exports and long-term storage.", "Confirm whether an AI feature renews or meters separately."],
    faqs: [
      { question: "Can nonprofit or student offers cover a whole productivity workspace?", answer: "The approved account and membership rules decide that. Some education routes are for an individual workspace, while organization benefits require a separate application. Check the provider before inviting the full team." },
      { question: "Are AI features included in a productivity software discount?", answer: "Check the current eligible plan and allowance. AI can be an included feature, a metered benefit or a separate add-on. An introductory program can also treat AI access differently from later renewal." },
    ],
    articleSlugs: ["student-software-discounts-after-graduation", "compare-saas-pricing-limits"], collections: ["student-discounts", "nonprofit-discounts"], updatedAt: "2026-10-28",
  },
  security: {
    title: "Security Software Deals, VPN & Password Tool Discounts", heading: "Security software deals & discounts",
    description: "Compare security software deals, VPN offers and password tool trials. Check users, devices, recovery, business features and renewal commitments.",
    answer: "Compare security software savings for the users, devices and recovery process you need. A low introductory price does not show whether a personal account supports business administration, shared credentials or an organization’s required access controls.",
    overview: "Define the job before comparing offers: a VPN, password manager and identity product address different tasks. Inspect supported devices and the process for adding or removing users. For tools handling account access, test the recovery and export options within an appropriate evaluation setup before relying on a long prepaid subscription.",
    decisions: [
      { measure: "Covered people and devices", compare: "Individual, family and business plan permissions", risk: "A household plan may not provide administration or recovery for an organization." },
      { measure: "Access and recovery", compare: "Shared access, account recovery and export", risk: "A low-price tier can omit a workflow needed when a team member leaves." },
      { measure: "Payment term", compare: "Total prepaid cost, refund conditions and renewal", risk: "A long introductory commitment can renew at a different price." },
    ],
    checklist: ["Choose the plan for the actual users and devices.", "Inspect recovery, export and permission removal before committing.", "Read the full initial term and the next renewal amount."],
    faqs: [
      { question: "Is a discounted personal security plan suitable for a business?", answer: "Check the provider’s license and administration features. Personal, family and business products can have different usage and recovery rules. A discounted price alone cannot establish suitability for your organization." },
      { question: "Do VPN discounts apply to renewal?", answer: "An introductory offer may only cover the first billing term. Confirm the full prepaid commitment and the stated next price for the same product and region before paying." },
    ],
    articleSlugs: ["verify-software-privacy-claims", "saas-coupon-renewal-price-checklist"], collections: ["coupon-codes", "nonprofit-discounts"], updatedAt: "2026-10-28",
  },
  ecommerce: {
    title: "Ecommerce Software Deals & Store Tool Discounts", heading: "Ecommerce software deals & store tool discounts",
    description: "Compare ecommerce software deals and checkout tool offers. Check transaction fees, store limits, integrations and the total cost after a trial.",
    answer: "Compare ecommerce software offers using the complete cost of running the store: subscription, transactions, required apps, payments and integrations. A short free period can help test a setup, but it is not a quote for ongoing sales volume or every feature needed to launch.",
    overview: "Write down the product catalog, payment methods and order workflow you intend to support. Check which features belong to the base subscription and which need another app or plan. A smaller starting subscription is useful only if the store can take the required orders and move its data where it needs to go without unexpected extra charges.",
    decisions: [
      { measure: "Orders and payments", compare: "Transaction charges and supported payment arrangements", risk: "Software pricing and payment processing can be separate costs." },
      { measure: "Store capacity", compare: "Products, sites, users and required checkout features", risk: "A needed store or checkout feature may require an upgrade." },
      { measure: "Connected systems", compare: "App subscriptions, exports and fulfillment integrations", risk: "A discounted platform does not necessarily discount its required extensions." },
    ],
    checklist: ["Model subscription and transaction costs for expected sales.", "Test required integrations before a launch commitment.", "Record the trial end and the next recurring payment."],
    faqs: [
      { question: "Do ecommerce software deals include processing fees?", answer: "Check the specific promotion and payment arrangement. The store subscription, payment provider and optional apps may charge separately. Compare the full setup at your expected sales volume." },
      { question: "Is an ecommerce free trial an ongoing software discount?", answer: "No. A trial is temporary access with its own account and billing requirements. Check the paid plan needed for your catalog and integrations before keeping the store on that setup." },
    ],
    articleSlugs: ["compare-saas-pricing-limits", "build-a-saas-budget-before-buying"], collections: ["startup-deals", "coupon-codes"], updatedAt: "2026-10-28",
  },
  "project-management": {
    title: "Project Management Software Discounts & Team Deals", heading: "Project management software discounts & team deals",
    description: "Compare project management software discounts and team offers. Check seat minimums, guests, automations, nonprofit approval and annual billing.",
    answer: "Compare project management offers using the team that needs to edit, automate and report on work. Seat minimums, billing increments, guest roles and automation allowances can matter more than the advertised percentage. A nonprofit or startup application may also apply to one workspace or product.",
    overview: "Map a real project from intake to reporting and identify who must participate at each step. A team can outgrow a free plan because of permissions, history or automation even when the number of tasks remains small. Compare the approved paid setup with existing tools and include the effort of moving templates, integrations and project records.",
    decisions: [
      { measure: "Team billing", compare: "Paid editors, seat minimums and billing increments", risk: "The invoice can cover more seats than the current number of active users." },
      { measure: "Workflow capacity", compare: "Automations, integrations, reporting and project history", risk: "A required automation or report may be limited to a higher edition." },
      { measure: "Organization benefit", compare: "The approved workspace, plan and extra-user pricing", risk: "A base allocation or one-product approval may not cover later expansion." },
    ],
    checklist: ["Quote the actual editing team and the next seat increment.", "Test a complete project workflow during the evaluation.", "Confirm which product and workspace receive an approved organization benefit."],
    faqs: [
      { question: "Do nonprofit discounts cover every project management seat?", answer: "Program designs differ. Check any included allocation, the rate for additional users, billing increments and the supported edition. Organization approval does not establish that every workspace or product is covered." },
      { question: "How should I compare a team discount with a free project plan?", answer: "Use the permissions, reporting, automation and team size you actually need. A free plan is useful only if it supports that workflow. Compare the paid alternatives using the full seat commitment and renewal price." },
    ],
    articleSlugs: ["compare-saas-pricing-limits", "startup-software-credits-and-renewal-costs"], collections: ["startup-deals", "nonprofit-discounts"], updatedAt: "2026-10-28",
  },
};
