import type { DetailedArticle } from "./articles-data";

const taplioPricing = { title: "Taplio pricing and feature comparison", url: "https://taplio.com/pricing" };
const taplioBilling = { title: "Taplio’s plan and billing guide", url: "https://taplio.com/blog/taplio-pricing" };
const nativeScheduling = { title: "LinkedIn Help: Schedule a personal post", url: "https://www.linkedin.com/help/linkedin/answer/a1347212" };
const nativeAnalytics = { title: "LinkedIn Help: View post analytics", url: "https://www.linkedin.com/help/linkedin/answer/a1466099" };
const authoredUpPricing = { title: "AuthoredUp plans and feature comparison", url: "https://authoredup.com/pricing" };
const taplioVisit = { label: "See Taplio’s plans", href: "/go/taplio", affiliate: true };
const beehiivVisit = { label: "Explore beehiiv’s plans", href: "/go/beehiiv", affiliate: true };

const editorial = {
  name: "SaaSFolio editorial",
  role: "Software buying guides",
  avatarLetter: "S",
  bio: "We compare official plan terms and build worked examples to help buyers test their own workflows. The examples use stated assumptions and do not represent customer results.",
};

type CreatorGuide = Omit<DetailedArticle, "id" | "author" | "publishedAt" | "updatedAt" | "readTime" | "tableOfContents"> & { brandSlugs: string[]; publishedAt?: string };

const guides: CreatorGuide[] = [
  {
    slug: "taplio-pricing-starter-vs-growth-vs-pro",
    title: "Taplio Pricing: Starter vs Growth vs Pro",
    summary: "Compare Taplio’s $39 Starter, $69 Growth and $199 Pro plans, annual costs, and a seven-day trial checklist for choosing a tier.",
    subtitle: "Price the LinkedIn work you’ll repeat after the trial ends.",
    category: "Guides & Stacks",
    tags: ["Taplio", "LinkedIn scheduling", "SaaS pricing"],
    brandSlugs: ["taplio"],
    featured: true,
    coverAccent: "#C6FF3D",
    coverImage: { src: "/images/creator/taplio-pricing.webp", alt: "Three software plan cards ascending in tiers with the middle plan highlighted" },
    sections: [
      {
        id: "which-taplio-plan",
        heading: "Which Taplio plan is worth paying for?",
        content: "Taplio lists Starter at $39, Growth at $69 and Pro at $199 per month on monthly billing. Start with LinkedIn’s own scheduler if you already have a reliable drafting process and publish from one profile. Starter makes sense when the queue and analytics save measurable time. Growth is the first tier to test if writing or organizing responses is the bottleneck. Pro needs a separate business case tied to lead generation or a documented limit you expect to hit on Growth.\n\nThe plan details below come from Taplio’s public pricing and billing documentation reviewed on November 21, 2026. The break-even examples use hypothetical workloads. Use billing totals from your account for the final comparison.",
      },
      {
        id: "annual-upfront-cost",
        heading: "Taplio monthly vs annual pricing in dollars",
        content: "On monthly billing, a full year costs $468 for Starter, $828 for Growth or $2,388 for Pro, before taxes. Taplio’s billing guide quotes annual equivalents of $32, $49 and $149 per month, implying upfront totals of $384, $588 and $1,788. That is a difference of $84, $240 and $600 over twelve monthly payments respectively. The percentage saved varies by tier using the published dollar amounts.\n\nIf Growth is relevant for a six-month campaign, six monthly charges total $414. The quoted full-year prepayment is $588. At eight monthly charges the total is $552, while nine reach $621. Annual starts saving money on this example at month nine, provided the public quote still applies and you need no changes mid-term. Keep the payment today and the expected renewal in separate rows of your budget.",
        links: [{ label: "Compare first-term and renewal totals", href: "/savings-calculator" }, { label: "Check sourced Taplio offers", href: "/discounts/taplio" }],
      },
      {
        id: "starter-scheduling-analytics",
        heading: "Starter: pay for a faster publishing routine",
        content: "Taplio positions Starter around LinkedIn scheduling and core analytics. LinkedIn already provides personal-post scheduling and per-post analytics. To see whether Starter adds value, batch three posts and time the work from approved draft to confirmed queue. At the end of the week, pull one report covering impressions, relevant comments and clicks where you can track them. Include time spent opening accounts, checking the queue and transferring numbers into the spreadsheet you actually use.\n\nAt an internal cost of $60 per hour, Starter needs to save about 39 minutes a month versus your existing setup to cover $39. At 12 posts per month, that is about three minutes and 15 seconds per post. If your team finishes the same work using LinkedIn and a shared document, put the budget toward topics or editing instead.",
        links: [{ label: "LinkedIn’s personal post scheduler", href: nativeScheduling.url }],
      },
      {
        id: "growth-ai-writing",
        heading: "Growth: count editing time on AI-assisted posts",
        content: "Taplio lists AI drafting and additional engagement and collaboration capabilities on Growth. The monthly premium over Starter is $30. Use one topic you know well and one topic with technical details. Start with the same brief for each tool or process you compare. Time the work through fact checking, rewriting in your voice and obtaining approval. Count the approved posts and replies you would actually publish.\n\nThirty minutes of net time saved each month at $60 per hour covers the upgrade. If raw drafts arrive quickly but the editor has to rewrite them, keep the lower plan and retain your existing writing process. For shared accounts, check who can draft, who can approve and who can publish to the intended LinkedIn profile before changing billing.",
      },
      {
        id: "worked-example",
        heading: "Pro: price the lead workflow before upgrading",
        content: "Pro costs $130 more per month than Growth and adds lead-oriented features and higher AI access according to Taplio. Define a qualified conversation before the trial, such as an inbound discussion with someone who fits your service and has an active project. Track the source in your CRM, and record a separate number for conversations already coming from LinkedIn.\n\nFor an illustration, if one in ten incremental qualified conversations becomes a customer and each customer contributes $400 after delivery costs, each conversation is worth $40 in expectation. You would need about four additional qualified conversations a month to cover the $130 upgrade under those assumptions. If your close rate or contribution is lower, recalculate. The seven-day trial can verify that the workflow exists. Use your own sales data to judge whether the upgrade pays back over a longer cycle.",
      },
      {
        id: "common-mistake",
        heading: "Check which tools Taplio can actually replace",
        content: "A replacement is only worth the cost you can stop paying. If Taplio takes over LinkedIn scheduling but you still need the old tool for Instagram or for client approvals, its full fee stays in the budget. Write down each subscription you can cancel, its remaining billing term and any data or drafts you need to move. Compare the combined cost during the transition with the cost after it.",
      },
      {
        id: "decision-record",
        heading: "Test the tier you’ll keep during the seven-day trial",
        content: "At sign-up, record the plan selected, currency, next charge and the trial end time shown in your account. Taplio describes seven days of Pro access before billing on the chosen tier, so label every feature you use as Starter, Growth or Pro in your notes. Choose a post format you use frequently and schedule it before relying on the queue for anything time-sensitive.\n\nBy day five, check one live post, review its analytics and note which features did enough work to justify payment. If a tool is unnecessary or a requirement remains unresolved, use the billing area before the deadline and keep the cancellation confirmation. If you subscribe, start with the cheapest tier that met your criteria and take a fresh annual quote when the workflow is established.",
        links: [taplioVisit, { label: "Compare Taplio with AuthoredUp for LinkedIn publishing", href: "/articles/taplio-vs-authoredup" }],
      },
    ],
    comparisonTable: {
      afterSection: "which-taplio-plan",
      headers: ["Billing and workflow", "Starter", "Growth", "Pro"],
      rows: [
        { feature: "Monthly payment", values: ["$39", "$69", "$199"] },
        { feature: "Published annual equivalent", values: ["$32/mo · $384/year", "$49/mo · $588/year", "$149/mo · $1,788/year"] },
        { feature: "What earns its keep", values: ["Scheduling and analytics", "AI-assisted writing and engagement", "Lead workflows and higher AI access"] },
        { feature: "Compare against", values: ["LinkedIn’s native tools", "Starter plus your current editor", "Growth plus your current CRM workflow"] },
      ],
    },
    faqs: [
      { question: "Does Taplio Starter include the AI writer?", answer: "Taplio lists AI drafting on Growth and Pro. Check the plan comparison for the specific AI action you need since free tools and a full-access trial have different terms." },
      { question: "Which Taplio price applies after the trial?", answer: "Taplio says billing moves to the tier chosen at sign-up. Confirm the upcoming amount and charge date in your account because the trial exposes Pro features across plans." },
      { question: "When is annual Taplio Growth cheaper?", answer: "Using Taplio’s published $69 monthly plan and $588 annual prepayment, eight monthly payments cost $552 and nine cost $621. Compare your actual quote before prepaying." },
    ],
    sources: [taplioPricing, taplioBilling, nativeScheduling, nativeAnalytics],
    relatedArticlesSlugs: ["taplio-vs-authoredup", "evaluate-ai-software-free-trials", "compare-saas-pricing-limits"],
  },
  {
    slug: "taplio-vs-authoredup",
    title: "Taplio vs AuthoredUp for LinkedIn Publishing",
    summary: "Choose between Taplio, AuthoredUp and LinkedIn’s native tools using drafts, previews, company pages, analytics and a three-post trial test.",
    subtitle: "Use your actual posts and publishing permissions to decide whether an editor, scheduler or wider toolkit fits.",
    category: "Comparisons",
    tags: ["Taplio", "AuthoredUp", "LinkedIn publishing"],
    brandSlugs: ["taplio", "authoredup"],
    coverAccent: "#82c7ff",
    coverImage: { src: "/images/creator/taplio-vs-authoredup.webp", alt: "Two publishing workflows side by side, with a posting queue and a formatted draft preview" },
    sections: [
      {
        id: "quick-pick",
        heading: "Taplio or AuthoredUp: the short answer",
        content: "AuthoredUp Individual is the first paid option to try if you already write your own posts and mainly want previews, saved drafts, company-page publishing and exportable analytics. Taplio Growth is the first Taplio tier to consider if research, first drafts and engagement all take time every week. Use LinkedIn’s own scheduler first if the job is to queue a few posts and read their stats. A tool becomes useful when it removes a specific step you repeat.\n\nThis comparison uses the providers’ public documentation reviewed on November 21, 2026, with a suggested trial exercise. It makes no claim about increased LinkedIn reach. Compare the time and steps needed to publish the same three posts from the same author account.",
      },
      {
        id: "drafting-workflow",
        heading: "Drafts and previews: decide where the friction is",
        content: "AuthoredUp documents a web editor and a LinkedIn browser extension, with formatting, snippets and previews for desktop and mobile. It lists Coauthor as a closed-beta writing feature, so verify access before treating it as part of a purchase. Taplio lists AI writing on Growth and above. It is worth evaluating when the problem is getting a defensible draft ready for review, especially if the same subscription can handle more of your weekly workflow.\n\nPut a 200-word post and a document post into both workflows. Check introductory text before the mobile fold, list indentation, link placement and the correct posting profile. Then ask the person who approves posts to give the same comment in both tools. Record where the reviewer needs an account and whether the final text is easy to recover outside the application.",
        links: [{ label: "See AuthoredUp’s publishing and preview controls", href: authoredUpPricing.url }],
      },
      {
        id: "company-pages-and-accounts",
        heading: "Company pages and agency accounts need different tests",
        content: "AuthoredUp lists managed company pages on every plan, through the connected profile’s permissions, and charges for connected personal profiles. The Business plan starts with three profiles at $14.95 each on monthly billing, or $44.85 minimum. An agency with four connected profiles should budget $59.80 monthly before tax. Count client identities independently of the number of writers, and test the exact page permissions from the account that will publish.\n\nIf Taplio is your first choice for personal profiles, confirm whether the specific company-page workflow you need is supported before signing. Test post author, review permissions, scheduling and post-level metrics independently. LinkedIn also lets eligible page admins schedule supported posts natively. A setup that handles company posts natively and pays for only one personal publishing account may be sufficient for a small team.",
        links: [{ label: "LinkedIn scheduling rules for company-page admins", href: "https://www.linkedin.com/help/linkedin/answer/a1419179/schedule-a-post-for-a-linkedin-page?lang=en" }],
      },
      {
        id: "analytics-exports",
        heading: "Analytics: build the report you actually use",
        content: "AuthoredUp lists historical collection, CSV export and different analytics for personal profiles and company pages. Taplio lists core analytics on Starter. Check the specific date range, field set and export path you need rather than comparing screenshots of dashboards. Any time you move between an article, profile, company page or video, verify that the metric means the same thing in the source you’re reading.\n\nCreate a report with the published URL, format, impressions, comments from target readers and a trackable link when relevant. Keep the observation window consistent across posts. If a team only needs three values each Friday, copy them from the native post view as a baseline. The business reason to upgrade may be fewer manual calculations or consistent exports, even if the underlying audience numbers are identical.",
      },
      {
        id: "worked-example",
        heading: "What $49.05 in monthly savings would take",
        content: "Taplio Growth at $69 per month costs $49.05 more than AuthoredUp Individual at $19.95. At an internal cost of $60 per hour, Growth must save about 49 minutes in a month, or a little over four minutes across each of 12 posts, to cover the price difference on time alone. Include AI editing and review time in that number. If the toolkit replaces a separate subscription, count only the fee you can actually stop paying.",
      },
      {
        id: "common-mistake",
        heading: "Test the post types and identities you actually manage",
        content: "A queued text post from your own profile confirms only that one publishing path. A client’s company page can require different permissions, and document posts may have different scheduling behavior. Check both workflows with the person who will run them, then confirm what the offboarding process removes if that person leaves the account. Include the time it takes to transfer reusable drafts.",
      },
      {
        id: "decision-record",
        heading: "Run this three-post trial before paying",
        content: "Prepare a short personal update, a document post and a post written under an account you manage. Try them as drafts and publish only the approved version in your usual cadence. For each one, record time to an approved draft, ability to preview on mobile, correct author, queue confirmation and access to the report you need. Also test rescheduling and withdrawing a draft, where relevant.\n\nChoose AuthoredUp or the native workflow if all three posts ship smoothly and Taplio saves too little time to cover the difference. Record the account type, feature used, dated plan quote and one reason you would revisit the decision, such as adding a second client to the workflow.",
        links: [{ label: "Break down Taplio Starter, Growth and Pro pricing", href: "/articles/taplio-pricing-starter-vs-growth-vs-pro" }, taplioVisit],
      },
    ],
    comparisonTable: {
      afterSection: "quick-pick",
      headers: ["Decision", "LinkedIn", "AuthoredUp Individual", "Taplio Growth"],
      rows: [
        { feature: "Software cost", values: ["$0 for native publishing", "$19.95/mo", "$69/mo"] },
        { feature: "Best reason to select", values: ["Basic queue and post analytics", "Preview, drafts and company pages", "AI drafting plus engagement features"] },
        { feature: "Company identity", values: ["Eligible page admins can schedule", "Managed pages linked to authorized profile", "Confirm exact account and workflow"] },
        { feature: "What to validate", values: ["Supported formats and manual reporting", "Extension use and analytics exports", "Editing time, plan limits and permissions"] },
      ],
    },
    faqs: [
      { question: "Is AuthoredUp cheaper than Taplio?", answer: "At the public monthly rates reviewed, AuthoredUp Individual costs $19.95 for one connected profile and Taplio starts at $39. For a team, compare the total for all needed profiles and plan features." },
      { question: "Can I schedule LinkedIn posts without either tool?", answer: "Yes. LinkedIn documents native scheduling for personal profiles and eligible company-page admins, with differences in supported post formats." },
      { question: "Which tool should a LinkedIn ghostwriter test first?", answer: "Start with AuthoredUp when preview and draft review are the main requirements. Test Taplio Growth if generating and editing drafts takes enough time to justify its upgrade cost. Verify who can publish before giving access to client accounts." },
    ],
    sources: [authoredUpPricing, { title: "AuthoredUp Individual and Business plan details", url: "https://help.authoredup.com/articles/individual-business-plan-differences" }, taplioPricing, nativeScheduling, nativeAnalytics, { title: "LinkedIn’s company-page post scheduling rules", url: "https://www.linkedin.com/help/linkedin/answer/a1419179/schedule-a-post-for-a-linkedin-page?lang=en" }],
    relatedArticlesSlugs: ["taplio-pricing-starter-vs-growth-vs-pro", "beehiiv-vs-kit-newsletter", "compare-saas-team-seat-costs"],
  },
  {
    slug: "beehiiv-vs-kit-newsletter",
    title: "beehiiv vs Kit for Your First 1,000 Subscribers",
    summary: "Compare beehiiv and Kit for a first newsletter. See free-plan limits, paid upgrades, automation costs and a worked example for 50 paying readers.",
    subtitle: "Match your first newsletter platform to how you’ll publish, automate and earn.",
    category: "Comparisons",
    tags: ["beehiiv", "Kit", "Newsletter platforms"],
    brandSlugs: ["beehiiv", "convertkit"],
    featured: true,
    coverAccent: "#b3a2ff",
    coverImage: { src: "/images/creator/beehiiv-vs-kit.webp", alt: "Newsletter issue and signup form branching into an email sequence and a paid subscription" },
    sections: [
      {
        id: "quick-pick",
        heading: "Choose by what your newsletter sells",
        content: "Choose beehiiv Free for a publication you plan to send regularly and organize around a public archive. Evaluate beehiiv Lite when the publication is ready for paid issues, email automations or its ad monetization tools. Choose Kit’s free plan if you already need audience tags, signup forms and a way to sell access or digital products. Evaluate Kit Creator when welcome sequences and other automations become essential.\n\nAt 1,000 subscribers, both providers have a free starting point. The useful question is which feature forces the first paid bill. A weekly publication, a paid research letter and a creator selling a course can reach that point at different subscriber counts. Plan details were reviewed against the providers’ documentation on November 21, 2026.",
      },
      {
        id: "free-plan-limits",
        heading: "Free plans at 1,000 subscribers",
        content: "beehiiv’s October 2026 plan change renamed Launch to Free, Scale to Lite and Max to Pro. The new Free tier supports up to 2,500 subscribers. Older pricing screenshots may still use the old names, so confirm your tier and renewal amount in the billing area if you already have an account. A free publication gives you room to test a cadence, check the archive and find out which issues actually generate replies.\n\nKit lists up to 10,000 subscribers on Free, with unlimited broadcasts, forms and landing pages, audience tagging and commerce. Its Free plan documentation puts visual automations and sequences on paid plans. If one recurring broadcast, one opt-in form and a paid product cover your workflow, you may be able to stay on free even when you start selling.",
        links: [{ label: "beehiiv’s October rollout and renewal terms", href: "https://www.beehiiv.com/blog/beehiiv-pricing-2026" }, { label: "Kit’s Free plan inclusions", href: "https://help.kit.com/en/articles/16627071-the-kit-free-plan" }],
      },
      {
        id: "automation-cost",
        heading: "When a welcome sequence changes the budget",
        content: "Take the automation you would actually run and define the trigger, emails, delays and exit condition. For a course creator, that might be a signup form, an immediate worksheet, a follow-up two days later and a sales message that skips existing customers. On Kit, tags can help separate those readers, and paid Creator unlocks visual automations and email sequences. Its page quotes $39 monthly at 1,000 subscribers outside the introductory offer reviewed.\n\nOn beehiiv, use the Lite plan documentation to check the specific automation steps and current subscriber-band quote. An editorial publisher may only need a welcome note and a regular issue, while a creator may need branching by source or purchase. Run a test contact through the exact sequence, and test the unsubscribe and existing-customer paths before importing your audience.",
      },
      {
        id: "worked-example",
        heading: "What 50 paying readers change in the math",
        content: "Suppose 50 readers pay $8 each per month, resulting in $400 of gross subscription revenue. At Kit’s stated USD fee of 3.5% plus $0.30 per transaction, processing and platform fees total $29 on those 50 transactions, leaving $371 before taxes and software costs. If a beehiiv account has 0% platform fees on paid subscriptions and pays 2.9% plus $0.30 per USD transaction to Stripe, those transactions cost $26.60, leaving $373.40 before the paid software tier. Confirm your account’s actual processing rate.\n\nUnder these assumptions the fee difference is $2.40 per month. Include any required subscription before deciding that a lower transaction fee saves money. If you stay on Kit Free, the competing paid plan needs to earn its subscription through another feature, such as an archive and subscription workflow you prefer or revenue from eligible ad placements. Model ad income at zero until you know what your account can access and what your publication can sell.",
      },
      {
        id: "common-mistake",
        heading: "Plan the migration beyond the subscriber CSV",
        content: "Before moving a live list, map suppressed subscribers separately so they remain suppressed. Record the archive URLs you need to preserve, the sending domain, automations and any paid subscription relationships. A CSV export helps move records. Checkout, paid entitlements and URL redirects deserve their own migration plan. Where paid access depends on an existing billing account, confirm whether subscriptions can be transferred or readers need to subscribe again.",
      },
      {
        id: "decision-record",
        heading: "Run a two-issue pilot and export before migrating",
        content: "Build a signup page, test on a phone, and send two issues to a small group that agreed to help. Try a reply, unsubscribe and an existing subscriber joining twice. If paid access matters, use the provider’s available test workflow to check the signup, entitlement and cancellation path before selling to readers. Export test subscribers, then inspect what happened to tags, custom fields and statuses. beehiiv also documents a post export.\n\nOnce the pilot passes, keep a decision note with a dated quote for your current list size, the next tier you are likely to reach, the paid feature you would use first and the backup you verified. If the free plan meets the publication’s needs, set the upgrade decision around the feature or subscriber count that triggers it.",
        links: [beehiivVisit, { label: "Check Kit’s plan and subscriber pricing", href: "https://kit.com/pricing" }, { label: "See sourced beehiiv offers", href: "/discounts/beehiiv" }],
      },
    ],
    comparisonTable: {
      afterSection: "quick-pick",
      headers: ["At launch", "beehiiv", "Kit"],
      rows: [
        { feature: "Free list ceiling", values: ["2,500 subscribers", "10,000 subscribers"] },
        { feature: "Core use case", values: ["Issues, public archive and publication growth", "Forms, tags, broadcasts and selling to your list"] },
        { feature: "Automated sequences", values: ["Check the required automation on Lite", "Visual automations and sequences on Creator"] },
        { feature: "Paid subscriptions", values: ["Lite and Pro with 0% platform fee, processing separate", "Available on Free, USD fee 3.5% + $0.30"] },
        { feature: "Exit test", values: ["Export posts and subscriber data", "Export subscribers with tags and fields"] },
      ],
    },
    faqs: [
      { question: "Is beehiiv or Kit free for 1,000 subscribers?", answer: "Both have a free plan that covers 1,000 subscribers. Review automation and monetization requirements independently because they can move a newsletter onto a paid tier earlier than the list limit." },
      { question: "Is beehiiv Scale now called Lite?", answer: "Yes. beehiiv announced in October 2026 that Launch maps to Free, Scale to Lite and Max to Pro. Existing customers should check their own renewal date and quote." },
      { question: "Can you charge for a Kit newsletter on the free plan?", answer: "Kit lists paid subscriptions on Free through its commerce tools. Its USD transaction fee is 3.5% plus $0.30. Review supported payment setup and currency fees before you launch." },
    ],
    sources: [
      { title: "beehiiv’s October 2026 pricing transition", url: "https://www.beehiiv.com/blog/beehiiv-pricing-2026" },
      { title: "beehiiv Help: Plan types and subscriber tiers", url: "https://www.beehiiv.com/support/article/23874462928663-plan-types-and-subscriber-plan-tier-pricing" },
      { title: "beehiiv pricing and payment processing details", url: "https://www.beehiiv.com/pricing" },
      { title: "beehiiv Help: Export posts and subscriber data", url: "https://www.beehiiv.com/support/article/12258595483543-exporting-post-content-or-subscriber-data-from-beehiiv" },
      { title: "Kit pricing and feature matrix", url: "https://kit.com/pricing" },
      { title: "Kit Help: The Free plan", url: "https://help.kit.com/en/articles/16627071-the-kit-free-plan" },
      { title: "Kit Help: Commerce availability and transaction fees", url: "https://help.kit.com/en/articles/4199324-sell-digital-products-with-kit-overview-and-faqs" },
      { title: "Kit Help: Export subscribers", url: "https://help.kit.com/en/articles/2502489-how-to-export-subscribers-in-kit" },
    ],
    relatedArticlesSlugs: ["systeme-io-free-plan-limits", "taplio-vs-authoredup", "build-a-saas-budget-before-buying", "compare-saas-pricing-limits"],
  },
  {
    slug: "systeme-io-free-plan-limits",
    title: "Systeme.io Free Plan Limits: When to Upgrade",
    summary: "See what Systeme.io Free includes for contacts, sales funnels, courses and automation. Find the first limit your launch is likely to hit.",
    subtitle: "Plan the switch around your first course launch, mailing list or automated webinar.",
    category: "Guides & Stacks",
    tags: ["Systeme.io", "Free plan limits", "Sales funnels", "Online courses"],
    brandSlugs: ["systeme-io"],
    publishedAt: "2026-11-22",
    featured: true,
    coverAccent: "#c6ff3d",
    coverImage: { src: "/images/creator/systeme-io-free-plan-limits.webp", alt: "A signup and confirmation flow branches into email and course access" },
    sections: [
      {
        id: "free-plan-answer",
        heading: "Is the Systeme.io free plan enough for your first launch?",
        content: "Systeme.io Free can suit a creator with one course, up to 2,000 contacts and a simple sales funnel. The published plan allows three funnels and one custom domain. The first reasons to upgrade are usually an audience approaching the contact cap, a second course, or a launch that requires more automations than the free tier includes. An evergreen webinar requires the Webinar or Unlimited plan.\n\nWe compared Systeme.io’s public pricing and help documentation on November 22, 2026. The examples below are planning exercises. Confirm the limits and billing quote in your own workspace before committing to a launch date.",
      },
      {
        id: "funnel-and-automation-limits",
        heading: "Count funnels, pages and automation rules separately",
        content: "A funnel can contain several steps. For a first launch, list each page from opt-in to checkout and confirmation, then count the distinct funnels you want to keep active. Include an evergreen lead magnet or a seasonal campaign if you will run either alongside the course launch. A page inside a funnel and a whole new funnel consume different allowances in the pricing table.\n\nWrite a second list for automation. Systeme.io documents rules by trigger and action, and lists workflow capacity separately. An opt-in that enrolls a learner and a separate sales event that sends customers to another path have different requirements. The number of actions you want does not tell you the number of rules you need. Build both paths with test contacts and check which workspace counters change before paying for extra capacity.",
        links: [{ label: "See how Systeme.io automation rules work", href: "https://help.systeme.io/article/140-automation-rules" }],
      },
      {
        id: "course-access-payment",
        heading: "Test the course and checkout before sending launch traffic",
        content: "Systeme.io documents course access after either an opt-in or a purchase. Use the appropriate path when you offer a free preview and a paid course. Test a signup with a fresh address, confirm which lessons it can open, then test a returning subscriber separately. If you enable double opt-in, make sure the contact completes confirmation before you judge whether the associated email or automation fires.\n\nFor a paid subscription, choose when the buyer should get access. The help center documents a setting to wait until the first successful payment. Verify this with your payment provider’s available test setup before accepting live sales. Also check which course assets and contact data you can recover independently of the platform.",
        links: [{ label: "Read Systeme.io’s subscription access options", href: "https://help.systeme.io/article/2145-how-do-you-control-access-to-resources-for-subscriptions" }],
      },
      {
        id: "worked-example",
        heading: "Worked example with 1,650 contacts and a 90-day launch",
        content: "Assume your workspace currently counts 1,650 contacts and each of the next three months adds 140 net contacts. The forecast moves to 1,790, then 1,930, then 2,070. The 2,000-contact limit is crossed in month three. If your campaign could bring in 100 extra contacts in month two, the accelerated scenario reaches 2,030 a month earlier. Set a review date before the campaign starts and budget for the paid plan in that scenario.\n\nNow suppose your count stays at 700 but you want separate destinations for an introductory course and a new paid course. The published course allowance may determine the plan even when contacts fit comfortably. Use the smallest plan that covers both the expected audience and the most demanding workflow. Compare the full annual payment with the cost of using it only through launch season.",
        links: [{ label: "Compare the monthly and annual subscription quotes", href: "/savings-calculator" }],
      },
      {
        id: "common-mistake",
        heading: "Check the limit in your workspace before assuming cleanup solves it",
        content: "Systeme.io’s help center describes restrictions that can affect opt-ins, payments and new automation triggers. Check the displayed count and the provider’s restriction process before relying on any automatic grace period. Export a small, approved contact sample and compare its fields and consent status with what you need to move. Keep your course files, checkout configuration and suppression list in your own records. A contact CSV is only one part of a portable setup.",
      },
      {
        id: "decision-record",
        heading: "Pick Free, Startup or Webinar using a launch rehearsal",
        content: "Start with a representative registration, one email and an access check. Record the contacts counted by the workspace, active funnels, domains, courses and rules or workflows used. Use Free if the complete rehearsal fits and the forecast leaves headroom. Check Startup when contact or funnel limits drive the upgrade. Compare Webinar if scheduling an automated webinar is a launch requirement. Quote Unlimited only when a documented capacity limit actually requires it.\n\nKeep a dated plan quote next to the first limit that would force the change. Schedule a review before the next campaign and before any annual commitment. If all you need is a newsletter, compare a newsletter-first workflow as well.",
        links: [
          { label: "Check the current Systeme.io plans", href: "/go/systeme-io", affiliate: true },
          { label: "See the Systeme.io discount and billing guide", href: "/discounts/systeme-io" },
          { label: "Compare beehiiv and Kit for an email-first launch", href: "/articles/beehiiv-vs-kit-newsletter" },
        ],
      },
    ],
    comparisonTable: {
      afterSection: "free-plan-answer",
      headers: ["Published allowance", "Free", "Startup", "Webinar"],
      rows: [
        { feature: "Contacts", values: ["2,000", "5,000", "10,000"] },
        { feature: "Sales funnels", values: ["3", "10", "50"] },
        { feature: "Automation rules", values: ["1", "10", "100"] },
        { feature: "Custom domains", values: ["1", "3", "10"] },
        { feature: "Evergreen webinars", values: ["Unavailable", "Unavailable", "Included"] },
      ],
    },
    faqs: [
      { question: "Does Systeme.io Free include a custom domain?", answer: "The published Free plan allows one custom domain. Check the domain registration or renewal price separately." },
      { question: "Can I run an evergreen webinar on Systeme.io Free?", answer: "Systeme.io’s help guide lists automated webinars on Webinar and Unlimited. Decide whether the webinar is a required part of your launch before choosing a paid tier." },
      { question: "Can I export my contacts before switching plans?", answer: "Systeme.io documents exporting selected contacts to a CSV from the Contacts page. Keep copies of course materials, settings and consent records separately." },
    ],
    sources: [
      { title: "Systeme.io pricing and plan allowances", url: "https://systeme.io/pricing" },
      { title: "Systeme.io Help: How automation rules work", url: "https://help.systeme.io/article/140-automation-rules" },
      { title: "Systeme.io Help: Evergreen webinar requirements", url: "https://help.systeme.io/article/265-how-to-create-automated-webinars" },
      { title: "Systeme.io Help: Grant free course access", url: "https://help.systeme.io/article/1615-how-to-give-free-access-to-a-course" },
      { title: "Systeme.io Help: Double opt-in by form", url: "https://help.systeme.io/article/271-how-to-set-up-double-opt-in" },
      { title: "Systeme.io Help: Control access to subscription resources", url: "https://help.systeme.io/article/2145-how-do-you-control-access-to-resources-for-subscriptions" },
      { title: "Systeme.io Help: What happens when an account is restricted", url: "https://help.systeme.io/article/1086-what-happens-when-my-account-gets-restricted" },
      { title: "Systeme.io Help: Import and export contacts", url: "https://help.systeme.io/article/238-how-to-import-or-export-a-contact-list" },
    ],
    relatedArticlesSlugs: ["beehiiv-vs-kit-newsletter", "compare-saas-pricing-limits", "build-a-saas-budget-before-buying"],
  },
  {
    slug: "streamyard-vs-riverside-video-podcast",
    title: "StreamYard vs Riverside for Video Podcasts",
    summary: "Compare StreamYard and Riverside for live video podcasts, separate local tracks and editing. Budget for download hours and run a guest rehearsal.",
    subtitle: "Choose based on the broadcast you need to run and the files your editor needs afterward.",
    category: "Comparisons",
    tags: ["StreamYard", "Riverside", "Video podcasts", "Local recording", "Livestreaming"],
    brandSlugs: ["streamyard", "riverside-fm"],
    publishedAt: "2026-11-22",
    featured: true,
    coverAccent: "#9ec8ff",
    coverImage: { src: "/images/creator/streamyard-vs-riverside.webp", alt: "A two-guest studio feed beside separate participant audio tracks" },
    sections: [
      {
        id: "choose-by-deliverable",
        heading: "Which studio suits your video podcast?",
        content: "Start with StreamYard if the finished product is usually a live show and your producer needs destination controls, branded layouts and a cloud replay. Start with Riverside if the main job is recording interviews for editing and you want separate local tracks or a browser editor. Both can record participants locally. The decision turns on the exact plan needed for your broadcast and how often you need to download individual files.\n\nWe compared the providers’ pricing and help documentation on November 22, 2026. The examples are production planning scenarios. Use the actual plan shown in your account and rehearse with the host, guest devices and editor you expect to use.",
      },
      {
        id: "local-vs-cloud-recording",
        heading: "Compare local recording, cloud replays and 4K separately",
        content: "StreamYard requires local recording to be enabled before the show. Its local downloads include separate participant files and leave out the overlays applied to the live production. The cloud mix preserves the on-air layouts and branding. Its documentation lists 4K local tracks on eligible higher tiers with supported hardware, while live output tops out at 1080p. Check each requirement separately when a sponsor expects both a finished replay and editable camera files.\n\nRiverside records high-quality files on each participant’s device, then uploads them to the project. It documents separate MP4 and WAV formats, with resolution and sample rates depending on studio settings and the device. Verify that your editor can align the downloaded tracks, especially if someone arrives late or uses the mobile app. If a guest has to reconnect, keep the reference mix and inspect the joins before deleting source files.",
        links: [{ label: "Check StreamYard’s 4K recording requirements", href: "https://support.streamyard.com/hc/en-us/articles/5860701334420-Does-StreamYard-support-4k-UHD" }, { label: "Check Riverside’s file formats and alignment options", href: "https://support.riverside.com/hc/en-us/articles/5260131045917-Video-and-audio-file-formats-Overview" }],
      },
      {
        id: "live-show-setup",
        heading: "Test real livestream destinations, roles and recovery",
        content: "Write down where the show must go, who owns access to each channel, and who monitors comments. StreamYard lists three destinations on Core and custom RTMP support on the plan table reviewed. Riverside also documents streaming to multiple destinations on eligible plans. Check the intended destination directly. An account can have the right studio subscription while lacking the permission needed to stream to a particular channel.\n\nHave the producer start an unlisted or private rehearsal where the destination supports it. Show a caption, share a slide, change layout, then return the host to camera. Confirm that the replay captures those changes. With a guest, test a brief disconnect, find the upload status for the person who reconnects, and ask the editor to open the resulting files. Do the rehearsal before relying on either service for a scheduled public show.",
      },
      {
        id: "worked-example",
        heading: "How many separate-track download hours do you need?",
        content: "Suppose you produce eight 70-minute interviews and two 90-minute episodes each month. The studio time is 740 minutes, or 12 hours and 20 minutes. If you add a 50-minute rehearsal you want to download and four 35-minute overflow sessions, the total rises to 930 minutes, or 15 hours and 30 minutes. A plan with a 15-hour separate-track allowance would be too small in the busy scenario.\n\nRiverside documents a 15-hour allowance on Pro and counts a session’s duration once, regardless of how many participants it records. Recording and exporting a mixed edit are separate from the allowance for individual high-quality tracks. StreamYard lists unlimited local recordings on Core, while the cloud recording and storage rules have their own limits. Track your peak month and how quickly you download the files. The number of guests still affects editing time and storage, even when it does not multiply subscription hours.",
        links: [{ label: "See how Riverside counts separate track downloads", href: "https://support.riverside.com/hc/en-us/articles/22296539458973-About-download-hours" }],
      },
      {
        id: "common-mistake",
        heading: "Wait for the guest’s upload before ending the session",
        content: "Local capture and file delivery are separate steps. Ask guests to keep the tab or app open until the studio confirms their uploads. Assign the producer to check every participant, screen share and any secondary camera. If a guest leaves early, follow that platform’s recovery guidance with the original device and browser where applicable. Keep a backup recording for time-sensitive sessions when the participants have agreed to it.",
      },
      {
        id: "decision-record",
        heading: "Run a 20-minute rehearsal and give the editor the files",
        content: "Record a short show with a guest on the device they will actually use. Capture a simultaneous screen share, a late arrival, and a deliberate reconnect during the rehearsal. Export the live or cloud mix, separate audio and separate video. Have the editor import the files into their actual editing software and check start alignment, continuity and whether microphone audio remains usable after the connection drops. Save the approved exports outside the studio.\n\nWrite down your required destinations, licensed operators, output resolution, separate-track hours for a busy month and retention budget. Price the cheapest plan on each platform that met the rehearsal criteria. Pick the option your producer and editor can repeat within the release schedule.",
        links: [
          { label: "Explore StreamYard’s studio plans", href: "/go/streamyard", affiliate: true },
          { label: "Check Riverside’s current plans", href: "https://riverside.com/pricing" },
          { label: "See the StreamYard offer and billing guide", href: "/discounts/streamyard" },
        ],
      },
    ],
    comparisonTable: {
      afterSection: "choose-by-deliverable",
      headers: ["Production requirement", "StreamYard", "Riverside"],
      rows: [
        { feature: "First workflow to test", values: ["Live show with branded layouts and replay", "Interview recording and post-production"] },
        { feature: "Separate local tracks", values: ["Enable local capture before starting", "Confirm high-quality downloads for your tier"] },
        { feature: "4K delivery", values: ["Eligible local tracks with supported hardware", "Eligible high-quality tracks with supported settings and hardware"] },
        { feature: "Budget separately", values: ["Destinations, cloud recording and retention", "Separate-track download hours and live plan access"] },
      ],
    },
    faqs: [
      { question: "Can both tools capture separate local audio and video?", answer: "Yes, both document local participant files. Check the studio configuration, plan allowance and guest device before the session." },
      { question: "Does StreamYard broadcast live in 4K?", answer: "StreamYard lists a maximum live resolution of 1080p. Eligible plans can produce 4K local participant tracks with suitable equipment." },
      { question: "Does Riverside multiply download hours by guest count?", answer: "Riverside counts the duration of a session once regardless of participant count. Check the active monthly allowance if the editor needs separate files." },
    ],
    sources: [
      { title: "StreamYard plan and destination comparison", url: "https://streamyard.com/pricing" },
      { title: "StreamYard Help: Local recording and guest uploads", url: "https://support.streamyard.com/hc/en-us/articles/10725401176596-Local-Recording-of-your-Live-Stream" },
      { title: "StreamYard Help: Live and local 4K limits", url: "https://support.streamyard.com/hc/en-us/articles/5860701334420-Does-StreamYard-support-4k-UHD" },
      { title: "StreamYard Help: Stream duration and cloud recording limits", url: "https://support.streamyard.com/hc/en-us/articles/360051856012-How-Many-Hours-Can-I-Stream-and-Record-With-StreamYard" },
      { title: "Riverside plans and pricing", url: "https://riverside.com/pricing" },
      { title: "Riverside Help: Media formats and separate tracks", url: "https://support.riverside.com/hc/en-us/articles/5260131045917-Video-and-audio-file-formats-Overview" },
      { title: "Riverside Help: High-quality local tracks", url: "https://support.riverside.com/hc/en-us/articles/5260109014045-About-high-quality-tracks" },
      { title: "Riverside Help: Separate-track download hours", url: "https://support.riverside.com/hc/en-us/articles/22296539458973-About-download-hours" },
      { title: "Riverside Help: Live streaming to multiple destinations", url: "https://support.riverside.com/hc/en-us/articles/5434275254941-Live-stream-to-multiple-destinations" },
    ],
    relatedArticlesSlugs: ["compare-saas-pricing-limits", "evaluate-ai-software-free-trials", "taplio-vs-authoredup"],
  },
];

const publishedGuides = guides.map(({ brandSlugs, publishedAt = "2026-11-21", ...guide }) => ({
  brandSlugs,
  article: {
    ...guide,
    id: `creator-${guide.slug}`,
    author: editorial,
    publishedAt,
    updatedAt: publishedAt,
    readTime: `${Math.ceil(guide.sections.reduce((total, section) => total + section.content.split(/\s+/).length, 0) / 180)} min read`,
    tableOfContents: guide.sections.map(section => ({ id: section.id, title: section.heading })),
  },
}));

export const CREATOR_BUYING_GUIDES: DetailedArticle[] = publishedGuides.map(({ article }) => article);

export function getCreatorGuidesForBrand(slug: string) {
  return publishedGuides.filter(guide => guide.brandSlugs.includes(slug)).map(({ article }) => article);
}
