import type { ComparisonGuide } from "./comparison-guides";

interface ResearchComparison extends Omit<ComparisonGuide, "reviewedAt"> {
  toolA: string;
  toolB: string;
  category: string;
  search: { topic: string; description: string };
  questions: { question: string; answer: string }[];
  relatedArticles: string[];
}

export const COMPARISON_RESEARCH_DATE = "2026-11-25";

export const RESEARCH_COMPARISONS = {
  "coderabbit-vs-sourcery": {
    toolA: "CodeRabbit", toolB: "Sourcery", category: "Developer tools",
    search: { topic: "GitHub PR Reviews and Team Rules", description: "Compare CodeRabbit and Sourcery on GitHub PR review rules, repository scope and comment quality. Run a controlled pilot before rollout." },
    summary: "Compare how CodeRabbit and Sourcery turn team conventions into pull request feedback and how much work it takes to keep that feedback useful.",
    decision: "Start with CodeRabbit if your main requirement is file-specific guidance configured alongside code. Start with Sourcery if a centrally managed review policy fits your team. Make the rollout decision on the quality of comments from a small, matched GitHub pilot.",
    rows: [
      { situation: "Different rules for application and infrastructure folders", approach: "Evaluate CodeRabbit’s repository instructions", reason: "Check the configuration version and verify that a rule appears only where it belongs." },
      { situation: "Several repositories share one review policy", approach: "Evaluate Sourcery’s team review rules", reason: "Verify who can change rules and whether protected branches need exceptions." },
      { situation: "Reviewers already receive too many automated comments", approach: "Run both against the same PR set", reason: "Measure correct, actionable comments and duplicates before increasing scope." },
      { situation: "Code access needs approval", approach: "Review GitHub App permissions first", reason: "Confirm repository selection, data handling and whether access can be revoked before adding a sensitive repo." },
    ],
    sections: [
      { heading: "Choose where review rules live", text: "CodeRabbit documents path-scoped instructions and a newer GitHub Cloud configuration version that uses Markdown instruction files. Select the format supported by your installation before copying examples. Sourcery documents review settings and team review rules. Ask who should approve a rule change. Repository-owned configuration fits a team that reviews policy changes in pull requests, while shared settings can reduce duplicated upkeep across repositories. Test one rule that applies only to infrastructure and one that applies everywhere." },
      { heading: "Define what counts as an architecture finding", text: "An architecture comment should explain a crossed boundary or ownership problem and identify the evidence supporting it. Seed a disposable fixture with an application module calling a layer it should not own. Include a neighboring valid change that looks similar. A useful tool should explain the difference. Compare whether reviewers can reproduce the reasoning from repository context and whether the comment points to the actual decision. A long summary and a correct architectural warning solve different problems." },
      { heading: "Compare cost per useful review", text: "During a pilot, record active contributors, the pull requests that receive automated feedback and the human time spent resolving incorrect comments. Keep ordinary lint and CI checks in place so the candidate tools compete on incremental value. Review each provider’s current plan for billing units and how repository access is assigned. Set an exit criterion before expanding. A bot that catches one important issue but routinely slows straightforward changes may only belong on a subset of repositories." },
    ],
    exercise: ["Install each candidate on an approved test repository.", "Run the same bug fix, refactor and boundary-change PRs with the same guidance.", "Classify each comment as actionable, duplicate, incorrect or context missing.", "Review permissions, operating effort and the current quote before expanding."],
    questions: [
      { question: "Can CodeRabbit and Sourcery replace a human PR reviewer?", answer: "Use either as an additional reviewer. Keep a person responsible for architectural trade-offs, correctness and merge approval." },
      { question: "Can both tools be evaluated on the same GitHub repository?", answer: "Yes. Use a dedicated repository or separate runs, then compare the same diffs and record each tool’s configuration so comments can be attributed correctly." },
      { question: "Which CodeRabbit instruction format should a new setup use?", answer: "Check the configuration version supported by your installation. CodeRabbit documents path instructions for classic configuration and Markdown instruction files for its GitHub Cloud V3 format." },
    ],
    sources: [
      { label: "CodeRabbit review instructions", url: "https://docs.coderabbit.ai/pr-reviews/review-instructions" },
      { label: "Sourcery GitHub setup and permissions", url: "https://docs.sourcery.ai/start/quickstart-github/" },
      { label: "Sourcery review configuration", url: "https://docs.sourcery.ai/reviews/configure/" },
    ],
    relatedArticles: ["coderabbit-review-github-pull-requests", "evaluate-ai-software-free-trials"],
  },
  "checkly-vs-healthchecks-io": {
    toolA: "Checkly", toolB: "Healthchecks.io", category: "Developer tools",
    search: { topic: "API Checks vs Cron Monitoring", description: "Compare Checkly and Healthchecks.io for API checks and scheduled jobs. See when to probe an endpoint, receive a heartbeat or use both." },
    summary: "Synthetic checks and job heartbeats answer different questions. Choose the signal that detects the incident your team actually needs to respond to.",
    decision: "Use Healthchecks.io when the job can report its outcome and you mainly need missing or late execution alerts. Evaluate Checkly when you also need proactive API or browser checks alongside job heartbeats.",
    rows: [
      { situation: "Nightly export can report completion", approach: "Start with Healthchecks.io", reason: "A missing completion signal can show that the work did not finish on schedule." },
      { situation: "The app returns HTTP 200 with invalid data", approach: "Use a Checkly API assertion", reason: "Probe the actual response shape or value required by the application." },
      { situation: "A checkout API and its jobs can fail independently", approach: "Use a probe plus a heartbeat", reason: "Separate customer-facing availability from internal job completion." },
      { situation: "You already operate Checkly synthetic checks", approach: "Compare Checkly heartbeats before adding a second tool", reason: "Compare job quotas, alert routes and ownership in the paid plan you would use." },
    ],
    sections: [
      { heading: "Start with who sends the signal", text: "A job heartbeat is sent by your workload. If the scheduled export never starts or fails before reporting success, the expected ping does not arrive. An outside API check originates with the monitor, so it can detect failures even when your app cannot report its own state. Healthchecks.io documents start and failure signals as well as success pings. Checkly offers heartbeats as well as synthetic API checks, so the purchasing decision depends on which signals you want in the same service." },
      { heading: "Set deadlines that match the work", text: "A report expected at 06:00 and an import that can take 40 minutes need different alert thresholds. Record the time it normally takes, the time at which someone must intervene and how a retry affects the deadline. Put the success ping after the durable result is available. For an API, choose a harmless check that verifies a meaningful response, then decide which error warrants an alert. Prevent long-running checks from silently substituting for a recovery plan." },
      { heading: "Budget on real check counts and alert ownership", text: "Model the number of jobs, API checks, browser checks and locations separately. A two-minute outside probe runs repeatedly even when nothing is broken, while one scheduled job sends pings according to its own schedule. Start with a small set of failure alerts that someone will act on. Name the on-call owner and the first diagnostic step for each. Compare the current quotes using the same schedules and leave room for test and staging checks." },
    ],
    exercise: ["Skip one scheduled execution and send an explicit failure on the next run.", "Return an HTTP success with the wrong body from a test endpoint.", "Check the messages, timestamps and runbook links delivered to the alert recipient.", "Compare job count and synthetic run usage with the provider’s current plan."],
    questions: [
      { question: "Does Checkly support heartbeat monitoring?", answer: "Yes. Checkly documents heartbeat checks alongside API and browser monitoring. Confirm its current entitlement for the number of jobs you need." },
      { question: "Can a cron heartbeat verify an API response?", answer: "A heartbeat shows that something reported in. The job can independently test an API, but a separate synthetic request is useful when you need an outside perspective." },
    ],
    sources: [
      { label: "Checkly heartbeat monitoring", url: "https://www.checklyhq.com/product/heartbeat-monitoring/" },
      { label: "Checkly API monitoring", url: "https://www.checklyhq.com/product/api-monitoring/" },
      { label: "Healthchecks.io ping API", url: "https://healthchecks.io/docs/http_api/" },
      { label: "Healthchecks.io scheduling documentation", url: "https://healthchecks.io/docs/" },
    ],
    relatedArticles: ["checkly-review-api-playwright-monitoring", "hosting-sla-vs-application-uptime-recovery"],
  },
  "baserow-vs-nocodb": {
    toolA: "Baserow", toolB: "NocoDB", category: "Databases & internal tools",
    search: { topic: "Working With Existing PostgreSQL Data", description: "Compare Baserow PostgreSQL sync with NocoDB external data sources. Test writes, database ownership and editor permissions before connecting production." },
    summary: "Baserow and NocoDB can both put a spreadsheet-style interface in front of PostgreSQL. Compare how changes reach the source and who is allowed to make them.",
    decision: "Evaluate Baserow when your team wants a workspace with synced tables. Evaluate NocoDB when an external database is central to the design. Test the exact read and write behavior with a scoped staging database account before putting production data behind either UI.",
    rows: [
      { situation: "Staff need a safe, read-only catalog view", approach: "Try one-way sync with read-only credentials", reason: "Database permissions establish a clear boundary for the workspace." },
      { situation: "Editors need to update existing records", approach: "Pilot NocoDB data sources and Baserow two-way sync", reason: "Explicitly test writes, deletion restrictions and out-of-band changes in both." },
      { situation: "The database has fragile schemas or triggers", approach: "Start on a representative copy", reason: "Exercise defaults, constraints, linked records and migration behavior." },
      { situation: "Self-hosting is required", approach: "Price the edition and operations", reason: "Confirm supported features, backups, upgrades and the editor permissions you need." },
    ],
    sections: [
      { heading: "Decide which copy owns each field", text: "Baserow documents read-only synchronization as the default for synced tables and optional two-way synchronization for PostgreSQL. NocoDB documents connecting an external data source and controlling behavior for it. Draw one row from the original record through the editor interface and back. Ask how quickly an upstream change should appear and what happens when a write violates a required field or a foreign key. Assign one owner for fields that are updated by other applications." },
      { heading: "Turn permissions into a test case", text: "Use a dedicated database account that only reaches the chosen staging tables. Invite a viewer and an editor, then document what each can view, edit, delete or export. Repeat the test for filtered views and linked records. A filter can simplify the interface without necessarily enforcing the data boundary you need. Recheck the same scenarios for the product edition you would purchase because role options and data source access can differ by deployment." },
      { heading: "Rehearse a schema change and an exit", text: "Rename a nonessential column on the staging copy and verify how the table view, linked records and any saved forms react. Then disconnect the integration and identify which data stayed in PostgreSQL and what still needs export from the workspace. Include both the database recovery process and the saved views or permissions that people depend on. A clean exit plan is especially helpful when the interface starts replacing established admin tools." },
    ],
    exercise: ["Create a staging database account scoped to one sample table.", "Sync or connect the table, then exercise a read, edit and rejected edit.", "Change the source outside the UI and record how edits become visible.", "Compare export and permissions behavior with actual editor roles."],
    questions: [
      { question: "Can Baserow write back to PostgreSQL?", answer: "Baserow documents an optional two-way synchronization mode for PostgreSQL. It needs appropriately scoped write permissions and should be verified on staging data." },
      { question: "Does connecting NocoDB to PostgreSQL remove the need for a backup?", answer: "Keep backups and a recovery plan for PostgreSQL itself. Account separately for workspace configuration, roles and views." },
    ],
    sources: [
      { label: "Baserow data sync and PostgreSQL mode", url: "https://baserow.io/user-docs/data-sync-in-baserow" },
      { label: "Baserow roles and permissions", url: "https://baserow.io/user-docs/permissions-overview" },
      { label: "NocoDB external data sources", url: "https://nocodb.com/docs/product/integrations/data-sources/connect-to-data-source" },
    ],
    relatedArticles: ["baserow-review-postgresql-operations", "supabase-review-multi-tenant-saas"],
  },
  "linear-vs-jira": {
    toolA: "Linear", toolB: "Jira", category: "Project management",
    search: { topic: "GitHub PR Workflows for Engineering Teams", description: "Compare Linear and Jira for GitHub pull request tracking. Check issue linking, status automation and the handoff from merge to release." },
    summary: "Both tools connect work items to GitHub. The meaningful choice is how reviewers, delivery owners and release operators interpret the status after a pull request changes.",
    decision: "Evaluate Linear when a small engineering team wants a short branch-to-issue workflow. Evaluate Jira when the issue already coordinates several teams or must fit an existing approval workflow. Run a full release rehearsal before migrating either way.",
    rows: [
      { situation: "One engineering team manages the backlog", approach: "Pilot Linear issue links and status automation", reason: "See whether GitHub events reliably update the few states your team needs." },
      { situation: "Support, release and engineering share a work item", approach: "Pilot Jira’s GitHub development panel", reason: "Verify that each role can find the pull request while preserving a separate release decision." },
      { situation: "One issue spans multiple PRs", approach: "Agree on when the work is complete", reason: "A merge may be one piece of a change that is still pending across repositories." },
      { situation: "A status must be auditable after migration", approach: "Test historical mappings and permissions", reason: "Reproduce one completed issue from a real project on a representative import." },
    ],
    sections: [
      { heading: "Make issue linking routine", text: "Linear documents how branches, pull request titles and supported phrases can connect work to an issue. Atlassian documents Jira work item keys as a way to link GitHub development activity. Write a simple rule your team can follow in ordinary work and place it in the PR template. Include a change made outside the usual naming scheme. When a link is missing, the reviewer should be able to fix it without guessing which integration account owns the action." },
      { heading: "Separate merged from released", text: "Sketch four events for one feature. The branch opens, the pull request merges, the deployment begins and a release owner confirms the result. Decide which event moves the issue and which one only adds context. Linear documents issue status automation and target-branch rules. In Jira, check the separate automation and workflow settings involved in your project before assuming that linking commits updates the work item. Different work-item types may use different approvals." },
      { heading: "Price the coordination work", text: "Compare more than the developer seat count. List who triages incoming requests, checks a release and reads its history. Identify users who need to edit versus a summary delivered elsewhere. Trial the process around an abandoned PR and a rollback. If team members manually repair issue states after every exception, calculate that recurring cost before deciding that either platform has simplified the workflow." },
    ],
    exercise: ["Link a draft PR to a work item using the team’s standard naming practice.", "Open a second PR for the same issue and merge one into a staging branch.", "Walk through a failed deployment and check who can update the work item.", "Record which information remains visible to each role after release."],
    questions: [
      { question: "Do Linear and Jira both link GitHub pull requests?", answer: "Yes. Both document integrations for linking GitHub development activity to work items. Verify the linking convention and permissions your repository uses." },
      { question: "Should a GitHub merge automatically close an issue?", answer: "Only when merging genuinely completes that work. For staged releases or multi-repository changes, keep a separate release or verification step." },
    ],
    sources: [
      { label: "Linear GitHub linking and status automation", url: "https://linear.app/docs/github-integration" },
      { label: "Atlassian’s Jira and GitHub integration", url: "https://support.atlassian.com/jira-cloud-administration/docs/use-the-github-for-jira-app/" },
    ],
    relatedArticles: ["compare-saas-team-seat-costs", "compare-saas-pricing-limits"],
  },
  "fireflies-ai-vs-fathom": {
    toolA: "Fireflies.ai", toolB: "Fathom", category: "Meeting software",
    search: { topic: "Recording and Recap Sharing Controls", description: "Compare Fireflies and Fathom for meeting capture, automatic recap emails and recording access. Test an internal and guest call before rollout." },
    summary: "The key decision is when recording starts, who receives the recap and who can open the underlying recording.",
    decision: "Evaluate Fireflies for calendar-driven capture with explicit recap and privacy settings. Evaluate Fathom if its internal and external call controls fit your meeting policy. Use a controlled pilot with a guest to verify the actual notices, recipients and access.",
    rows: [
      { situation: "Internal recurring calls can be recorded by default", approach: "Test automatic capture for internal calls", reason: "Confirm that an external guest changes the expected behavior." },
      { situation: "Guest recaps should require approval", approach: "Start with restricted sharing", reason: "An email delivery rule and a recording’s access permissions must both be checked." },
      { situation: "Multiple teammates need recordings", approach: "Verify team and member settings", reason: "Workspace permissions can differ from what the recording organizer expects." },
      { situation: "A meeting must be excluded", approach: "Test exclusions and manual controls", reason: "Verify that recurring invites, forwarded links and ad hoc calls behave as intended." },
    ],
    sections: [
      { heading: "Test the capture rule before testing summaries", text: "Fireflies documents auto-join controls, including calendar and invitation conditions that can affect attendance. Fathom documents recording choices for internal, external and impromptu meetings. Decide which classes of call may be recorded under your organization’s policy. Test a routine internal call and a call involving a guest with the same users who will actually operate the tool. Check whether participants see the expected notice and whether someone can stop capture." },
      { heading: "Follow the recap as a guest", text: "Fireflies documents separate controls for recap recipients and viewing permissions. Fathom documents who can receive auto-shared recordings and summaries. After your test call, check the message at an outside address and open the link from a browser without a team session. Then forward the link to a second controlled identity to see what permissions apply. Document who should approve sharing and whether that person can correct an accidental recipient selection." },
      { heading: "Estimate administrative work over a month", text: "Measure the number of users who record, users who need to review the output and exceptions handled by an administrator. Check what happens if a user leaves the team and how recording ownership and retention are handled on the current plan. Compare a transcript and summary only after the capture and access controls meet requirements. An accurate recap solves a different problem from dependable control over when it is created and where it goes." },
    ],
    exercise: ["Create one internal calendar event and one event with an authorized guest test account.", "Check notices, recording start and the opt-out or stop process.", "Compare message recipients with actual recording access in a signed-out browser.", "Repeat the tests with the roles and plan planned for rollout."],
    questions: [
      { question: "Can a guest receive a meeting recap without access to the recording?", answer: "Email delivery and access can be configured separately. Verify both for the product and account setup you are evaluating." },
      { question: "Does a recording notice resolve the whole approval process?", answer: "Follow your organization’s policy and applicable requirements. Test which notice participants actually see and how capture is declined or stopped." },
    ],
    sources: [
      { label: "Fireflies calendar auto-join settings", url: "https://guide.fireflies.ai/articles/5074225515-learn-about-fireflies-auto-join-settings" },
      { label: "Fireflies recap and privacy controls", url: "https://guide.fireflies.ai/articles/7339665361-how-to-configure-meeting-recap-emails-and-privacy-settings" },
      { label: "Fathom recording by meeting type", url: "https://help.fathom.video/en/articles/294208" },
      { label: "Fathom automatic sharing", url: "https://help.fathom.video/en/articles/7574785" },
    ],
    relatedArticles: ["fireflies-ai-review-client-meetings", "verify-software-privacy-claims"],
  },
  "buttondown-vs-ghost": {
    toolA: "Buttondown", toolB: "Ghost", category: "Email & publishing",
    search: { topic: "Paid Newsletters and Membership Sites", description: "Compare Buttondown and Ghost for paid newsletters. Check archives, Stripe subscriptions, subscriber exports and which system should own your site." },
    summary: "The products overlap on email and paid publication. Compare whether your primary asset is a newsletter inside an existing site or a publication whose site and membership belong together.",
    decision: "Start with Buttondown for an email-first publication that already has a website. Start with Ghost if the website, members and newsletters need to be managed in one publishing workflow.",
    rows: [
      { situation: "A website already handles publishing and navigation", approach: "Pilot Buttondown signup and newsletter archives", reason: "Preserve the site and confirm the email workflow fits its domain and linking conventions." },
      { situation: "Membership unlocks content across a publication", approach: "Pilot Ghost members and email delivery", reason: "Test member login, tier access and how an article is emailed and presented on the site." },
      { situation: "There are active paid readers today", approach: "Audit the billing migration first", reason: "Subscriber CSV rows, paid entitlements and Stripe payment records need separate checks." },
      { situation: "The author works alone", approach: "Run a real editorial rehearsal", reason: "Compare time to draft, send, correct, archive and answer a member support question." },
    ],
    sections: [
      { heading: "Choose the system that owns the website", text: "Buttondown documents public archives and paid visibility options, so an email-first publisher can still maintain a web archive. Ghost combines online publication, memberships and newsletters. Map public articles, archive links, signup forms and member-only pages to the system that will own them after launch. Check historic URLs and canonical destinations before moving domains. An existing article site may need only email infrastructure, while a new member publication may benefit from owning more of that workflow together." },
      { heading: "Rehearse paid access separately from migration", text: "Buttondown documents paid subscriptions and its Stripe integration. Ghost documents memberships, newsletter setup and exports. Exporting a list is only one part of migration. Pick a sample with a free reader, a paid member and a recently canceled member, then verify the expected landing page and access for each. Document how you would handle renewal support before assuming that all payment histories and entitlements transfer automatically between systems." },
      { heading: "Compare the whole publication cost", text: "Use the same subscriber count, sending schedule and paid-member assumptions. Include the website, membership tooling, payment-processing fees and maintenance time. Ask what changes when the list grows or you add another newsletter. Decide which costs you can defer and which are required from the first issue. A low email quote can be sensible when your current site covers the web workflow and less comparable when you would purchase a separate membership stack." },
    ],
    exercise: ["Publish a public and a members-only test issue.", "Subscribe with three authorized test identities and inspect the resulting archive access.", "Verify the subscriber export and record what additional content or payment data would be needed for a move.", "Compare the full yearly cost under the same sending and membership assumptions."],
    questions: [
      { question: "Can Buttondown publish a web archive?", answer: "Yes. Buttondown documents public archives, custom domains and visibility options for paid content. Confirm which archive URL you want readers to use." },
      { question: "Is a Ghost member export enough to migrate a paid newsletter?", answer: "The export helps move membership data. Verify content URLs, paid status and Stripe account relationships separately." },
    ],
    sources: [
      { label: "Buttondown archive and access settings", url: "https://docs.buttondown.com/email-archives" },
      { label: "Buttondown paid subscriptions", url: "https://docs.buttondown.com/paid-subscriptions" },
      { label: "Ghost newsletter setup", url: "https://ghost.org/help/setup-email-newsletters/" },
      { label: "Ghost content and member exports", url: "https://ghost.org/help/exports/" },
    ],
    relatedArticles: ["buttondown-review-paid-newsletter", "ghost-self-hosted-vs-managed-publishing"],
  },
  "wpforms-vs-fluent-forms": {
    toolA: "WPForms", toolB: "Fluent Forms", category: "WordPress",
    search: { topic: "Conditional Notifications and Lead Routing", description: "Compare WPForms and Fluent Forms for WordPress lead routing. Check conditional notifications, fallback recipients and the license your form needs." },
    summary: "Either candidate can be evaluated for conditional notification routing. The important differences appear when answers overlap, a recipient should receive nothing or sending fails.",
    decision: "Choose the plugin whose current license supports the form rules you need and whose behavior you can verify with test submissions. Give priority to predictable routing, stored-entry handling and a clear fallback.",
    rows: [
      { situation: "Three departments receive different inquiries", approach: "Build the same routing table in both plugins", reason: "Compare how a form field value turns into a notification recipient." },
      { situation: "Two rules could match one submission", approach: "Test overlap explicitly", reason: "Find out if both notices are sent or if your intended precedence is preserved." },
      { situation: "No rule matches", approach: "Add and test a fallback", reason: "Avoid losing an inquiry when a label changes or an expected field is empty." },
      { situation: "A client needs to maintain the form", approach: "Document the edition and a safe handover", reason: "Capture the license renewal, mail provider and approved change process." },
    ],
    sections: [
      { heading: "Write the recipient rules outside WordPress", text: "Start with a table of answers and expected recipients. Give each route a department owner and note whether the sender receives an acknowledgment. WPForms documents conditional form notifications and compound rules. Fluent Forms documents conditional email routing. Reproduce the same table in both, then test an unexpected combination. A conditional field controls what a visitor sees, while conditional notifications control what a recipient receives, so inspect both." },
      { heading: "Verify delivery separately from rule selection", text: "A submission can follow the correct route and still fail to reach the inbox. Use test addresses approved for the exercise and inspect the actual message at each recipient. Determine whether the entry should be stored, who may read it and how it can be recovered after a mail outage. Keep the message content limited to what the recipient needs. Verify what the site operator sees when the submission is accepted but the host rejects or delays mail." },
      { heading: "Check upgrades on a clone", text: "Compare your current edition for conditional rules, storage and the specific integrations the workflow requires. Include delivery service costs and whether the license needs to cover staging or several client sites. Make a replacement copy of the form on staging and remove a field or change an option. Re-run your routing table. A maintainable solution should make it easy for an editor to spot that a form change also changes operational routing." },
    ],
    exercise: ["Submit a normal request to each department using dedicated test inboxes.", "Run overlap, blank-field and unmatched-case submissions.", "Verify entries, notifications and privacy handling during a simulated mail failure.", "Re-run the same cases after changing a field label or option."],
    questions: [
      { question: "Can WPForms send emails based on the user’s answer?", answer: "WPForms documents conditional form notifications. Check which license includes the feature and verify the exact recipients on a test submission." },
      { question: "Does conditional routing guarantee that email arrives?", answer: "The rule selects a notification. The WordPress host and your mail service still have to deliver the message, so verify it in the receiving inbox." },
    ],
    sources: [
      { label: "WPForms conditional form notifications", url: "https://wpforms.com/docs/how-to-create-conditional-form-notifications-in-wpforms/" },
      { label: "WPForms compound conditions", url: "https://wpforms.com/docs/how-to-use-and-or-conditional-logic/" },
      { label: "Fluent Forms conditional email routing", url: "https://fluentforms.com/docs/conditional-email-routing/" },
      { label: "Fluent Forms notification walkthrough", url: "https://fluentforms.com/using-conditional-logic-for-email-notification/" },
    ],
    relatedArticles: ["fluent-forms-review-wordpress-leads", "wordpress-hosting-email-vs-transactional-email"],
  },
} satisfies Record<string, ResearchComparison>;
