import type { DiscountGuideEntry } from "@/lib/data/discount-guide-builder";

// Partner brands added 2026-11-27. Every figure below was read on the provider's
// own pages that day; where a provider page was unreadable or inconsistent, the
// guide says so instead of filling the gap.
const entries: DiscountGuideEntry[] = [
  {
    slug: "julius-ai", name: "Julius AI", url: "https://julius.ai/pricing", reviewedAt: "2026-11-27",
    searchTitle: "Julius AI Discount Code & Plan Pricing",
    meta: "Julius AI discount code PRATHAM50OFFYJ and plan pricing: Free, Plus, Pro and Business tiers, credit-based usage and what to check before you pay.",
    intro: "SaaSFolio's Julius AI partner code is PRATHAM50OFFYJ. Julius lists Free, Plus, Pro and Business tiers, and usage is now metered in monthly credits rather than message counts.",
    summary: "Pick the tier by how much analysis you will run each month, not by the headline price. Julius moved from message limits to credits, and the credits a request uses depend on the model and tools it calls.",
    best: "The lowest Julius AI price available through SaaSFolio is the partner code PRATHAM50OFFYJ, entered at Julius checkout through the partner link; Julius shows the discount it applies before you pay. Start on the Free tier to measure how many credits your real analyses use, then choose the paid tier that covers a busy month.",
    related: ["typingmind", "consensus", "airtable"],
    profile: { isNew: true, categorySlug: "ai-tools", pricingModel: "Freemium", description: "Julius AI analyzes spreadsheets, CSV files and databases through chat, turning questions into charts, statistics and shareable reports.", features: ["AI data analysis", "Charts and visualizations", "Spreadsheet and CSV analysis", "Database connections", "Reports and notebooks"], longDescription: "Julius AI lets you ask questions of your data in plain language. Upload a spreadsheet or connect a data source, ask for a chart, a statistical test or a summary, and Julius writes and runs the analysis for you. Evaluate it on a dataset you already understand, so you can check its output before relying on it for decisions." },
    options: [
      ["Free tier", "Occasional questions about small files", "Monthly credit allowance and which models it includes"],
      ["Plus or Pro", "Regular analysis of business or research data", "Credits used by your typical request at a busy month's volume"],
      ["Business", "Teams that share data connections and results", "Seats, shared workspaces and the security terms you need"],
    ],
    sections: [
      ["How the Julius AI partner code works", "PRATHAM50OFFYJ is a partner code supplied to SaaSFolio through Julius AI's affiliate program. Open Julius through the partner link, choose the plan and billing period you want, and enter the code at checkout. Julius displays the discount the code applies before you confirm payment, so you can see the exact saving on your own invoice. If the code is not accepted for the plan you chose, Julius's checkout is the authority: try the plan the code is meant for, or contact Julius support with the code and plan name."],
      ["Credits replaced message limits", "Julius announced a move from message-based limits to usage credits. A simple question about a small file uses fewer credits than a long multi-step analysis that runs code, builds several charts or calls a more capable model. That makes the cheapest plan the one that fits your real workload. During the first week, run the analyses you will actually repeat, then check the credits consumed in your account before upgrading."],
      ["Choose a tier by monthly volume", "Julius lists a Free tier and paid Plus, Pro and Business tiers. Plus suits individuals who analyze data a few times a week; Pro raises the monthly allowance for heavier individual use; Business adds the collaboration and administration a team needs. Julius's own pages have listed different credit allowances for the same tier, so read the allowance shown on the live pricing page when you buy rather than relying on a screenshot or comparison table."],
      ["Check the output before you trust it", "An AI analyst is fast, but its numbers are only as good as the data and the question. Test Julius on a dataset whose answers you already know, check that it reads columns, dates and currencies correctly, and ask it to show the code or method behind a result. For anything you will publish or base a decision on, keep that check in your workflow even after you subscribe."],
    ],
    redeem: [
      "Open Julius AI through SaaSFolio's partner link and create or sign in to your account.",
      "Choose the Plus, Pro or Business tier and the billing period you want.",
      "Enter PRATHAM50OFFYJ in the promo code field at checkout and confirm the discount shown.",
      "Review the first and renewal charges on the checkout summary before paying.",
    ],
    eligibility: [
      ["Partner code", "PRATHAM50OFFYJ is supplied through Julius AI's affiliate program; Julius decides which plans it applies to."],
      ["Usage", "Paid tiers include monthly credits; heavier analyses and more capable models use more of them."],
      ["Renewal", "Check whether the code's discount applies to the first payment only or to renewals on the checkout summary."],
    ],
    troubleshooting: [
      ["The code is not accepted", "Check the plan and billing period selected, remove other promotions, and contact Julius support with the code if it still fails."],
      ["Credits run out early", "Compare the credits used per analysis in your account and move complex work to a tier sized for a busy month."],
    ],
    notes: [
      "Julius's pricing page lists Free, Plus ($20 a month), Pro ($45 a month) and Business ($450 a month) tiers.",
      "Julius moved usage from message counts to monthly credits; its own pages state different credit allowances for some tiers, so confirm the live allowance at checkout.",
    ],
    faqs: [
      ["What is the Julius AI discount code?", "SaaSFolio's Julius AI partner code is PRATHAM50OFFYJ. Enter it at Julius checkout after opening Julius through the partner link; Julius shows the discount it applies before payment."],
      ["Is Julius AI free?", "Julius has a Free tier with a limited monthly credit allowance. Paid Plus, Pro and Business tiers add more credits, models and team features."],
      ["How much does Julius AI cost?", "Julius lists Plus at $20 a month, Pro at $45 a month and Business at $450 a month. Check the live pricing page for current credit allowances before you buy."],
      ["Does Julius AI still limit messages?", "Julius moved from message limits to usage credits. How many credits a request uses depends on the model and the tools the analysis runs."],
    ],
    sources: [
      { label: "Julius AI pricing", url: "https://julius.ai/pricing" },
      { label: "Julius billing update: messages to usage credits", url: "https://julius.ai/content/billing-update-messages-to-usage-credits" },
      { label: "Julius docs: understanding credits", url: "https://julius.ai/docs/billing/credits-overview" },
    ],
  },
  {
    slug: "cal-com", name: "Cal.com", url: "https://cal.com/pricing", reviewedAt: "2026-11-27",
    searchTitle: "Cal.com Discounts, Free Plan & Teams Pricing",
    meta: "Cal.com pricing and discounts: free plan for individuals, Teams at $12 vs $16 per user on yearly billing, Organizations, and the 14-day trial.",
    intro: "Cal.com is free forever for individuals. The way to pay less on Teams or Organizations is yearly billing: Teams costs $12 per user a month billed yearly versus $16 billed monthly.",
    summary: "Start on the free Individuals plan if you are the only person taking bookings. Move to Teams when you need shared availability, round-robin or routing forms, and compare yearly and monthly billing for the number of people who actually take meetings.",
    best: "The biggest Cal.com saving is not needing a paid plan: the Individuals plan is free with unlimited event types and calendars. For teams, yearly billing brings Teams from $16 to $12 per user a month (a quarter less) and Organizations from $37 to $28. Use the 14-day trial to confirm the team features you need before committing to a year.",
    related: ["reclaim-ai", "motion-calendar", "morgen-calendar"],
    profile: { isNew: false, categorySlug: "productivity", pricingModel: "Freemium", description: "Cal.com is scheduling software: share a booking link and it checks your connected calendars to prevent double bookings, with reminders, payments and video calls built in.", features: ["Booking links and event types", "Calendar sync and availability", "Round-robin and collective scheduling", "Routing forms", "Payments and reminders"], longDescription: "Cal.com turns your calendar availability into booking links that clients and colleagues can use without back-and-forth email. Individuals get unlimited event types and calendars for free; paid plans add team scheduling, routing and administration. Evaluate it with the calendars, video tools and payment provider you already use." },
    savings: [
      { type: "Annual billing", saving: "Teams at $12 per user a month on yearly billing", terms: "Cal.com's pricing page lists Teams at $12 per user per month billed yearly and $16 billed monthly, and Organizations at $28 billed yearly and $37 monthly. Count the people who take bookings before choosing a yearly commitment.", sourceUrl: "https://cal.com/pricing" },
    ],
    options: [
      ["Individuals (free)", "One person sharing booking links", "Whether you need team routing or branding removal"],
      ["Teams", "Small teams with shared or round-robin bookings", "Seats needed and yearly versus monthly billing"],
      ["Organizations", "Companies needing sub-teams, SSO and compliance", "SAML/SCIM, compliance requirements and seat count"],
    ],
    sections: [
      ["Use the free plan before paying", "Cal.com's Individuals plan is free forever and includes one user, unlimited booking links and calendars, notifications, more than 100 app integrations and Stripe or PayPal payments. If you are a freelancer, consultant or founder taking your own meetings, that may be all you need. Set up your real event types and connect your calendars first; upgrade only when a specific team feature becomes necessary."],
      ["When Teams is worth it", "Teams adds shared availability, round-robin and collective event types, managed event types, routing forms, recurring events, analytics and removal of Cal.com branding. These matter when several people share inbound meetings, such as sales calls or support sessions. Teams has a 14-day free trial: invite the people who will take bookings and route real requests during the trial so you can see whether the routing rules fit your process."],
      ["Yearly billing is the discount", "Cal.com does not publish a public coupon code. Its saving is the yearly price: Teams drops from $16 to $12 per user a month, and Organizations from $37 to $28. Multiply the yearly rate by the people who need a paid seat, compare it with twelve monthly payments, and only commit to a year when the team size is stable."],
      ["Organizations and Enterprise", "Organizations is for companies that need unlimited sub-teams, attribute-based routing, a company subdomain, SAML SSO and SCIM, and compliance coverage such as SOC 2, HIPAA and ISO 27001. Enterprise is priced annually through sales and adds dedicated onboarding, an SLA and directory integrations. Ask for a written quote and check which compliance documents are included before you sign."],
    ],
    redeem: [
      "Open Cal.com through SaaSFolio's partner link and create a free Individuals account.",
      "Connect your calendars and create the event types you actually use.",
      "Start the 14-day Teams or Organizations trial if you need team scheduling.",
      "Choose yearly billing for the seats you need and confirm the annual total before paying.",
    ],
    eligibility: [
      ["Free plan", "Individuals is free forever for one user; team features need a paid plan."],
      ["Trial", "Teams and Organizations each list a 14-day free trial."],
      ["Yearly price", "The lower per-user price applies to yearly billing for the selected plan and seats."],
    ],
    troubleshooting: [
      ["You need round-robin but are on the free plan", "Round-robin and collective scheduling are Teams features; start the 14-day trial to test them."],
      ["The yearly total is higher than expected", "Recount paid seats; only people who take bookings need one, and the yearly price applies per seat."],
    ],
    notes: [
      "Official pricing lists Individuals as free forever, Teams at $12 per user a month billed yearly and Organizations at $28 billed yearly; monthly billing costs more per user.",
      "Teams and Organizations each show a 14-day free trial; Enterprise is quoted annually through sales.",
    ],
    faqs: [
      ["Is Cal.com free?", "Yes. Cal.com's Individuals plan is free forever for one user, with unlimited booking links and calendars. Team scheduling features need a paid plan."],
      ["Does Cal.com have a discount code?", "Cal.com does not publish a public coupon code. The main saving is yearly billing: Teams costs $12 per user a month billed yearly instead of $16 monthly."],
      ["How much is Cal.com Teams?", "Teams is $12 per user per month billed yearly, or $16 billed monthly, with a 14-day free trial."],
      ["What is the difference between Cal.com Teams and Organizations?", "Organizations adds unlimited sub-teams, attribute-based routing, a company subdomain, SAML SSO and SCIM, and compliance coverage, at $28 per user billed yearly."],
    ],
    sources: [{ label: "Cal.com pricing", url: "https://cal.com/pricing" }],
  },
  {
    slug: "firecrawl", name: "Firecrawl", url: "https://www.firecrawl.dev/pricing", reviewedAt: "2026-11-27",
    searchTitle: "Firecrawl Discounts, Free Credits & Pricing",
    meta: "Firecrawl pricing and discounts: 1,000 free credits a month, Hobby to Scale plans, up to 20% off annual billing and how scraping credits are counted.",
    intro: "Firecrawl gives every account 1,000 free credits a month with no card. Paid plans run from Hobby at $19 a month to Scale at $749, and annual billing saves up to 20%.",
    summary: "Estimate the pages you will scrape or crawl each month and the formats you need, because JSON extraction costs extra credits per page. Then pick the smallest plan that covers a busy month and compare monthly with annual billing.",
    best: "Start on Firecrawl's free 1,000 monthly credits to measure real usage. For paid use, annual billing is the published discount: 16.7% on Hobby, Standard and Growth, and 20% on Scale. Size the plan by credits per page — 1 for a basic scrape, 5 with JSON extraction — and use pay-as-you-go top-ups for occasional spikes instead of jumping a tier.",
    related: ["zapier", "checkly", "sentry"],
    profile: { isNew: false, categorySlug: "dev-tools", pricingModel: "Freemium", description: "Firecrawl is a hosted API that turns websites into clean, LLM-ready data through scraping, crawling, search and browser automation.", features: ["Scrape and crawl API", "Markdown and JSON extraction", "Web search with scraping", "Site mapping", "Browser interaction"], longDescription: "Firecrawl handles the work of fetching web pages, rendering them and converting them into clean Markdown or structured JSON for AI applications and data pipelines. Evaluate it on the sites you need, check how it handles pages that block bots or require JavaScript, and measure credits per page before choosing a plan." },
    savings: [
      { type: "Annual billing", saving: "Up to 20% off with annual billing", terms: "Firecrawl's pricing page lists annual discounts of 16.7% on Hobby, Standard and Growth and 20% on Scale. Credits reset monthly on most plans; Scale carries unused credits for one month.", sourceUrl: "https://www.firecrawl.dev/pricing" },
    ],
    options: [
      ["Free", "Prototypes and small one-off jobs", "1,000 credits a month and 2 concurrent requests"],
      ["Hobby or Standard", "Side projects and production apps scraping thousands to tens of thousands of pages", "Credits per page, JSON extraction and concurrency"],
      ["Growth or Scale", "High-volume pipelines and AI products", "Monthly page volume, concurrency and credit rollover"],
    ],
    sections: [
      ["How Firecrawl credits are counted", "A basic scrape or crawl costs 1 credit per page, and PDF parsing costs 1 credit per PDF page. Asking for JSON output adds 4 credits per page, so a structured extraction costs 5. Search costs 2 credits per 10 results, and mapping a site costs 1 credit per call. A request that returns no result is not charged, but an error page such as a 403 or 404 still costs a credit. Count the pages and formats in your real job, not just the URLs you start from, because a crawl can discover many more pages than you expect."],
      ["Pick the plan by monthly pages", "Hobby costs $19 a month for 5,000 credits; Standard $99 for 100,000; Growth $399 for 500,000; and Scale $749 for 1,000,000. Concurrency rises with each plan, from 5 requests on Hobby to 100 on Scale, which matters for how fast large crawls finish. If a crawl of 3,000 pages needs JSON output, it uses about 15,000 credits, which is more than Hobby includes. Model a busy month before buying."],
      ["Annual billing is the discount", "Firecrawl does not publish a public coupon code. Its saving is annual billing: Hobby drops to $16 a month, Standard to $83, Growth to $333 and Scale to $599. That is 16.7% off on the first three plans and 20% on Scale. Annual billing makes sense once your monthly volume is stable; credits still reset each month on most plans, so a yearly plan does not let you bank unused credits."],
      ["Handle spikes with top-ups", "Paid plans can add pay-as-you-go credits in $5 increments up to a monthly limit you set. Each $5 buys 1,000 credits on Hobby, 2,000 on Standard, 2,500 on Growth and 5,000 on Scale. For an occasional large job, a top-up is usually cheaper than moving permanently to a larger plan. Set the spending limit so a runaway crawl cannot exceed your budget."],
    ],
    redeem: [
      "Open Firecrawl through SaaSFolio's partner link and create a free account with 1,000 monthly credits.",
      "Run a representative scrape or crawl and check the credits it used.",
      "Choose the plan that covers a busy month at the formats you need.",
      "Select annual billing for the discount and confirm the yearly total, top-up limit, renewal date and how to cancel before paying.",
    ],
    eligibility: [
      ["Free credits", "Every account gets 1,000 credits a month on the Free plan; no card is required."],
      ["Annual discount", "16.7% applies to Hobby, Standard and Growth, and 20% to Scale, on annual billing."],
      ["Rollover", "Unused credits do not roll over on Hobby, Standard or Growth; Scale carries them for one month."],
    ],
    troubleshooting: [
      ["Credits are used faster than expected", "Check whether JSON output (+4 credits per page) or a broad crawl is discovering more pages than planned."],
      ["Blocked or empty pages", "Empty results are not charged, but error pages such as 403 still cost a credit; exclude paths that block automated access."],
    ],
    notes: [
      "Official pricing lists Hobby at $19 a month ($16 billed annually), Standard at $99 ($83), Growth at $399 ($333) and Scale at $749 ($599).",
      "The Free plan includes 1,000 credits a month with no card; annual discounts are 16.7% on Hobby, Standard and Growth and 20% on Scale.",
    ],
    faqs: [
      ["Is Firecrawl free?", "Yes. Firecrawl's Free plan includes 1,000 credits every month, about 1,000 pages, with no card required."],
      ["Does Firecrawl have a discount code?", "Firecrawl does not publish a public coupon code. The published saving is annual billing: 16.7% off Hobby, Standard and Growth, and 20% off Scale."],
      ["How much does Firecrawl cost?", "Hobby is $19 a month, Standard $99, Growth $399 and Scale $749, or $16, $83, $333 and $599 a month on annual billing."],
      ["How many credits does a Firecrawl scrape use?", "A basic scrape or crawl uses 1 credit per page. JSON extraction adds 4 credits per page, and search costs 2 credits per 10 results."],
    ],
    sources: [{ label: "Firecrawl pricing and credit costs", url: "https://www.firecrawl.dev/pricing" }],
  },
  {
    slug: "tradingview", name: "TradingView", url: "https://www.tradingview.com/pricing/", reviewedAt: "2026-11-27",
    searchTitle: "TradingView Discounts & Plan Comparison",
    meta: "TradingView discounts: save up to 17% with annual billing, compare Essential, Plus, Premium and Ultimate limits, and check refunds and data fees.",
    intro: "TradingView's standing discount is annual billing, which saves up to 17%. It also runs seasonal sales on its own sale page, and prices are shown in your local currency.",
    summary: "Choose the plan by the limits you hit — charts per tab, indicators per chart, alerts and historical data — then compare annual with monthly billing. Real-time exchange data is bought separately from the plan.",
    best: "For a lower TradingView price, choose annual billing, which TradingView advertises as saving up to 17%, and pick the lowest plan whose limits fit how you trade. Seasonal sales such as Black Friday can be deeper, but they are time-limited and announced on TradingView's own sale page. Annual plans can be refunded only within 14 calendar days of payment, so test the plan you need first.",
    related: ["baremetrics", "notion", "airtable"],
    profile: { isNew: true, categorySlug: "finance", pricingModel: "Freemium", description: "TradingView is a charting and market-analysis platform with screeners, alerts, broker trading and global market data on web, desktop and mobile.", features: ["Advanced charting", "Technical indicators", "Price and technical alerts", "Stock and crypto screeners", "Broker trading integration"], longDescription: "TradingView combines interactive charts, indicators, screeners and alerts across stocks, crypto, forex and other markets, with a large community sharing ideas and scripts. The free Basic plan covers casual charting; paid plans raise the number of charts, indicators, alerts and historical data you can use. Real-time exchange data is a separate add-on." },
    savings: [
      { type: "Annual billing", saving: "Save up to 17% with annual billing", terms: "TradingView's pricing page advertises savings of up to 17% on annual plans compared with monthly billing. Prices are shown in local currency; refunds are available for annual plans only within 14 calendar days of payment.", sourceUrl: "https://www.tradingview.com/pricing/" },
    ],
    options: [
      ["Basic (free)", "Casual charting with a few indicators", "1 chart per tab, 2 indicators per chart, 3 price alerts"],
      ["Essential or Plus", "Active traders who need more indicators and alerts", "Indicators per chart, alerts and saved layouts"],
      ["Premium or Ultimate", "Heavy multi-chart analysis and second-based data", "Charts per tab, historical data and professional-user status"],
    ],
    sections: [
      ["Pick the plan by the limits you hit", "TradingView's plans differ mainly in limits. Charts per tab rise from 1 on Basic to 2 on Essential, 4 on Plus, 8 on Premium and 16 on Ultimate. Indicators per chart go from 2 to 5, 10, 25 and 50. Active price alerts go from 3 on Basic to 20, 100, 400 and 1,000. Historical bars rise from 5,000 on Basic to 40,000 on Ultimate, and only Premium and Ultimate include second-based data. List the limits you actually run into before upgrading."],
      ["Annual billing is the standing discount", "TradingView advertises that annual billing saves up to 17% compared with paying monthly. Prices are shown in your local currency, so compare the annual and monthly totals on your own pricing page. Annual plans are refundable only if requested within 14 calendar days of payment, so try the features you need on the free plan or during a trial first."],
      ["Seasonal sales are time-limited", "TradingView runs larger seasonal promotions, such as its Black Friday sale, with deeper discounts on longer terms. These are announced on TradingView's own sale page with a countdown and end on a fixed date. If you see a sale, check the plan, term length and renewal price on that page, and remember that the discount usually applies to the purchase term, not to every renewal."],
      ["Market data is separate", "A TradingView plan does not automatically include real-time data for every exchange. Additional real-time and intraday data is bought separately and added to your account. Professional users — for example, those trading on behalf of a firm — can only use the Ultimate plan. Budget for the data feeds you need alongside the plan."],
    ],
    redeem: [
      "Open TradingView through SaaSFolio's partner link and sign in or create a free Basic account.",
      "Compare the plan limits with the charts, indicators and alerts you actually use.",
      "Switch the pricing page to annual billing to see the saving in your local currency.",
      "Add any real-time data you need and confirm the total before paying.",
    ],
    eligibility: [
      ["Annual saving", "The up-to-17% saving applies to annual billing compared with monthly; the exact amount varies by plan and currency."],
      ["Refunds", "Annual plans can be refunded only within 14 calendar days of payment."],
      ["Professional users", "Professional users can only subscribe to the Ultimate plan."],
    ],
    troubleshooting: [
      ["The price differs from another site", "TradingView prices are localized; compare the amount on your own pricing page in your currency."],
      ["Real-time data is missing", "Exchange data is an add-on; add the feeds you need to your account in addition to the plan."],
    ],
    notes: [
      "The pricing page advertises savings of up to 17% with annual billing and shows prices in local currency.",
      "Plan limits rise from 1 chart per tab and 2 indicators on Basic to 16 charts and 50 indicators on Ultimate; real-time exchange data is sold separately.",
    ],
    faqs: [
      ["Does TradingView have a discount?", "Yes. Annual billing saves up to 17% compared with monthly billing. TradingView also runs time-limited seasonal sales, such as Black Friday, on its own sale page."],
      ["Is TradingView free?", "Yes. The Basic plan is free, with 1 chart per tab, 2 indicators per chart and 3 price alerts. Paid plans raise those limits."],
      ["Can I get a refund on TradingView?", "Refunds are available for annual plans only and must be requested within 14 calendar days of payment."],
      ["Which TradingView plan should I choose?", "Choose by the limits you hit: Essential and Plus for more indicators and alerts, Premium and Ultimate for many charts per tab and second-based historical data."],
    ],
    sources: [{ label: "TradingView pricing and plan comparison", url: "https://www.tradingview.com/pricing/" }],
  },
  {
    slug: "deadline-funnel", name: "Deadline Funnel", url: "https://www.deadlinefunnel.com/pricing", reviewedAt: "2026-11-27",
    searchTitle: "Deadline Funnel Discounts & Pricing Plans",
    meta: "Deadline Funnel discounts: save 20% with yearly billing, a 14-day free trial and 30-day money-back guarantee. Compare Start, Create, Accelerate and Scale.",
    intro: "Deadline Funnel saves 20% when you pay yearly, offers a 14-day free trial on any plan, and includes a 30-day money-back guarantee. Plans run from $49 a month ($39 yearly) to $199 ($159 yearly).",
    summary: "Choose the plan by campaigns and leads per month, remembering that one subscriber entering five campaigns counts as five leads. Test your real funnel during the 14-day trial before paying.",
    best: "The best Deadline Funnel discount is yearly billing, which takes 20% off every plan: Start drops from $49 to $39 a month and Create from $99 to $79. Use the 14-day free trial to connect your email platform and test a real campaign, and rely on the 30-day money-back guarantee if it does not fit.",
    related: ["systeme-io", "convertkit", "beehiiv"],
    profile: { isNew: true, categorySlug: "marketing", pricingModel: "Free Trial", description: "Deadline Funnel gives each lead a personal countdown deadline across email, landing and checkout pages for evergreen, launch and flash-sale campaigns.", features: ["Evergreen countdown timers", "Email countdown timers", "Landing and checkout page deadlines", "Campaign automation", "Lead tracking"], longDescription: "Deadline Funnel tracks each lead individually, so an evergreen offer can expire a set time after that person joins, with the same deadline shown in emails, on landing pages and at checkout. It integrates with common email and checkout platforms. Evaluate it with your own funnel and email provider during the free trial." },
    savings: [
      { type: "Annual billing", saving: "20% off with yearly billing", terms: "Deadline Funnel's pricing page shows a 20% saving for paying yearly on every plan, for example Start at $39 a month yearly instead of $49 monthly. All plans include a 14-day free trial and a 30-day money-back guarantee.", sourceUrl: "https://www.deadlinefunnel.com/pricing" },
    ],
    options: [
      ["Start", "Creators running up to 3 campaigns", "1,000 leads a month and 90 days of data history"],
      ["Create or Accelerate", "Businesses with many evergreen funnels", "Unlimited campaigns with 10,000 or 20,000 leads a month"],
      ["Scale", "High-volume launches and large lists", "50,000 leads a month and branding removal"],
    ],
    sections: [
      ["Count leads the way Deadline Funnel does", "Deadline Funnel counts a lead each time a person enters a campaign. One subscriber who enters five campaigns counts as five leads, so a list of 1,000 people running several funnels can use far more than 1,000 leads. Estimate how many campaigns each subscriber will enter in a busy month and size the plan from that number, not from your list size."],
      ["Compare the plans", "Start costs $49 a month and includes 3 campaigns and 1,000 leads a month. Create costs $99 and adds unlimited campaigns, 10,000 leads, social proof, portals, custom colors and branding removal. Accelerate costs $149 for 20,000 leads, and Scale costs $199 for 50,000 leads. Most growing funnels outgrow Start because of its campaign limit before its lead limit."],
      ["Yearly billing is the discount", "Deadline Funnel does not publish a public coupon code. Its saving is yearly billing, which takes 20% off every plan: Start becomes $39 a month, Create $79, Accelerate $119 and Scale $159. Choose yearly once you know which plan your funnels need; the 30-day money-back guarantee gives you a window to change your mind."],
      ["Test during the free trial", "Every plan has a 14-day free trial. Connect your email service, build one real evergreen campaign, and check that the countdown in your emails matches the deadline on your landing and checkout pages. Confirm that expired visitors are redirected where you expect. Once that works end to end, choose the plan and billing period."],
    ],
    redeem: [
      "Open Deadline Funnel through SaaSFolio's partner link and start the 14-day free trial.",
      "Connect your email platform and build one real campaign to test deadlines end to end.",
      "Estimate campaigns and leads per month and pick the matching plan.",
      "Choose yearly billing for the 20% saving and confirm the total, the renewal date and how to cancel before the plan renews.",
    ],
    eligibility: [
      ["Trial", "Any plan can be tried free for 14 days."],
      ["Guarantee", "All plans include a 30-day money-back guarantee."],
      ["Leads", "A lead is counted per campaign entered, so one person in several campaigns counts several times."],
    ],
    troubleshooting: [
      ["Leads run out faster than expected", "Check how many campaigns each subscriber enters; each entry counts as a lead."],
      ["The countdown does not match across pages", "Confirm the same campaign and email integration are used on the email, landing and checkout pages."],
    ],
    notes: [
      "Official pricing lists Start at $49 a month ($39 yearly), Create at $99 ($79), Accelerate at $149 ($119) and Scale at $199 ($159), with 20% saved on yearly billing.",
      "Every plan has a 14-day free trial and a 30-day money-back guarantee.",
    ],
    faqs: [
      ["Does Deadline Funnel have a discount code?", "Deadline Funnel does not publish a public coupon code. Its standing discount is yearly billing, which saves 20% on every plan."],
      ["Does Deadline Funnel have a free trial?", "Yes. Every plan can be tried free for 14 days, and all plans include a 30-day money-back guarantee."],
      ["How much does Deadline Funnel cost?", "Start is $49 a month, Create $99, Accelerate $149 and Scale $199, or $39, $79, $119 and $159 a month on yearly billing."],
      ["How does Deadline Funnel count leads?", "A lead is counted each time a person enters a campaign, so one subscriber in five campaigns counts as five leads."],
    ],
    sources: [{ label: "Deadline Funnel pricing", url: "https://www.deadlinefunnel.com/pricing" }],
  },
  {
    slug: "scribe-mail", name: "Scribe Mail", url: "https://www.scribe-mail.com/pricing", reviewedAt: "2026-11-27",
    searchTitle: "Scribe Mail Discounts & Email Signature Pricing",
    meta: "Scribe Mail discounts: 30% lifetime off for nonprofits, public education and open source, 20% off yearly billing, a free plan and a 14-day trial.",
    intro: "Scribe Mail gives nonprofits, public education institutions and open-source projects a 30% lifetime discount, and saves 20% on yearly billing. It is free for up to 2 users.",
    summary: "Scribe Mail is priced per user who has an assigned email signature, not every synced teammate. Count those users, check whether your organization qualifies for the 30% discount, and compare yearly with monthly billing.",
    best: "If you are a nonprofit, public education institution or open-source project, Scribe Mail's 30% lifetime discount is the biggest saving; organizations with a .org domain get it automatically at checkout. Everyone else saves 20% with yearly billing. Teams of 1 or 2 can use the free plan, and the 14-day trial includes all features for unlimited users with no card.",
    related: ["google-workspace", "microsoft-365", "hiver"],
    profile: { isNew: true, categorySlug: "marketing", pricingModel: "Freemium", description: "Scribe Mail manages company email signatures centrally, with signature banner campaigns, click tracking and an API for deploying signatures to every employee.", features: ["Email signature management", "Signature banner campaigns", "Click and revenue tracking", "Google Workspace and Microsoft 365 sync", "API and webhooks"], longDescription: "Scribe Mail lets IT connect the company email provider once while marketing designs consistent signatures and deploys them to every employee. Signature banners can promote campaigns, with click tracking to measure results. Scribe Mail is a separate product from Scribe (scribehow.com), the process-documentation tool." },
    savings: [
      { type: "Nonprofit discount", saving: "30% lifetime discount for nonprofits, public education and open source", terms: "Scribe Mail's pricing page offers a 30% lifetime discount to nonprofit organizations, public education institutions and open-source projects. Organizations with a .org domain receive it automatically at checkout; others contact Scribe via chat for a discount code.", sourceUrl: "https://www.scribe-mail.com/pricing" },
      { type: "Annual billing", saving: "Save 20% with yearly billing", terms: "The pricing page shows a 20% saving for yearly billing on the per-user Business plan. Paid users are primary email addresses with an assigned signature; plans are non-refundable.", sourceUrl: "https://www.scribe-mail.com/pricing" },
    ],
    options: [
      ["Free", "Teams of 1 or 2 people", "One signature template and the Scribe watermark"],
      ["Business", "Companies from 3 to 99 users", "Users with an assigned signature and yearly versus monthly billing"],
      ["Enterprise", "Organizations from 100 users", "Volume pricing, SSO and audit-log add-ons"],
    ],
    sections: [
      ["Check if you qualify for 30% off for life", "Scribe Mail offers a 30% lifetime discount to nonprofit organizations, public education institutions and open-source projects. If your organization uses a .org email domain, the discount is applied automatically at checkout. Other eligible organizations can ask Scribe for a discount code through the website chat. Because the discount is lifetime, it lowers every renewal, not just the first invoice."],
      ["Count the users you actually pay for", "Scribe Mail charges per user, and a paid user is a primary email address with an assigned signature — not every account synced from your directory. Email aliases do not count. Before buying, decide which people actually need a managed signature, such as customer-facing staff, and assign signatures only to them."],
      ["Yearly billing saves 20%", "For organizations that do not qualify for the lifetime discount, yearly billing is the standing saving at 20% off monthly pricing. Scribe automatically moves accounts past 100 users to its Enterprise pricing, which includes volume discounts. Monthly and yearly plans are non-refundable, so use the trial to confirm the setup first."],
      ["Use the trial to test deployment", "The 14-day free trial includes all features and unlimited users with no card. Connect Google Workspace or Microsoft 365, deploy a signature to a small group, and check how it renders in the mail clients your team uses. Test a banner campaign and its click tracking. Then choose the plan and billing period for the users who need it."],
    ],
    redeem: [
      "Open Scribe Mail through SaaSFolio's partner link and start the 14-day free trial.",
      "Connect your email provider and deploy a test signature to a small group.",
      "If you are a nonprofit, public education institution or open-source project, use a .org email or ask Scribe via chat for the 30% code.",
      "Choose yearly billing for the users who need a signature and confirm the total before paying.",
    ],
    eligibility: [
      ["Lifetime discount", "30% for nonprofits, public education institutions and open-source projects; automatic for .org domains."],
      ["Paid users", "Only primary email addresses with an assigned signature are billed; aliases are free."],
      ["Refunds", "Monthly and yearly plans are non-refundable, so test during the trial."],
    ],
    troubleshooting: [
      ["The 30% discount was not applied", "If your domain is not .org, contact Scribe via chat with proof of eligibility to receive a discount code."],
      ["The bill includes more users than expected", "Remove signatures from accounts that do not need one; only users with an assigned signature are billed."],
    ],
    notes: [
      "The pricing page offers a 30% lifetime discount to nonprofits, public education institutions and open-source projects, applied automatically for .org domains.",
      "Yearly billing saves 20%; the Free plan covers up to 2 users, and the 14-day trial includes all features with no card.",
    ],
    faqs: [
      ["Does Scribe Mail have a nonprofit discount?", "Yes. Scribe Mail gives nonprofits, public education institutions and open-source projects a 30% lifetime discount, applied automatically for .org domains."],
      ["Is Scribe Mail free?", "Yes, for up to 2 users, with one signature template and the Scribe watermark. Paid plans remove the watermark and add more templates and users."],
      ["Does Scribe Mail have a discount code?", "Eligible organizations without a .org domain can ask Scribe via chat for a 30% discount code. Everyone else saves 20% with yearly billing."],
      ["Is Scribe Mail the same as Scribe?", "No. Scribe Mail manages email signatures; Scribe (scribehow.com) is a separate process-documentation product."],
    ],
    sources: [{ label: "Scribe Mail pricing", url: "https://www.scribe-mail.com/pricing" }],
  },
];

export const PARTNER_DISCOUNT_ENTRIES = entries;
