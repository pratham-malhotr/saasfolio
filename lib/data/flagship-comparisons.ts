import type { DetailedArticle } from "./articles-data";

/*
 * Flagship comparison guides.
 * Every price and limit below was read from the provider's own page on
 * 2026-11-27 (see `sources`). Where a provider page conflicts with itself or
 * does not publish a figure, the article says so instead of filling the gap.
 */

const REVIEWED = "November 27, 2026";

const editorial = {
  name: "SaaSFolio editorial",
  role: "Software buying guides",
  avatarLetter: "S",
  bio: "We compare official plan terms and build worked cost examples so buyers can test their own workflow. Examples use stated assumptions; they are not hands-on benchmarks, customer results or checkout tests.",
};

type FlagshipGuide = Omit<DetailedArticle, "id" | "author" | "publishedAt" | "updatedAt" | "readTime" | "tableOfContents"> & { brandSlugs: string[] };

const guides: FlagshipGuide[] = [
  {
    slug: "zapier-vs-make-vs-n8n-pricing",
    title: "Zapier vs Make vs n8n: Which Automation Tool Costs Less?",
    summary: "Compare Zapier tasks, Make credits and n8n executions on one real workflow. See the plan each needs at 500 and 5,000 runs a month, and when self-hosting n8n pays off.",
    subtitle: "The cheapest tool depends on what each one counts — run your workflow through all three billing units first.",
    keyTakeaways: [
      "Zapier bills per task: each successful action step is one task, while triggers, polling, Filter, Formatter, Paths and Delay steps are free.",
      "Make bills per credit: most module actions use one credit, scheduled trigger checks are counted, and router and error-handler modules are free.",
      "n8n bills per execution: one full run of a workflow counts once no matter how many steps it has, so long workflows get relatively cheaper.",
      "In our 500-lead example, Zapier needs 1,050 tasks (the $39/month annual 1,500-task tier), Make needs about 1,900 credits, and n8n needs 500 executions (Starter, €20/month billed annually).",
      "Self-hosted n8n Community Edition has no execution fee, but you pay for the server, backups and updates, and you give up SSO, Git version control and environments.",
    ],
    category: "Comparisons",
    tags: ["Zapier", "Make", "n8n", "Workflow automation", "SaaS pricing"],
    brandSlugs: ["zapier"],
    featured: true,
    coverAccent: "#C6FF3D",
    coverImage: { src: "/images/comparisons/zapier-vs-make-vs-n8n.webp", alt: "Three automation pipelines compared side by side, each counting the same workflow in tasks, credits and executions" },
    sections: [
      {
        id: "quick-answer",
        heading: "Which is cheapest: Zapier, Make or n8n?",
        content: `For short workflows with lots of filtering, Zapier is often cheaper than its headline price suggests, because filters, formatting and triggers do not use tasks. For visual, multi-branch scenarios with a lot of data handling, Make usually gives you the most work per dollar, as long as you avoid frequent scheduled checks. For long workflows with many steps, n8n is usually cheapest, because it charges once per run rather than once per step.\n\nThe headline plan price is the wrong place to start. Each tool counts a different unit: Zapier counts tasks, Make counts credits, and n8n counts executions. The same workflow can cost three very different amounts depending on how many steps it has, how often its trigger checks for data and how many runs stop at a filter. The figures in this guide come from each provider's pricing and documentation pages, reviewed on ${REVIEWED}.`,
      },
      {
        id: "billing-units",
        heading: "Tasks vs credits vs executions: what each tool actually counts",
        content: `Zapier counts a task when it successfully completes a unit of work. Its pricing page says triggers and polling do not count, failed actions do not count, and these built-in tools are free: Formatter, Paths, Filter, Delay, Looping, Sub-Zap, Digest, Storage, Tables and Forms. Code by Zapier and AI by Zapier steps are variable and can cost more than one task.\n\nMake has used credits as its billing unit since August 27, 2025. Its pricing FAQ says most actions consume one credit, while some AI features can use more. Credits are counted when a module reads data from an app or webhook, searches, creates, updates or deletes data, transforms data with built-in tools, aggregates or iterates. Router and error-handler modules are free. Make's operations documentation also counts a trigger once for every check it makes, and each bundle a later module processes as another unit.\n\nn8n counts executions. Its pricing page says an execution is a single run of your entire workflow, regardless of how many steps it contains or how much data it processes. Its documentation refers to production executions, so test runs from the editor are not presented as the billed unit — confirm this for your plan in the usage dashboard.\n\n- Zapier: one task per successful action step; triggers and built-in logic are free.\n- Make: one credit per module action in most cases; scheduled trigger checks count.\n- n8n: one execution per workflow run, whatever the number of steps.`,
      },
      {
        id: "plan-prices",
        heading: "Zapier, Make and n8n plan prices in 2026",
        content: `Zapier's Free plan includes 100 tasks a month, two-step Zaps only, 15-minute polling and no premium apps or webhooks. Professional starts at $19.99 a month billed annually ($29.99 monthly) for 750 tasks, and $39 a month annually ($58.50 monthly) for 1,500 tasks, with multi-step Zaps, webhooks and 2-minute polling. Team starts at $69 a month annually ($103.50 monthly) for 2,000 tasks and 25 users, adding a shared workspace, shared app connections, SAML SSO and 1-minute polling. Zapier describes annual billing as 33% off, and the task allowance resets monthly even on an annual plan. New accounts get a 14-day Professional trial without a card.\n\nMake sells Core, Pro and Teams plans by monthly credit tier, starting at 10,000 credits. We could not verify Make's current dollar figures directly: its pricing table is protected from automated readers, and third-party reports disagree. Quote your tier on Make's pricing page before comparing totals. Make's own help center confirms that from November 6, 2025 extra credits cost 25% more than credits included in a plan, Core is capped at 300,000 credits a month, and Pro scales to 8 million.\n\nn8n Cloud Starter costs €20 a month billed annually for 2,500 executions with 5 concurrent executions. Pro costs €50 a month billed annually for 10,000 executions. Both are hosted by n8n and include unlimited users, active workflows and integrations. Business costs €667 a month billed annually for 40,000 executions, but it is self-hosted only. n8n shows prices in euros and advertises 17% savings for annual billing; monthly prices were not shown on the page we reviewed.`,
        dealCalloutSlug: "zapier-annual-billing",
      },
      {
        id: "worked-example",
        heading: "Worked example: the same lead-routing workflow on all three",
        content: `Here is one realistic workflow. A website form sends each new lead to a webhook. A filter drops personal email addresses. The lead's name is cleaned up, a CRM contact is created, a Slack alert goes to sales and a row is added to a Google Sheet. Assume 500 form submissions a month, with 350 passing the filter.\n\nOn Zapier, the webhook trigger is free and so are the Filter and Formatter steps. Each lead that passes runs three action steps: CRM, Slack and Sheets. That is 350 × 3 = 1,050 tasks a month. The 750-task tier is too small, so the realistic choice is the 1,500-task Professional tier at $39 a month billed annually, or $468 a year. The Free plan cannot run this workflow at all, because it only supports two-step Zaps and does not include webhooks.\n\nOn Make, the webhook trigger counts once per submission: 500 credits. The 350 leads that pass then run four modules each if you clean the name in a separate tool module, which adds 1,400 credits, for about 1,900 credits in total. That fits comfortably inside the 10,000-credit entry tier. Cleaning the name inside the CRM module's field mapping, instead of a separate module, removes one module run per lead.\n\nOn n8n, every submission starts one execution, including the 150 runs that end at the filter. That is 500 executions a month, well inside Starter's 2,500 executions at €20 a month billed annually, or €240 a year.\n\nThese counts follow the providers' published counting rules. They are not measurements from a live account — run a week of real traffic and read each tool's usage page before you commit to a tier.`,
      },
      {
        id: "scale-and-complexity",
        heading: "What changes at 5,000 runs or with a 10-step workflow",
        content: `Multiply the same workflow by ten: 5,000 submissions, 3,500 of them passing the filter. Zapier then needs 10,500 tasks, just above its 10,000-task tier. Make needs about 19,000 credits, above its entry tier. n8n needs 5,000 executions, which moves you from Starter to Pro at €50 a month billed annually. Volume pushes all three up a tier; the question is how fast.\n\nStep count changes the picture more than volume does. Picture a 10-step workflow — a trigger plus nine actions — running 1,000 times a month. Zapier counts up to 9,000 tasks if every action succeeds, Make counts about 10,000 credits including the trigger, and n8n counts 1,000 executions. The longer and more complex the workflow, the more n8n's per-run pricing pulls ahead.\n\nPolling is the hidden cost on Make. A scheduled trigger that checks every 15 minutes runs about 2,880 checks in a 30-day month, and Make's documentation counts every check as an operation, even when nothing new arrives. Use instant webhooks where the app supports them, or lengthen the interval. Zapier does not count polling, so frequent checks cost nothing extra there.`,
      },
      {
        id: "self-hosting-n8n",
        heading: "Is self-hosted n8n really free?",
        content: `n8n's Community Edition is free to self-host and, according to its documentation, includes almost the complete feature set. Registering your email unlocks extra features such as folders and debugging in the editor. There is no per-execution fee, so a busy workflow costs the same as a quiet one.\n\nFree software is not a free service. You pay for the server, storage and backups, and someone has to apply updates, watch disk space and restore the database when something breaks. The Community Edition also leaves out features that teams often need, including SSO, Git-based version control, multiple environments, external secrets, log streaming and workflow sharing through projects. Queue mode for scaling is included.\n\nSelf-hosting makes financial sense when your execution volume would put you on Pro or above, someone on the team is comfortable running a Linux server, and you are prepared to own backups and upgrades. For a small number of important workflows, n8n Cloud or a managed tool is usually cheaper once you count your own time.`,
        links: [{ label: "How to size an n8n VPS by workflows and concurrency", href: "/articles/n8n-vps-sizing-concurrency-backups" }, { label: "Postgres on your VPS vs a managed database", href: "/articles/postgres-on-vps-vs-managed-database" }],
      },
      {
        id: "common-mistake",
        heading: "The common mistake: pricing the average month",
        content: `Most automation budgets are built on an average month and a happy path. The bill is set by the busy month and the edge cases.\n\n- Scheduled checks: on Make, a trigger that polls every few minutes uses units even when nothing new arrives. Switch to webhooks where you can.\n- Variable steps: Zapier's Code and AI steps are not fixed at one task, so a workflow that adds an AI step can cost more per run than its step count suggests.\n- Run time and concurrency: n8n Starter allows 5 concurrent executions and a maximum run time of 5 minutes; Pro raises the run time to 40 minutes. A long-running or bursty workflow can outgrow Starter before it reaches 2,500 executions.\n- Overage settings: Zapier pauses Zaps when tasks run out unless pay-per-task is on, and stops at 3× your allowance even then. Decide in advance whether a paused workflow or a higher bill is the bigger risk.\n\nPrice the tier that covers your busiest expected month, then check each tool's usage page after the first real week.`,
      },
      {
        id: "choose",
        heading: "Which automation tool should you choose?",
        content: `Choose Zapier if non-technical teammates will build and maintain the automations, you rely on a long tail of app integrations, and most of your workflows are short with plenty of filtering and formatting. The Team plan is worth it once several people need shared connections and SSO.\n\nChoose Make if you want a visual builder for branching, data-heavy scenarios and want a low cost per action. Prefer webhooks to polling, and keep scenarios lean so modules do not multiply your credit use.\n\nChoose n8n if your workflows are long, you have developers on the team, or you need control over where your data runs. Start on n8n Cloud, and move to self-hosting only when execution volume and in-house skills justify it.\n\nWhichever you pick, write down the workflow you will run most, count its billable units with the rules above, and price the tier that covers a busy month, not an average one.`,
        links: [{ label: "See sourced Zapier savings", href: "/discounts/zapier" }, { label: "Compare annual vs monthly billing", href: "/savings-calculator" }],
      },
      {
        id: "decision-record",
        heading: "Decision record: test one week before choosing a tier",
        content: `Before you commit to an annual plan, write a short decision record and test against it for one week.\n\n- The workflow you will run most, with its trigger type (webhook or schedule) and number of steps.\n- Expected runs in a busy month, and the share that stops at a filter.\n- The billable units each tool counted in the test week, read from its usage page.\n- The tier that covers a busy month, its annual and monthly price, and the overage rule.\n- Who owns the account, where credentials are stored, and how to export the workflows if you switch.\n\nRevisit the record when you add a workflow with many more steps or switch a trigger from webhook to schedule — those are the changes that move you up a tier.`,
      },
    ],
    comparisonTable: {
      afterSection: "billing-units",
      headers: ["What matters", "Zapier", "Make", "n8n"],
      rows: [
        { feature: "Billing unit", values: ["Task (successful action step)", "Credit (most module actions = 1)", "Execution (one full workflow run)"] },
        { feature: "Free tier", values: ["100 tasks/month, two-step Zaps", "Free plan with a monthly credit allowance", "Self-hosted Community Edition"] },
        { feature: "Entry paid plan", values: ["$19.99/mo annual, 750 tasks", "Core, from 10,000 credits/mo", "€20/mo annual, 2,500 executions"] },
        { feature: "Triggers and polling", values: ["Free", "Each check counted", "Counted per run, not per check"] },
        { feature: "Filters and formatting", values: ["Free built-in tools", "Tool modules count; routers are free", "Included in the run"] },
        { feature: "Overage", values: ["Pay-per-task at 1.25× (annual) or 2.5× (monthly), paused at 3×", "Extra credits cost 25% more than included", "Capped overage on Starter and Pro"] },
        { feature: "Best fit", values: ["Short workflows, non-technical teams", "Visual, data-heavy scenarios", "Long workflows, developers, data control"] },
      ],
    },
    faqs: [
      { question: "Does a Zapier trigger count as a task?", answer: "No. Zapier's pricing page says triggers and polling do not count as tasks. Built-in tools such as Filter, Formatter, Paths and Delay are also free. Only successful action steps count." },
      { question: "Is n8n free to use?", answer: "The self-hosted n8n Community Edition is free and has no per-execution fee, but you pay for hosting, backups and maintenance. n8n Cloud starts at €20 a month billed annually for 2,500 executions." },
      { question: "What is a Make credit?", answer: "Credits have been Make's billing unit since August 27, 2025. Most module actions use one credit, some AI features use more, and router and error-handler modules use none. Make's documentation also counts each scheduled trigger check, even when no new data arrives." },
      { question: "Which is cheapest for a 10-step workflow that runs 1,000 times a month?", answer: "Usually n8n. It counts 1,000 executions, which fits its €20 Starter plan. The same workflow uses up to 9,000 Zapier tasks or about 10,000 Make credits, because both charge for each step." },
      { question: "What happens when I run out of Zapier tasks?", answer: "If pay-per-task is on, your Zaps keep running and extra tasks are billed at 1.25× your plan's task rate on annual billing or 2.5× on monthly billing, up to 3× your plan's allowance. If it is off, Zaps pause until the next billing cycle." },
    ],
    sources: [
      { title: "Zapier plans, task tiers and pay-per-task rules", url: "https://zapier.com/pricing" },
      { title: "Zapier Help: What's included in the Free plan", url: "https://help.zapier.com/hc/en-us/articles/32337438839565-What-s-included-in-Zapier-s-Free-plan" },
      { title: "Make pricing and credit FAQ", url: "https://www.make.com/en/pricing" },
      { title: "Make Help: How operations are counted", url: "https://help.make.com/operations" },
      { title: "Make Help: November 2025 adjustments to plans and pricing", url: "https://help.make.com/upcoming-adjustments-to-plans-and-pricing" },
      { title: "n8n plans and execution pricing", url: "https://n8n.io/pricing/" },
      { title: "n8n Docs: Choose how to use n8n (editions and features)", url: "https://docs.n8n.io/choose-how-to-use-n8n" },
    ],
    relatedArticlesSlugs: ["n8n-vps-sizing-concurrency-backups", "compare-saas-pricing-limits", "build-a-saas-budget-before-buying"],
  },
  {
    slug: "asana-vs-monday-vs-clickup-pricing",
    title: "Asana vs monday.com vs ClickUp: Pricing for a 10-Person Team",
    summary: "Compare Asana, monday.com and ClickUp for a 10-person team: annual cost, automation limits, Gantt charts and nonprofit discounts, with a worked yearly budget.",
    subtitle: "The cheapest seat price is not the cheapest plan once you count automations and Gantt charts.",
    keyTakeaways: [
      "For a 10-person team billed annually, ClickUp Core costs $1,080 a year, Asana Starter $1,318.80 and monday.com Standard $1,440.",
      "monday.com Standard includes only 250 automation actions a month; a team that needs 500 has to move to Pro, which raises the bill to $2,280 a year.",
      "Gantt charts start on Asana Starter, monday.com Standard and ClickUp Core; monday.com Basic and ClickUp Free do not include them as a standing feature.",
      "Nonprofits get the biggest saving on monday.com: the Nonprofit plan gives the first 10 seats free, with 70% off each seat after that, on an annual contract.",
      "Asana gives eligible nonprofits 50% off Starter or Advanced annual plans for as long as they stay; ClickUp has a nonprofit discount page but does not publish the amount.",
    ],
    category: "Comparisons",
    tags: ["Asana", "monday.com", "ClickUp", "Project management", "Nonprofit discounts"],
    brandSlugs: ["asana", "monday", "clickup"],
    featured: true,
    coverAccent: "#C6FF3D",
    coverImage: { src: "/images/comparisons/asana-vs-monday-vs-clickup.webp", alt: "Three project boards side by side with seat counts and an annual cost total for a ten-person team" },
    sections: [
      {
        id: "quick-answer",
        heading: "Which is cheapest for a 10-person team?",
        content: `On list price, ClickUp Core is the cheapest of the three for a 10-person team: $9 per user per month billed yearly, or $1,080 a year. Asana Starter costs $1,318.80 a year, and monday.com Standard costs $1,440. The ranking changes as soon as you need more automations: monday.com Standard caps automation actions at 250 a month, so a busier team ends up on Pro.\n\nFor nonprofits, the order flips. monday.com's Nonprofit plan makes the first 10 seats free, and Asana takes 50% off its paid plans. All figures below come from each provider's pricing and nonprofit pages, reviewed on ${REVIEWED}, and assume annual billing in US dollars.`,
      },
      {
        id: "plan-prices",
        heading: "Asana, monday.com and ClickUp plan prices",
        content: `Asana's free Personal plan is limited to two users. Starter costs $10.99 per user per month billed annually ($13.49 monthly) and includes timeline and Gantt views, unlimited automations, forms and unlimited free guests. Advanced costs $24.99 per user per month annually ($30.49 monthly) and adds portfolios, goals, resource management, approvals and time tracking. Seats are added one at a time up to five users, then in increments of five up to 30 users.\n\nmonday.com's Free plan allows up to two seats and three boards. Basic costs $9 per seat per month billed annually, Standard $12 and Pro $19. Standard adds timeline and Gantt views, guest access and 250 automation and 250 integration actions a month. Pro raises both limits to 25,000 actions a month and adds private boards and time tracking. monday.com shows annual prices; we did not find monthly-billing prices on the page.\n\nClickUp's Free Forever plan includes 60 MB of storage, 100 automation actions a month and five active automation rules, with Gantt charts as a trial. Core costs $9 per user per month billed yearly and includes unlimited storage, unlimited Gantt charts and 1,000 automation actions per workspace per month. Business costs $17 per user per month billed yearly and raises automations to 10,000 a month, with advanced dashboards. ClickUp's page also shows "regular" prices of $12 and $25 beside these figures.`,
      },
      {
        id: "worked-example",
        heading: "Worked example: a 10-person team's first-year budget",
        content: `Assume a 10-person team that needs a shared project board, a timeline or Gantt view for launches, and about 500 automation actions a month for status changes and notifications. Everyone is billed annually.\n\n- ClickUp Core: 10 × $9 × 12 = $1,080 a year. Its 1,000 automation actions a month cover the 500 needed.\n- Asana Starter: 10 × $10.99 × 12 = $1,318.80 a year. Automations are unlimited on Starter.\n- monday.com Standard: 10 × $12 × 12 = $1,440 a year, but its 250-action monthly limit is too small. Pro at 10 × $19 × 12 = $2,280 a year covers it.\n\nOn monthly billing, Asana Starter rises to 10 × $13.49 × 12 = $1,618.80 a year. That $300 difference is the price of being able to cancel at any month end.\n\nThe automation limit is the line item buyers most often miss. Before choosing, count the rules your team will really run — every status change, assignment and notification — and multiply by a busy month's volume.`,
        dealCalloutSlug: "asana-nonprofit-program",
      },
      {
        id: "nonprofit-discounts",
        heading: "Nonprofit discounts compared: Asana, monday.com and ClickUp",
        content: `monday.com has the most generous published nonprofit program. Its Nonprofit plan gives eligible organizations their first 10 seats free, then 70% off each additional seat, sold in lots of five. The plan includes 25,000 automation and 25,000 integration actions a month. It requires a one-year subscription — monday.com says it does not honor monthly plans or discounts on them — and you must reconfirm eligibility every year or pay the full price. Schools, colleges, universities, hospitals, government-managed nonprofits, political and sports organizations are excluded.\n\nAsana gives eligible nonprofits 50% off a Starter or Advanced annual plan, and says the discount lasts as long as you stay with Asana. It accepts 501(c)(3) organizations, K-12 schools, higher-education institutions and public libraries, plus equivalent international designations, and excludes hospitals. Eligibility is checked through Goodstack, which emails a discount code.\n\nClickUp links to a nonprofit discount page from its pricing FAQ, but the page we reviewed does not state the size of the discount, the eligible plans or the eligibility rules. Apply and get the figure in writing before you compare it.\n\nFor a 10-person nonprofit billed annually, that means $0 on monday.com's Nonprofit plan, $659.40 on Asana Starter at 50% off, and an unpublished figure on ClickUp.`,
        dealCalloutSlug: "monday-nonprofit-additional-seats",
      },
      {
        id: "hidden-costs",
        heading: "Guests, AI credits and other costs to check",
        content: `Guests are priced differently on each tool. Asana Starter includes unlimited free guests, and monday.com Basic and above include unlimited free viewers. ClickUp paid plans include a limited number of external guest seats that grows with each paid user — on Core, five for the first paid user and two for each additional one — plus unlimited read-only guests.\n\nAI is metered separately on all three. monday.com lists 1,000 AI credits a month on Basic, 2,000 on Standard and 3,000 on Pro. ClickUp pools Brain credits per user — 1,000 on Core and 1,500 on Business — and sells extra credits at $10 per 10,000. Asana includes a monthly allowance of AI requests and sells extra requests at $0.60 each pay-as-you-go or $0.50 prepaid. If your team will lean on AI features, price the extra credits into the budget.\n\nFinally, check what a downgrade or cancellation does to your data and integrations, and who in your organization owns the billing account.`,
      },
      {
        id: "common-mistake",
        heading: "The common mistake: ignoring seat increments and contract terms",
        content: `Teams usually compare the per-seat price and stop there. Two other rules change the bill.\n\nAsana sells seats in increments of five once a team passes five users, up to 30 users. A 12-person team pays for 15 seats: 15 × $10.99 × 12 = $1,978.20 a year on Starter, not $1,582.56 for 12. monday.com sells additional nonprofit seats in lots of five as well, so check the seat count you will actually be billed for.\n\nContract terms matter just as much. monday.com's nonprofit pricing is only available on a one-year subscription, and eligibility must be reconfirmed every year or the full price applies. Asana's nonprofit discount is on annual plans. Put the renewal date and the reconfirmation step in your calendar on the day you subscribe.`,
      },
      {
        id: "choose",
        heading: "Which project management tool should you choose?",
        content: `Choose ClickUp if price per seat matters most and your team is comfortable with a dense, highly configurable workspace. Core covers Gantt charts and a moderate automation load at the lowest list price of the three.\n\nChoose Asana if you want unlimited automations and free guests on the entry paid plan, a cleaner interface for cross-functional work, or you are an eligible nonprofit that wants a permanent 50% discount.\n\nChoose monday.com if you are an eligible nonprofit — 10 free seats is hard to beat — or if your team prefers its board-first, visual style and can budget for Pro once automations grow.\n\nRun a two-week trial with your real projects on your top choice, count automation actions in that period, and only then commit to an annual plan.`,
        links: [{ label: "Compare SaaS subscriptions at the same team size", href: "/articles/compare-saas-team-seat-costs" }, { label: "Browse nonprofit software discounts", href: "/nonprofit-discounts" }],
      },
      {
        id: "decision-record",
        heading: "Decision record: what to write down before you subscribe",
        content: `Keep a one-page record so the next renewal is a decision, not a surprise.\n\n- Team size today and in 12 months, and the seat count each tool will actually bill.\n- The views you need (timeline, Gantt, dashboards) and the cheapest plan that includes them.\n- Automation actions counted during the trial, multiplied up to a busy month.\n- AI credits used in the trial and the price of extra credits.\n- Nonprofit eligibility evidence, the discount granted in writing, and the reconfirmation date.\n- The export format and who owns the billing account.\n\nIf two tools are close on price, choose the one your team actually used during the trial.`,
      },
    ],
    comparisonTable: {
      afterSection: "plan-prices",
      headers: ["10-person team, annual", "Asana", "monday.com", "ClickUp"],
      rows: [
        { feature: "Entry paid plan", values: ["Starter, $10.99/user/mo", "Basic, $9/seat/mo", "Core, $9/user/mo"] },
        { feature: "Plan with Gantt charts", values: ["Starter", "Standard ($12/seat/mo)", "Core"] },
        { feature: "Automations on that plan", values: ["Unlimited", "250 actions/month", "1,000 actions/month"] },
        { feature: "Yearly cost, 10 users", values: ["$1,318.80", "$1,440 (Standard)", "$1,080"] },
        { feature: "Free plan", values: ["Up to 2 users", "Up to 2 seats, 3 boards", "Unlimited members, 60 MB storage"] },
        { feature: "Nonprofit offer", values: ["50% off Starter or Advanced, annual", "First 10 seats free, then 70% off", "Discount page, amount not published"] },
      ],
    },
    faqs: [
      { question: "Is ClickUp cheaper than Asana?", answer: "On list price, yes. ClickUp Core costs $9 per user per month billed yearly, compared with $10.99 for Asana Starter. For 10 users that is $1,080 a year versus $1,318.80." },
      { question: "Does monday.com have a free plan for nonprofits?", answer: "Yes. monday.com's Nonprofit plan gives eligible organizations their first 10 seats free and 70% off each additional seat. It requires an annual subscription, and eligibility must be reconfirmed every year." },
      { question: "Does Asana offer a nonprofit discount?", answer: "Yes. Asana offers 50% off Starter or Advanced annual plans to eligible nonprofits, K-12 schools, higher-education institutions and public libraries. Eligibility is verified through Goodstack, and the discount lasts while you remain a customer." },
      { question: "Which plan includes Gantt charts for the lowest price?", answer: "ClickUp Core at $9 per user per month billed yearly includes unlimited Gantt charts. Asana includes timeline and Gantt views from Starter, and monday.com from Standard." },
      { question: "How many automations does monday.com Standard include?", answer: "250 automation actions and 250 integration actions per month. Pro raises both limits to 25,000 actions a month." },
    ],
    sources: [
      { title: "Asana plans, seat increments and AI requests", url: "https://asana.com/pricing" },
      { title: "Asana nonprofit discount and eligibility", url: "https://asana.com/nonprofit" },
      { title: "monday.com work management pricing and limits", url: "https://monday.com/pricing" },
      { title: "monday.com nonprofit program eligibility", url: "https://monday.com/nonprofits/eligibility" },
      { title: "monday.com Nonprofit plan pricing", url: "https://monday.com/nonprofits/pricing" },
      { title: "ClickUp plans, automations and Brain credits", url: "https://clickup.com/pricing" },
      { title: "ClickUp nonprofit discount page", url: "https://clickup.com/teams/non-profit" },
    ],
    relatedArticlesSlugs: ["compare-saas-team-seat-costs", "compare-saas-pricing-limits", "build-a-saas-budget-before-buying"],
  },
  {
    slug: "intercom-early-stage-vs-zendesk-for-startups",
    title: "Intercom Early Stage vs Zendesk for Startups: What You'll Pay",
    summary: "Compare Intercom's Early Stage program, Zendesk for Startups and Help Scout: eligibility, what each covers, and what you pay in years two and three.",
    subtitle: "Startup support discounts look similar in year one. The real difference shows up when they step down.",
    keyTakeaways: [
      "Intercom's Early Stage program is for companies with up to $10M in funding, fewer than 15 employees and no current Intercom account.",
      "Intercom's program page lists 96% off in year one, 50% off in year two and 25% off in year three; its main pricing page still advertises up to 93% off, so confirm your quote.",
      "Fin AI outcomes beyond the included allowance (300 a month in year one, 150 in year two, 75 in year three) are charged at the full $0.99 each, with no program discount.",
      "Zendesk for Startups gives new, funded customers six months free by default and up to two years through partner VCs and accelerators.",
      "Help Scout has no comparable startup discount on its pricing page, but its Standard plan costs $25 per user per month billed annually and includes a free plan for up to five users.",
    ],
    category: "Comparisons",
    tags: ["Intercom", "Zendesk", "Help Scout", "Startup programs", "Customer support software"],
    brandSlugs: ["intercom"],
    featured: true,
    coverAccent: "#C6FF3D",
    coverImage: { src: "/images/comparisons/intercom-vs-zendesk-startups.webp", alt: "Three customer support inboxes with discount labels stepping down from year one to year three" },
    sections: [
      {
        id: "quick-answer",
        heading: "Which startup support program is the better deal?",
        content: `If you have fewer than 15 employees and up to $10M in funding, Intercom's Early Stage program is the deeper year-one discount and includes AI support through Fin. If you have a VC or accelerator partner, Zendesk for Startups can give you up to two years free, which is the longer runway. If you want a predictable bill with no step-down, Help Scout's regular pricing is often simpler for a small team.\n\nThe year-one discount is the least important number. What matters is the price in years two and three, the usage charges the discount does not cover, and whether leaving the program early cancels your remaining savings. The terms below come from each provider's own pages, reviewed on ${REVIEWED}.`,
      },
      {
        id: "intercom-early-stage",
        heading: "Intercom Early Stage: eligibility and what it covers",
        content: `Intercom lists three eligibility rules on its Early Stage page: up to $10M in funding, fewer than 15 employees, and not currently being an Intercom customer. Accelerators, incubators and VCs can also apply to offer the program to their portfolio companies.\n\nThe program covers six Advanced seats, six Copilot seats, 20 Lite seats and Proactive Support Plus with 500 messages a month. It includes 300 Fin AI outcomes a month in year one, 150 in year two and 75 in year three.\n\nThe discount applies to email, extra seats beyond six, messages beyond 500 a month and Pro conversations above 1,000 a month. It does not apply to additional Fin outcomes, phone, SMS or WhatsApp, which are charged at list price. Intercom also says the year-two and year-three discounts are only for customers who stay on the program; switching to a self-serve or sales-led plan forfeits them.\n\nThe headline numbers conflict on Intercom's own site. The Early Stage page lists 96% off in year one, 50% in year two and 25% in year three, and prices the program from $30 a month. The main pricing page still advertises up to 93% off and a starting price of $65 a month. Ask for a written quote before you sign.`,
        dealCalloutSlug: "intercom-early-stage-year-one",
      },
      {
        id: "worked-example",
        heading: "What Intercom Early Stage costs in year two and three",
        content: `Intercom does not publish a year-two total, so here is an estimate built from its list prices, billed annually: Advanced at $85 per seat a month, Copilot at $29 per teammate a month, and Proactive Support Plus from $99 a month. Six Advanced seats, six Copilot seats and Proactive Support Plus add up to about $783 a month at list price.\n\n- Year one at 96% off: about $31 a month, which matches the program's "from $30 a month" claim.\n- Year two at 50% off: about $392 a month.\n- Year three at 25% off: about $587 a month.\n\nFin outcomes are the variable cost. Each outcome above the included allowance costs $0.99. If Fin resolves 600 conversations a month in year two, 150 are included and the other 450 cost about $446 — more than the discounted seats.\n\nThis is our estimate from public list prices, not an Intercom quote. Your quote may differ by seat count, add-ons and currency. If costs become too high after year one, Intercom says you can move to its Essential plan, which the Early Stage page prices from $39 per seat a month.`,
      },
      {
        id: "zendesk-for-startups",
        heading: "Zendesk for Startups: how long it is free and who qualifies",
        content: `Zendesk for Startups offers its Professional Suite and Copilot free for a period that depends on your funding profile and partner. Zendesk says the baseline is six months for every accepted startup. Extended one- or two-year offers come through Zendesk's VC and accelerator partners, for up to 50 agents depending on the partner and funding.\n\nTo qualify, you must be a new Zendesk customer, have received outside funding from an angel round up to Series B, and be less than 10 years old. Zendesk's terms allow 250 or fewer employees if a partner refers you, or 50 or fewer if you apply directly. No credit card is needed upfront, but you must choose a paid plan when the free period ends.\n\nThe page we reviewed was Zendesk's regional startup page, so confirm the terms on the page for your country. Zendesk says it may review applications and can remove companies from the extended program at its discretion.`,
      },
      {
        id: "help-scout",
        heading: "Help Scout: the simpler alternative without a step-down",
        content: `Help Scout prices per user with no year-by-year discount schedule. Standard costs $25 per user per month billed annually ($30 monthly), Plus $45 ($54 monthly) and Pro $75 ($90 monthly) with a 10-user minimum. Its Free plan covers up to five users, one inbox, one Docs site and 25 contacts a month, with no payment method required. Standard and Plus come with a 15-day free trial.\n\nHelp Scout's AI agent, Envoy, is an add-on at $0.75 per resolution, and new accounts get three months of free, unlimited Envoy resolutions. Nonprofits and certified B Corporations get a 10% lifetime discount. Help Scout links to a startup page from its pricing FAQ; we could not load its terms, so ask for them directly.\n\nFor a four-person team, Help Scout Standard costs $100 a month billed annually. Add 450 AI resolutions and the total is about $438 a month — close to Intercom's estimated year-two cost, without the jump in year three.`,
      },
      {
        id: "common-mistake",
        heading: "The common mistake: leaving the program to save money",
        content: `When year two's price arrives, the instinct is to switch to a cheaper plan. On Intercom, that can backfire: Intercom says the year-two and year-three discounts are reserved for customers who stay on the program, and switching to a self-serve or sales-led plan forfeits them. Model both paths — staying at 50% and then 25% off, or moving to Essential — before you change anything.\n\nThe second mistake is treating AI usage as included. Fin outcomes above the monthly allowance are charged at the full $0.99, and the allowance halves each year. On Zendesk, the free period ends with a required move to a paid plan, so the real decision is which paid plan you will choose in month seven or year three.\n\nWhichever program you join, set a reminder 60 days before each step-down so you have time to compare quotes and export data if you need to.`,
      },
      {
        id: "choose",
        heading: "Which should a startup choose?",
        content: `Choose Intercom Early Stage if you qualify, want an all-in-one messenger and help center, and expect to grow into Advanced features. Budget for year two from day one, and track Fin outcomes monthly so the uncapped usage does not surprise you.\n\nChoose Zendesk for Startups if a VC or accelerator in Zendesk's partner network can get you an extended offer. Two free years is the longest runway here, but plan the move to a paid plan before it ends.\n\nChoose Help Scout if you want a predictable per-user bill, a generous free plan to start with, and email-first support without a program that steps down each year.\n\nWhichever you pick, put the renewal date, the next year's price and the export process in your decision record before you activate the offer.`,
        links: [{ label: "Startup software credits: eligibility, expiry and renewal costs", href: "/articles/startup-software-credits-and-renewal-costs" }, { label: "Browse startup software programs", href: "/startup-deals" }, { label: "See sourced Intercom offers", href: "/discounts/intercom" }],
      },
      {
        id: "decision-record",
        heading: "Decision record: what to confirm before activating an offer",
        content: `Write these down, with the date and source, before you accept any startup offer.\n\n- Your eligibility evidence: funding to date, employee count and confirmation that you are a new customer.\n- The written quote for year one, and the stated price or discount for years two and three.\n- Which seats, add-ons and AI allowance the offer covers, and which usage is billed at list price.\n- What happens if you change plans or leave the program early.\n- The date the free or discounted period ends, and a reminder 60 days before it.\n- How to export conversations, contacts and help-center articles if you switch.\n\nA startup discount is worth most when you would have chosen the product anyway. Use the record to check that it still fits once the discount steps down.`,
      },
    ],
    comparisonTable: {
      afterSection: "quick-answer",
      headers: ["Startup support", "Intercom Early Stage", "Zendesk for Startups", "Help Scout"],
      rows: [
        { feature: "Eligibility", values: ["Up to $10M funding, under 15 employees, new customer", "New, funded (angel to Series B), under 10 years old", "Any team; 10% off for nonprofits and B Corps"] },
        { feature: "Year one", values: ["96% off per program page (93% on pricing page)", "Free for 6 months by default", "Standard $25/user/mo annual; free plan up to 5 users"] },
        { feature: "Years two and three", values: ["50% off, then 25% off", "Up to 2 years free through partners, then paid", "No step-down"] },
        { feature: "AI agent pricing", values: ["Fin $0.99/outcome beyond allowance", "Copilot included in program", "Envoy $0.75/resolution, 3 months free"] },
        { feature: "Main catch", values: ["Leaving the program forfeits later discounts", "Must choose a paid plan when it ends", "No startup discount on the pricing page"] },
      ],
    },
    faqs: [
      { question: "Who qualifies for Intercom's Early Stage program?", answer: "Companies with up to $10M in funding, fewer than 15 employees and no current Intercom account. Accelerators, incubators and VCs can also apply to offer it to their portfolio companies." },
      { question: "How much does Intercom Early Stage cost in year two?", answer: "Intercom lists 50% off in year two. Using its list prices, the covered seats and add-ons come to about $392 a month, plus $0.99 for each Fin outcome above the 150 included. This is our estimate, not an Intercom quote." },
      { question: "Is Intercom's Early Stage discount 93% or 96%?", answer: "Intercom's Early Stage page lists 96% off in year one, while its main pricing page still advertises up to 93% off. Ask Intercom for a written quote that shows your year-one price." },
      { question: "How long is Zendesk for Startups free?", answer: "Six months by default for accepted startups. Extended one- or two-year offers are available through Zendesk's VC and accelerator partners, depending on funding and team size." },
      { question: "Does Help Scout have a free plan?", answer: "Yes. Help Scout's Free plan includes up to five users, one inbox, one Docs site and 25 contacts a month, with no payment method required." },
    ],
    sources: [
      { title: "Intercom plans, Fin outcomes and add-ons", url: "https://www.intercom.com/pricing" },
      { title: "Intercom Early Stage program terms", url: "https://www.intercom.com/early-stage" },
      { title: "Zendesk for Startups eligibility and program length", url: "https://www.zendesk.com/startups/" },
      { title: "Help Scout plans and Envoy pricing", url: "https://www.helpscout.com/pricing/" },
      { title: "Help Scout for Good: nonprofit and B Corp discount", url: "https://www.helpscout.com/for-good/" },
    ],
    relatedArticlesSlugs: ["startup-software-credits-and-renewal-costs", "saas-coupon-renewal-price-checklist", "compare-saas-team-seat-costs"],
  },
];

const PUBLISHED = "2026-11-27";

const publishedGuides = guides.map(({ brandSlugs, ...guide }) => ({
  brandSlugs,
  article: {
    ...guide,
    id: `flagship-${guide.slug}`,
    author: editorial,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    readTime: `${Math.ceil(guide.sections.reduce((total, section) => total + section.content.split(/\s+/).length, 0) / 200)} min read`,
    tableOfContents: guide.sections.map(section => ({ id: section.id, title: section.heading })),
  } satisfies DetailedArticle,
}));

export const FLAGSHIP_COMPARISONS: DetailedArticle[] = publishedGuides.map(({ article }) => article);

export function getFlagshipGuidesForBrand(slug: string) {
  return publishedGuides.filter(guide => guide.brandSlugs.includes(slug)).map(({ article }) => article);
}
