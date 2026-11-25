import type { DetailedArticle } from "./articles-data";
import { comparisonHeroPhoto, hostingCoverPhotos, type ResearchPhoto } from "./research-photography";

interface SoftwareReview {
  toolSlug: string;
  name: string;
  slug: string;
  title: string;
  summary: string;
  audience: string;
  cover: ResearchPhoto;
  tags: string[];
  sections: [heading: string, content: string][];
  strengths: string[];
  limitations: string[];
  sources: [title: string, url: string][];
  questions: [question: string, answer: string][];
  related: string[];
  comparison: string;
}

const reviewedAt = "2026-11-25";
const reviews: SoftwareReview[] = [
  {
    toolSlug: "coderabbit", name: "CodeRabbit", slug: "coderabbit-review-github-pull-requests",
    title: "CodeRabbit review for small GitHub teams",
    summary: "Evaluate CodeRabbit for GitHub pull request reviews. Test repository instructions, architectural feedback and reviewer effort before buying seats.",
    audience: "For maintainers who want an automated reviewer alongside human approval and existing CI.",
    cover: hostingCoverPhotos["application-deployment"], tags: ["CodeRabbit", "GitHub", "AI code review", "Pull requests"],
    sections: [
      ["Is CodeRabbit worth trying for GitHub pull requests?", "Try it if your maintainers repeatedly explain the same repository conventions or need an extra pass over unfamiliar changes. Its documentable advantage is configurable review guidance scoped to files and workflows. The pilot should show whether the guidance produces correct, actionable comments. If your immediate need is enforcing a deterministic lint rule, put that rule in CI first and use the bot for the checks that require context."],
      ["Set rules that fit your configuration version", "CodeRabbit’s instructions guide distinguishes classic path instructions from GitHub Cloud V3 instruction documents. Confirm which format your repository uses before starting. Give the tool one precise rule, such as asking reviewers to flag a new write path that bypasses the owner of a shared domain model, and explain where that rule applies. Add a legitimate exception as a separate example. Compare the comments with your own review notes rather than relying on the presence of a summary."],
      ["Score architectural reasoning on matched changes", "Use a disposable private repository with a normal bug fix, a legitimate refactor and a change that violates a documented layer boundary. Keep the tests running throughout. Record whether a comment finds the relevant code, explains the rule in context and proposes a change that preserves behavior. Count duplicates, vague remarks and false positives separately. A tool can give a helpful file overview while still missing the decision your maintainer cares about."],
      ["Estimate the cost of a review rollout", "List who opens pull requests, how many repositories are in scope and who should receive or respond to automated feedback. Verify the current quote, trial terms and permissions for that footprint. Record the minutes spent correcting rules, reading repeated comments and triaging failures. If adding the bot to every repository creates noise, start with the team or repository where the pilot detects useful findings and keep human approval as a separate control."],
      ["What would make us choose another workflow?", "Compare Sourcery if similar instructions are owned centrally across several repositories. Keep existing linting and code owners in either pilot. Ask an engineer who did not configure the tool to review the output without being told which comments matter. If the expected reasoning is unclear without that extra explanation, narrow the setup or revise the instructions before paying for a wider rollout."],
    ],
    strengths: ["Documented repository-specific review instructions", "A practical fit for an isolated pilot on representative pull requests"],
    limitations: ["Instruction configuration depends on the product version in use", "Human review is still needed for architecture, correctness and merge approval"],
    sources: [["CodeRabbit review instructions", "https://docs.coderabbit.ai/pr-reviews/review-instructions"], ["CodeRabbit current plans", "https://www.coderabbit.ai/pricing"], ["Sourcery review settings", "https://docs.sourcery.ai/reviews/configure/"]],
    questions: [["Can CodeRabbit follow different rules for different folders?", "CodeRabbit documents path-scoped instructions and a V3 document-based format. Check the supported version, then test exact and nearby paths to verify what applies."], ["How should a small team measure value?", "Track correct and actionable comments, false positives, repeated feedback and human time on the same representative pull requests before and after enabling it."]],
    related: ["evaluate-ai-software-free-trials", "compare-saas-team-seat-costs"], comparison: "coderabbit-vs-sourcery",
  },
  {
    toolSlug: "checkly", name: "Checkly", slug: "checkly-review-api-playwright-monitoring",
    title: "Checkly review for API and Playwright monitoring",
    summary: "Evaluate Checkly for scheduled API assertions, Playwright journeys and job heartbeats. Compare alert usefulness and check-run usage.",
    audience: "For a small SaaS team measuring customer-facing availability and scheduled jobs.",
    cover: hostingCoverPhotos["page-performance"], tags: ["Checkly", "Synthetic monitoring", "Playwright", "API monitoring"],
    sections: [
      ["When does Checkly fit?", "Evaluate Checkly when the answer to “is it up?” depends on a response body, a browser journey or a scheduled job. Its product documentation describes synthetic API and Playwright monitoring plus heartbeat checks. Start with a high-value workflow and a well-defined failure. If you only need to know whether a batch job completed, a narrower heartbeat service can be easier to configure and budget."],
      ["Pick the least expensive check that detects the outage", "Use an API check when an endpoint can prove the relevant behavior without a browser. An HTTP success alone can conceal an application error, so check a meaningful response property. Use a browser journey when a real navigation, sign-in step or browser interaction is essential to the outcome. Keep test accounts and inputs separate from customer activity. A production health check should be designed to avoid changing real orders, records or messages."],
      ["Treat alerts as part of the product", "A failing check has value when the right person understands what to do next. Simulate a bad response and a slow response in a safe environment, then review the alert at the destination where someone actually works. Check whether it identifies the workload, the expected outcome and the relevant runbook. A check that often pages on harmless changes may need a narrower assertion or a better limit before you add more locations."],
      ["Model runs before comparing quotes", "A synthetic check every five minutes runs 288 times in 24 hours at one location. If that same check were scheduled independently in three locations, the illustrative total would be 864 runs per day before retries. Checkly’s current plan determines how it counts and prices runs. Keep API, browser and heartbeat usage separate in your estimate. Review staging usage too, especially when a team reuses the same monitoring suite across environments."],
      ["Decide whether you need separate heartbeat monitoring", "A scheduled export should report success after the durable output exists. An outside API probe can detect a distinct problem, such as a service returning invalid data during the export window. Test both failure modes before consolidating. Ask the on-call owner whether the two alerts require the same response. If the use cases are independent, compare the cost and effort of keeping them together with using a purpose-built job monitor."],
    ],
    strengths: ["API assertions and browser journeys cover different failure modes", "Heartbeats can sit alongside synthetic monitoring"],
    limitations: ["Browser runs and added locations change the usage model", "A worthwhile rollout needs deliberate alert ownership and safe test accounts"],
    sources: [["Checkly synthetic monitoring", "https://www.checklyhq.com/product/synthetic-monitoring/"], ["Checkly API assertions", "https://www.checklyhq.com/product/api-monitoring/"], ["Checkly heartbeat checks", "https://www.checklyhq.com/product/heartbeat-monitoring/"], ["Checkly current plans", "https://www.checklyhq.com/pricing/"]],
    questions: [["Should every API be checked with Playwright?", "Start with a direct API assertion when it can verify the customer-visible behavior. Use Playwright for journeys that depend on browser behavior."], ["Does a successful heartbeat show the public app is healthy?", "It shows that the monitored job reported in. Add an outside API or browser check when public application behavior can fail separately."]],
    related: ["hosting-sla-vs-application-uptime-recovery", "hosting-bandwidth-overage-cost-guide"], comparison: "checkly-vs-healthchecks-io",
  },
  {
    toolSlug: "supabase", name: "Supabase", slug: "supabase-review-multi-tenant-saas",
    title: "Supabase review for multi-tenant SaaS",
    summary: "Evaluate Supabase for a multi-tenant SaaS app. Plan Postgres row-level access, shared file permissions and recovery before launch.",
    audience: "For a Postgres-oriented team preparing an app whose customers share infrastructure.",
    cover: hostingCoverPhotos["database-recovery"], tags: ["Supabase", "Postgres", "SaaS backend", "Row-level security"],
    sections: [
      ["Is Supabase a fit for a multi-tenant app?", "Evaluate Supabase when a relational model suits the app and the team can own authorization policies and database migrations. It gives you Postgres with an API and related services, but each application still has to decide who can view and modify its records. Start with two sample customer accounts and prove the separation before connecting actual customer data."],
      ["Choose the boundary before using the data API", "Supabase exposes a REST API over Postgres using PostgREST. Its row-level security documentation explains how permissions can be expressed as database policies. Plan the tenant identifier and membership model together, including a user who belongs to more than one account. Write down the permitted reads, writes and deletes for each role. Use staging fixtures to confirm that a change in one related table does not grant broader access in another."],
      ["Check storage independently of database rows", "A document record and the uploaded file behind it are distinct resources. Supabase Storage has its own access-control model. Rehearse a user opening another tenant’s file and a departing user losing access to a shared file. Confirm which server operations need elevated privileges and keep those credentials in a trusted environment. Do not treat a working sign-in or visible document list as evidence that the file boundary is correct."],
      ["Recover one tenant’s workflow in a drill", "Review the available database backup options and recovery window for the plan. Supabase’s backup documentation explains that database backups do not include the objects stored through its Storage API. Include those objects and outside systems in the drill. Restore a disposable copy, verify that file records resolve, then measure how long it takes to return the workflow to service. Capture the findings before deciding which backup schedule meets your needs."],
      ["Compare against a smaller backend", "A prototype with a small number of users may be quicker to operate using a simpler backend. Compare PocketBase and Supabase on the same requirement list, including the need for relational queries, how policies are evaluated and who restores data. Include staging databases, stored files and traffic in the Supabase budget. The best early platform is one the team can monitor and recover at the workload it expects to run."],
    ],
    strengths: ["Postgres supports a useful relational tenant model", "Data API, database policies and storage documentation support a concrete pilot"],
    limitations: ["Tenant isolation needs application-specific policies and negative tests", "Database backups and stored objects need separate recovery checks"],
    sources: [["Supabase data REST API", "https://supabase.com/docs/guides/api"], ["Supabase row-level security", "https://supabase.com/docs/guides/database/postgres/row-level-security"], ["Supabase Storage access control", "https://supabase.com/docs/guides/storage/security/access-control"], ["Supabase database backup scope", "https://supabase.com/docs/guides/platform/backups"]],
    questions: [["Does using Supabase Auth isolate tenants automatically?", "Authentication identifies the user. Define and test the data and storage policies that determine what each tenant member can access."], ["Do Supabase database backups include the files stored in buckets?", "Supabase documents that database backups exclude Storage API objects. Plan how to back up, restore and reconcile the files separately."]],
    related: ["postgres-on-vps-vs-managed-database", "compare-saas-pricing-limits"], comparison: "pocketbase-vs-supabase",
  },
  {
    toolSlug: "baserow", name: "Baserow", slug: "baserow-review-postgresql-operations",
    title: "Baserow review for PostgreSQL operations teams",
    summary: "Review Baserow as an operations workspace over PostgreSQL. Test one-way sync, editor roles and when two-way writes make sense.",
    audience: "For operations teams adding a spreadsheet-style editing layer without replacing their source system.",
    cover: hostingCoverPhotos["application-deployment"], tags: ["Baserow", "PostgreSQL", "Data sync", "Internal tools"],
    sections: [
      ["When does Baserow fit a PostgreSQL workflow?", "Consider Baserow when operators need views and editing workflows over a defined dataset. Start with one table and a read-only feed. This establishes what staff need from the workspace and what they still do in the source system. Expand to two-way writes only after you can explain which edits belong in Baserow and which must remain in the application that owns the database."],
      ["Choose one-way sync first for reporting", "Baserow documents optional two-way sync for PostgreSQL, with read-only synced tables as the usual starting point. Use a scoped read-only account when the workspace should display records without changing them. Run a pilot against the columns operators actually use. Record how inserts and corrections appear after sync and how a missing upstream field is presented. An operational view needs a visible freshness expectation if people use it to make daily decisions."],
      ["Rehearse the edit workflow on a disposable table", "Take a common change such as updating a record’s status. Make a valid change and a rejected change that violates a constraint. Compare what appears in Baserow and in the underlying table. Then edit that same row from the source application and replay the exercise. Identify which team resolves conflicts and whether the operation can be retried without duplicating work. Use the test results to decide whether the editing UI should be offered to more people."],
      ["Validate roles and price the required edition", "List the people who need to see rows, edit rows, configure views or alter workspace settings. Verify role behavior using separate test accounts. Check the current edition for any permission, sync or hosting requirement that would change the price. For self-hosting, list who handles updates, workspace backups and recovery. Price the database and the workspace separately if your existing database will remain a dependency regardless of the tool choice."],
      ["Compare what you would take with you", "Decide what must survive a tool change. PostgreSQL may retain the source rows while views, forms and access settings still live in a separate workspace. Test an export and document how a teammate would recreate the important workflows. Compare NocoDB with the same database and restrictions if much of the work is centered directly on external tables. Keep the pilot small enough to change approach without disrupting the source system."],
    ],
    strengths: ["A practical read-only pilot is possible on a scoped database account", "The documented PostgreSQL sync offers an optional write-back path"],
    limitations: ["Two-way editing needs a clear ownership and recovery process", "Permissions and edition costs need verification before rollout"],
    sources: [["Baserow PostgreSQL sync", "https://baserow.io/user-docs/data-sync-in-baserow"], ["Baserow permission model", "https://baserow.io/user-docs/permissions-overview"], ["Baserow current plans", "https://baserow.io/pricing"], ["NocoDB external sources", "https://nocodb.com/docs/product/integrations/data-sources/connect-to-data-source"]],
    questions: [["Should an operations dashboard start with write access?", "Use read-only access when staff only need visibility. Consider write-back after the authorized edits, constraints and recovery steps are documented."], ["Is spreadsheet filtering equivalent to permission enforcement?", "A filtered view helps people find a subset of records. Test permissions independently with actual viewer and editor accounts."]],
    related: ["supabase-review-multi-tenant-saas", "postgres-on-vps-vs-managed-database"], comparison: "baserow-vs-nocodb",
  },
  {
    toolSlug: "fireflies-ai", name: "Fireflies.ai", slug: "fireflies-ai-review-client-meetings",
    title: "Fireflies.ai review for client meetings",
    summary: "Evaluate Fireflies.ai for client meetings by testing calendar auto-join, recap recipients and actual recording access with guest accounts.",
    audience: "For a client-facing team deciding which meetings to capture and who receives the output.",
    cover: comparisonHeroPhoto, tags: ["Fireflies.ai", "Meeting notes", "Recording access", "Client meetings"],
    sections: [
      ["Is Fireflies useful for client calls?", "Fireflies is worth evaluating if your team wants calendar-driven meeting notes and can define which calls may be captured. Get the client workflow right before scoring generated notes. Test whether the tool joins only when intended, what participants see and whether recap and recording access match your agreement with the client. A missed exclusion can matter more than a small improvement in transcription quality."],
      ["Use your calendar policy as the pilot scope", "Fireflies’ calendar documentation explains how auto-join settings and invite details affect whether it attends. Make one recurring internal meeting, one client event and one event that should be excluded. Use authorized test accounts and check each case with the calendar owner and an attendee. Document who can override the setting before a call starts. Include forwarded invitations or events that change organizers if these are common in your team."],
      ["Audit delivery and access separately", "Fireflies separates email recap preferences from privacy settings for who can view meeting content. Test with a team member, a guest and a second outside account that did not attend. Check who receives the recap and who can open the link directly. Verify any hand-off from a colleague’s calendar before using the same setup for clients. Keep a concise record of the approved default and how someone should correct it."],
      ["Evaluate a summary by following the next step", "Run a brief exercise in which a speaker assigns an action, another person corrects a deadline and a third raises an unresolved issue. Compare the output with notes taken by a participant and check whether the corrected date and owner are clear. Record how much manual editing is needed before it can be sent to the client. Check current seats and feature limits when estimating what happens if a full account team needs review access."],
      ["Compare guest controls before adding seats", "If most client calls are handled by a small group, pilot a narrow set of organizers first. Compare Fathom’s internal and external meeting settings under the same expectations. Then verify retention and access when an employee leaves or transfers account ownership. Ask one team member to walk through how to correct an accidental recipient selection. The result should govern rollout even if everyone likes the initial meeting summary."],
    ],
    strengths: ["Documented calendar-driven capture options", "Recap delivery and recording visibility can be evaluated separately"],
    limitations: ["Shared calendars and guests introduce exceptions that require testing", "A person should review client-facing notes and action items"],
    sources: [["Fireflies auto-join settings", "https://guide.fireflies.ai/articles/5074225515-learn-about-fireflies-auto-join-settings"], ["Fireflies recap and privacy configuration", "https://guide.fireflies.ai/articles/7339665361-how-to-configure-meeting-recap-emails-and-privacy-settings"], ["Fireflies plans", "https://fireflies.ai/pricing"], ["Fathom meeting recording settings", "https://help.fathom.video/en/articles/294208"]],
    questions: [["Can recap email recipients differ from recording viewers?", "Yes. The documented recap and privacy controls govern different things. Confirm both rules in the test accounts that represent your team and guests."], ["What should a trial check first?", "Start with capture policy, participant notices, and actual link access. Then review the accuracy and usefulness of transcripts and action items."]],
    related: ["verify-software-privacy-claims", "compare-saas-team-seat-costs"], comparison: "fireflies-ai-vs-fathom",
  },
  {
    toolSlug: "buttondown", name: "Buttondown", slug: "buttondown-review-paid-newsletter",
    title: "Buttondown review for an independent paid newsletter",
    summary: "Evaluate Buttondown for a paid newsletter on an existing site. Check Stripe setup, archive visibility and export needs before moving readers.",
    audience: "For independent publishers who already manage a website or want an email-first workflow.",
    cover: hostingCoverPhotos["editorial-publishing"], tags: ["Buttondown", "Paid newsletters", "Stripe", "Email archives"],
    sections: [
      ["When should a publisher choose Buttondown?", "Evaluate Buttondown when email is the primary product and your site can stay where it is. Its paid subscriptions and web archives can support a public and paid issue workflow. If you also need the publisher platform to operate the site and gate multiple content types, compare a fuller membership system such as Ghost before splitting that work across tools."],
      ["Map the reader’s path from signup to renewal", "Draft one public issue and one paid issue on a controlled list. Start from the signup page you expect readers to use, then follow the upgrade, confirmation and archive links. Buttondown documents paid subscriptions using Stripe and visibility settings for archived issues. Verify what a free reader sees on the archive and what a paid reader can see when signed out. Record who handles billing support when a subscriber’s access and payment status diverge."],
      ["Decide what belongs on your website", "Keep an inventory of the web addresses readers use to find issues. Choose whether a public note lives on your website, in the email archive or as a clearly linked pair. Buttondown documents web archives that can be reached on a custom domain. Test signup, mobile archive reading and canonical URLs before retiring any old pages. Check whether your workflow requires content to appear on your main site immediately after a send."],
      ["Budget around subscriber growth and payment handling", "Estimate the size of your deliverable list, planned send schedule and how many readers you expect to pay. Use the current quote for your required features and account for payment processing and any existing site expenses. Keep website costs in the comparison if they remain part of the product. Use a low-growth and a high-growth scenario so you can see whether your first-year decision still fits after a successful promotion."],
      ["Prepare an export before a paid migration", "Make a sample inventory of email addresses, subscription status, consent history, archived content and Stripe information. Confirm which of those are in the exports you can obtain and which need a separate migration plan. Try importing only authorized test rows first. Keep a rollback window for active readers and avoid promising continuity of paid access until you have tested a paid, recently canceled and unpaid subscriber separately."],
    ],
    strengths: ["A useful option when a website already exists", "Documented web archives and Stripe-backed paid subscriptions"],
    limitations: ["A publisher needs a separate plan for a broader membership site", "A list export alone cannot establish continuity of billing and access"],
    sources: [["Buttondown paid subscriptions", "https://docs.buttondown.com/paid-subscriptions"], ["Buttondown archive controls", "https://docs.buttondown.com/email-archives"], ["Buttondown Stripe integration", "https://docs.buttondown.com/stripe"], ["Ghost exports", "https://ghost.org/help/exports/"]],
    questions: [["Can I keep my existing website with Buttondown?", "Yes. Evaluate it as the email and archive layer, then test the signup links, archive domain and public content workflow on your actual website."], ["Can I assume paid readers keep access after migration?", "Verify billing and access for sample readers before making that promise. Address exports, subscription status and Stripe records as separate checks."]],
    related: ["beehiiv-vs-kit-newsletter", "ghost-self-hosted-vs-managed-publishing"], comparison: "buttondown-vs-ghost",
  },
  {
    toolSlug: "fluent-forms", name: "Fluent Forms", slug: "fluent-forms-review-wordpress-leads",
    title: "Fluent Forms review for WordPress lead routing",
    summary: "Evaluate Fluent Forms for routing WordPress leads. Rehearse conditional emails, fallback recipients and delivery failures on a staging site.",
    audience: "For a site owner or agency assigning incoming WordPress inquiries to different teams.",
    cover: hostingCoverPhotos["wordpress-store"], tags: ["Fluent Forms", "WordPress", "Lead routing", "Conditional email"],
    sections: [
      ["Is Fluent Forms a fit for department routing?", "Evaluate Fluent Forms when one form has to send inquiries to different departments according to submitted fields. Its conditional email routing documentation gives you a starting point for such a workflow. Prioritize the support needed for the fallback case and confirm that an operator can identify and recover a submission when delivery fails. Start on staging with dedicated inboxes."],
      ["Build a routing table before configuring the form", "Write down a normal request for each department and show the recipient, any acknowledgment to the sender and what may be included in the message. Include unmatched and overlapping rules. Then configure the form against that table. Change one answer on a nearly identical test request and check the result. If routing depends on a label that editors often change, document its operational impact next to the form settings."],
      ["Separate the inbox from the lead record", "An email recipient may need only the category and a reference to follow up. Decide which fields stay in WordPress or another approved destination and how someone retrieves the record. Simulate the delivery service rejecting a message and inspect what the site owner can see. Confirm who has access to stored entries, how long they are retained and whether a second team can recover the request without relying on forwarded email."],
      ["Check the features and license actually required", "Compare the version that supports the notifications, storage and integrations in your workflow. List the number of sites and the person responsible for renewing each license. Include related mail delivery costs and maintenance. Keep brief notes on editable fields, conditional rules and the owner of the fallback inbox. Ask the future operator to add a test department on staging without changing the live form."],
      ["Compare with an existing WPForms setup", "If WPForms is already installed, compare both plugins using the same cases rather than comparing long feature lists. A replacement is worthwhile when the routing change is easier to verify or the complete operating cost is lower, including migration. Before switching, trace existing links and exports and keep the old form available during a controlled handover. Re-test every recipient and the mail failure case after a plugin or host change."],
    ],
    strengths: ["Documented conditional email routing supports a concrete staging test", "A small test matrix can make future routing changes easier to review"],
    limitations: ["Notification selection alone does not establish reliable mail delivery", "Edition and integration requirements depend on the full workflow"],
    sources: [["Fluent Forms conditional email routing", "https://fluentforms.com/docs/conditional-email-routing/"], ["Fluent Forms notification logic", "https://fluentforms.com/using-conditional-logic-for-email-notification/"], ["Fluent Forms feature FAQ", "https://fluentforms.com/faq/"], ["WPForms conditional notifications", "https://wpforms.com/docs/how-to-create-conditional-form-notifications-in-wpforms/"]],
    questions: [["What should happen when none of the routing conditions match?", "Define a fallback recipient or handling process and prove it by sending an unmatched submission to a controlled inbox."], ["How do I tell whether the form rule or the mail service failed?", "Check the stored entry and selected notification independently of delivery. Then inspect the test inbox and the delivery service’s logs."]],
    related: ["wordpress-hosting-email-vs-transactional-email", "hostinger-vs-siteground-wordpress-renewal"], comparison: "wpforms-vs-fluent-forms",
  },
];

const sectionIds = ["quick-answer", "setup", "evaluation", "cost-and-operations", "alternatives"];

export const SOFTWARE_REVIEWS: DetailedArticle[] = reviews.map(review => {
  const sections = review.sections.map(([heading, content], index) => ({ id: sectionIds[index], heading, content }));
  const closing = sections[sections.length - 1];
  return {
    id: `review-${review.toolSlug}`,
    slug: review.slug,
    toolSlug: review.toolSlug,
    title: review.title,
    summary: review.summary,
    subtitle: review.audience,
    category: "Software Reviews",
    readTime: `${Math.ceil(sections.reduce((total, section) => total + section.content.split(/\s+/).length, 0) / 190)} min read`,
    publishedAt: reviewedAt,
    updatedAt: reviewedAt,
    author: {
      name: "SaaSFolio editorial",
      role: "Software research",
      avatarLetter: "S",
      bio: "We review official documentation and published plan terms. These evaluations provide buying criteria and proposed trials for readers to run.",
    },
    featured: review.toolSlug === "coderabbit",
    coverAccent: "#C6FF3D",
    coverImage: review.cover,
    tags: review.tags,
    tableOfContents: sections.map(section => ({ id: section.id, title: section.heading })),
    sections: [...sections.slice(0, -1), {
      ...closing,
      links: [
        { label: `See ${review.name} features and offers`, href: `/tools/${review.toolSlug}` },
        { label: "Read the side-by-side comparison", href: `/compare/${review.comparison}` },
      ],
    }],
    prosCons: { toolName: review.name, pros: review.strengths, cons: review.limitations },
    faqs: review.questions.map(([question, answer]) => ({ question, answer })),
    sources: review.sources.map(([title, url]) => ({ title, url })),
    relatedArticlesSlugs: review.related,
  };
});
