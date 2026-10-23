export interface BrandPurchaseChecks {
  eligibility: { label: string; detail: string }[];
  troubleshooting: { problem: string; action: string }[];
}

// Brand-specific buying checks accompany the dated guide. These are questions
// to resolve before paying, rather than assertions that checkout was tested.
export const BRAND_PURCHASE_CHECKS: Record<string, BrandPurchaseChecks> = {
  beehiiv: {
    eligibility: [
      { label: "Subscriber tier", detail: "Set your audience size before comparing Lite or Pro billing. Check the next tier you expect to reach rather than applying a small-list promotion to a larger publication." },
      { label: "Current plan names", detail: "Compare the package shown in your beehiiv account. A code advertised for an older Scale or Max plan needs a current eligibility check." },
      { label: "Promotion duration", detail: "Record whether the saving covers an initial invoice, a limited number of periods or yearly billing, then compare what the next renewal costs." },
    ],
    troubleshooting: [
      { problem: "An older Scale or Max code is rejected", action: "Check the promotion against the Lite or Pro package actually selected. Ask beehiiv whether that historical offer is supported before purchasing." },
      { problem: "The invoice differs from the advertised starting price", action: "Recheck the subscriber selector, billing period and included features. Compare the price at your actual audience size and verify whether a trial is ending." },
    ],
  },
  "predis-ai": {
    eligibility: [
      { label: "Plan-specific annual reduction", detail: "Compare the same Core, Rise or Enterprise+ package on both billing periods. The reduction displayed for one plan should not be assumed to cover every plan." },
      { label: "Credits and brands", detail: "Include the generations, client brands and publishing channels your workflow consumes. Add-ons can change the final invoice even when the base subscription is discounted." },
      { label: "Trial conversion", detail: "Read the card requirement and charge deadline at signup. Decide whether to continue before the trial ends; annual savings do not remove the need to evaluate the content." },
    ],
    troubleshooting: [
      { problem: "There is no separate code for the yearly price", action: "Inspect the selected billing period and annual invoice. The displayed annual reduction is a billing option and does not establish that another public code exists." },
      { problem: "The total rises after choosing more brands or credits", action: "Separate the base package from additional channels, brands and credits. Rebuild the comparison for the complete production workload." },
    ],
  },
  taplio: {
    eligibility: [
      { label: "New versus existing subscription", detail: "The official policy distinguishes entering a code for a new subscription from asking support to review a code for an existing account." },
      { label: "Team or bundle eligibility", detail: "Compare the organization’s licensed seats or the linked Tweet Hunter subscription with ordinary yearly billing. Include every required account in the total." },
      { label: "One eligible reduction", detail: "Taplio’s policy does not combine discounts or change past invoices. Check the upcoming invoice for the single applicable offer." },
    ],
    troubleshooting: [
      { problem: "A new code does not add another reduction", action: "Inspect the discount already on the subscription. Compare the final eligible offers rather than adding their percentages together." },
      { problem: "An existing invoice has not changed", action: "Ask support which future invoice the confirmed offer affects. The policy excludes retroactive changes to invoices already generated." },
    ],
  },
  baremetrics: {
    eligibility: [
      { label: "Revenue band", detail: "Select the package applicable to your business’s recurring revenue. A starting price for a lower band does not establish the quote for a larger business." },
      { label: "Data integrations", detail: "List every billing source to connect and confirm the plan’s integration allowance. Include any separate modules in the quoted package." },
      { label: "Annual package", detail: "Compare monthly and annual invoices for the same revenue profile, integrations and add-ons. Confirm what changes if the business grows during the term." },
    ],
    troubleshooting: [
      { problem: "An advertised entry price does not match the quote", action: "Check revenue eligibility, integration count and the included modules. Compare the quote for your own business rather than a legacy pricing example." },
      { problem: "The expected saving is missing from the full invoice", action: "Separate the subscription reduction from any additional services. Ask the provider to confirm the annual package and renewal amount before committing." },
    ],
  },
  "snov-io": {
    eligibility: [
      { label: "Sales Suite versus other services", detail: "Check whether the promotion covers Sales Suite, LinkedIn Automation or enrichment. A core subscription offer does not establish pricing for the other services." },
      { label: "Credits and recipients", detail: "Match both allowances to the same campaign. Finding or verifying prospects and contacting recipients are different parts of the budget." },
      { label: "Billing commitment", detail: "Compare the invoice for your selected subscription period and allowance, including any service purchased separately." },
    ],
    troubleshooting: [
      { problem: "A Sales Suite offer does not change a LinkedIn charge", action: "Review the service named in the offer. Price LinkedIn slots and enrichment separately unless the promotion explicitly includes them." },
      { problem: "The annual price is lower but the campaign still exceeds budget", action: "Estimate the credits and recipients the workflow will consume. Compare the actual capacity required and any additional service purchases." },
    ],
  },
  ocoya: {
    eligibility: [
      { label: "Social profiles and users", detail: "Count client accounts, networks and collaborators before comparing Starter, Team or Agency billing. Check how the provider counts each connection." },
      { label: "Shared credits", detail: "Estimate creation usage across every person and brand in the account. Compare a typical content cycle rather than assuming a credit equals a finished post." },
      { label: "Trial and tax", detail: "Check the card requirement, automatic billing deadline and applicable VAT. Include these when comparing the first purchase with a yearly option." },
    ],
    troubleshooting: [
      { problem: "The plan total changes after adding client profiles", action: "Recount profiles, users and shared credits against the selected package. Compare the larger workload before evaluating a yearly reduction." },
      { problem: "A trial is mistaken for a continuing free subscription", action: "Check the billing deadline in the account and decide whether to continue before it passes. A trial and a paid-plan discount are separate options." },
    ],
  },
  "systeme-io": {
    eligibility: [
      { label: "Contact and funnel capacity", detail: "Compare the same contact list, funnels, courses and automation requirements on each billing option. Include expected growth after a launch." },
      { label: "Free versus paid access", detail: "Check whether the free package already covers the project. A yearly promotion on a paid plan should be compared with the features you need now." },
      { label: "Migration and payment costs", detail: "Include any overlap with your current stack and separate payment-processor costs. Count savings from cancelling another service only after the migration works." },
    ],
    troubleshooting: [
      { problem: "The expected reduction is absent on a free account", action: "Check whether the offer concerns annual paid billing. Free access has its own limits and does not create a coupon credit to apply later." },
      { problem: "A cheaper plan cannot run the intended launch", action: "Test the signup, email, payment and access workflow. Compare the package that meets the actual limits before choosing a commitment." },
    ],
  },
  smartlead: {
    eligibility: [
      { label: "Software versus managed services", detail: "Select the product you intend to operate. A managed campaign quote and a software subscription cover different responsibilities and should be budgeted separately." },
      { label: "Contacts and sends", detail: "Count stored prospects and monthly sends, including follow-ups. Use the same campaign capacity when comparing annual and monthly billing." },
      { label: "Infrastructure and add-ons", detail: "List domains, mailboxes, verification and workspace features required by the campaign. Check the invoice for each additional service." },
    ],
    troubleshooting: [
      { problem: "The software discount does not reduce the complete outbound bill", action: "Separate the platform subscription from mailboxes, domains and additional services. Confirm which invoice items the promotion names." },
      { problem: "The selected sending capacity is too small", action: "Recalculate the sequence volume with follow-ups and overlapping campaigns, then compare the plan and additional capacity the workflow needs." },
    ],
  },
  streamyard: {
    eligibility: [
      { label: "Individual or business use", detail: "Confirm which plan category covers the organization operating the broadcast. The cheapest individual package should not be assumed to cover company use." },
      { label: "Streaming and recordings", detail: "Compare required destinations, guests, recording quality and storage for the same production. Include the editor’s requirements after the live show." },
      { label: "Event schedule", detail: "Compare a year of access with the months you need for rehearsals, broadcasts and recording downloads. Check cancellation and recording access before choosing a term." },
    ],
    troubleshooting: [
      { problem: "An individual-plan offer does not cover the organization", action: "Ask StreamYard which usage category applies. Compare the appropriate business package instead of buying an ineligible personal plan." },
      { problem: "A discounted package lacks a recording feature", action: "Run a rehearsal and inspect the files the editor needs. Price the package that supports the finished production, including storage and destinations." },
    ],
  },
  anytrack: {
    eligibility: [
      { label: "Websites and sessions", detail: "Count every website and estimate both ordinary and peak campaign traffic. Include the treatment of excess sessions when comparing invoices." },
      { label: "Required integrations", detail: "Map the advertising platform, conversion source and destination for the workflow. Confirm that the selected package supports the complete path." },
      { label: "Annual operating cost", detail: "Compare yearly and monthly billing for the same sites and integrations. Keep overages and implementation work visible in the campaign budget." },
    ],
    troubleshooting: [
      { problem: "The selected discounted plan cannot connect the full funnel", action: "List each site, ad platform and conversion source, then check their availability in the selected package before paying." },
      { problem: "Traffic-related charges offset the annual saving", action: "Model a peak traffic month and inspect the current session-overage rules. Compare the complete invoice at that usage level." },
    ],
  },
  mailerlite: {
    eligibility: [
      { label: "Current or Legacy account", detail: "Check the MailerLite account generation and plan actually shown in billing. A code or tutorial for an older package needs a current eligibility check." },
      { label: "Audience and sending", detail: "Use the same subscriber count, monthly messages and required automation capacity when comparing paid packages." },
      { label: "Nonprofit approval", detail: "Apply with official organization documentation before paying and check which purchase the provider has approved. Do not add annual and nonprofit percentages together." },
    ],
    troubleshooting: [
      { problem: "The nonprofit reduction is not visible", action: "Check whether support has approved the organization and applied the account benefit. Confirm the next eligible purchase before completing checkout." },
      { problem: "A historical coupon names a different plan", action: "Compare the offer’s account generation, package and billing term with the current invoice. Ask support whether the promotion still applies." },
    ],
  },
  convertkit: {
    eligibility: [
      { label: "Kit versus older ConvertKit offers", detail: "Use the current Kit package and written promotion terms. A former product name in an old review does not establish present eligibility." },
      { label: "Subscriber tier", detail: "Compare current and expected list sizes. Confirm the billing treatment when the audience grows or shrinks during the commitment." },
      { label: "Existing account billing", detail: "Inspect Account & Billing for the available annual switch and any promotion already on the subscription before choosing another offer." },
    ],
    troubleshooting: [
      { problem: "An old ConvertKit code is rejected", action: "Check its dates, current Kit plan, audience tier and new-customer restrictions. Ask the provider before relying on an obsolete promotion." },
      { problem: "The annual charge differs from a creator’s review", action: "Set your own subscriber tier and inspect the account invoice. Historical examples may use a different list size or package." },
    ],
  },
  notion: {
    eligibility: [
      { label: "Workspace and paid members", detail: "Identify the exact workspace and count the people who need member access. Compare the same collaboration package and any separate usage charges." },
      { label: "Education verification", detail: "Review the official school-email and workspace rules before changing a paid account. Education access is a separate eligibility process." },
      { label: "Nonprofit approval", detail: "Apply for the current nonprofit package and wait for the provider’s confirmation. Older Team or Plus references do not establish the plan now covered." },
    ],
    troubleshooting: [
      { problem: "The education option is missing", action: "Check the main account email, institution and workspace setup against the education help page. Ask Notion to review eligibility before upgrading." },
      { problem: "The organization’s expected discount is absent", action: "Confirm nonprofit approval for the correct workspace and package. Inspect member charges and additional usage separately from the approved seat pricing." },
    ],
  },
  framer: {
    eligibility: [
      { label: "Site and editor charges", detail: "List the paid publishing package, people editing the project and optional features. Compare the full website invoice, including its domain arrangement." },
      { label: "Personal student use", detail: "Use the official application and check enrollment evidence and permitted use. A client’s commercial site should not be assumed to qualify." },
      { label: "Code redemption", detail: "Read the account and new-customer restrictions before buying. Confirm that the issued code can be redeemed on the selected project and purchase." },
    ],
    troubleshooting: [
      { problem: "The coupon entry field is unavailable", action: "Check the student program’s redemption restrictions for existing customers. Ask the provider to confirm the eligible account and checkout before paying." },
      { problem: "A publishing discount does not cover the full project cost", action: "Inspect editor seats, add-ons and domain charges separately. Compare the whole launch and renewal budget for the chosen site." },
    ],
  },
  hostinger: {
    eligibility: [
      { label: "Hosting product", detail: "Match the coupon to the selected web hosting, builder or VPS product. Check exclusions before comparing offers across services." },
      { label: "Purchase term", detail: "Inspect how many months the price prepays and the full amount due. Compare the same commitment length when evaluating a code." },
      { label: "New purchase or renewal", detail: "Read the customer and renewal conditions. Record future hosting, domain and email costs independently of the introductory sale." },
    ],
    troubleshooting: [
      { problem: "Entering another code does not improve the order", action: "Check whether the offer page already applied a coupon. Compare the actual payable total and the product’s promotion rules." },
      { problem: "A monthly equivalent is mistaken for monthly payment", action: "Review the prepaid commitment and the renewal rate. Select a term that fits the project’s operating budget before completing the order." },
    ],
  },
  namecheap: {
    eligibility: [
      { label: "Domain purchase action", detail: "Distinguish registration, transfer and renewal. Match the exact extension and term with the product list attached to the code." },
      { label: "Email or SSL purchase", detail: "Check the particular mailbox plan or certificate named in the promotion. A domain code does not establish a cart-wide reduction." },
      { label: "Code dates", detail: "Read the official monthly promotion dates and any stock or usage conditions. A historical search result is not evidence that a code remains available." },
    ],
    troubleshooting: [
      { problem: "A domain coupon does not change the cart", action: "Check the domain extension, premium status, purchase action and code dates. Try only a current offer that explicitly includes the selected item." },
      { problem: "Only part of the order receives a reduction", action: "Inspect which items the promotion covers. Price registration, business email and SSL separately, and record their individual renewal costs." },
    ],
  },
};
