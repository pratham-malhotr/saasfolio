export interface ComparisonGuide {
  reviewedAt: string;
  summary: string;
  decision: string;
  rows: { situation: string; approach: string; reason: string }[];
  sections: { heading: string; text: string }[];
  exercise: string[];
  sources: { label: string; url: string }[];
}

// Original editorial analysis of the linked documentation, not benchmark results.
// A pair enters the published comparison collection only with a complete guide.
export const COMPARISON_GUIDES: Record<string, ComparisonGuide> = {
  "coolify-vs-vercel": {
    reviewedAt: "2026-11-05",
    summary: "The important difference is who operates the application infrastructure. Compare the work you will own with self-hosted Coolify against the deployment services and platform constraints of Vercel.",
    decision: "Start with the operating model. A team that wants to run Docker-based services on its own servers can investigate Coolify. A team prioritizing managed frontend deployments can investigate Vercel. Neither route eliminates the need for application backups, access controls or a recovery plan.",
    rows: [
      { situation: "Several services already run on a server your team maintains", approach: "Evaluate Coolify", reason: "A deployment control plane can fit an existing server operation, provided someone owns updates, capacity and recovery." },
      { situation: "A frontend team needs preview deployments for code review", approach: "Evaluate Vercel", reason: "Test the managed deployment workflow against your framework, environment variables and review process." },
      { situation: "A small team has no infrastructure operator", approach: "Price operating work before choosing", reason: "The lowest server invoice can become the more expensive option when support, incidents and maintenance consume development time." },
    ],
    sections: [
      { heading: "Draw the responsibility boundary", text: "For self-hosted Coolify, write down who maintains the host, deployment configuration and stored application data. Keep a backup of the application separately from the tool that deploys it. For Vercel, identify the platform services used by the app and the databases or external systems operated elsewhere. A successful application deployment does not demonstrate that a database restore will work." },
      { heading: "Compare the whole workload", text: "Use the same application, traffic assumptions and background work in both estimates. Include persistent services, storage, network traffic, build activity and external databases where required. Then add the engineering time needed to operate each setup. Do not compare a bare server quote with a platform quote that includes services the server configuration has not yet supplied." },
      { heading: "Make recovery part of the decision", text: "Walk through a bad release and an unavailable database. Identify how you would revert application code, recover data and tell whether the service is healthy. Preview deployments are useful for review, but they do not replace recovery for production state. Choose the approach whose responsibilities your team can actually carry, rather than assuming that either product makes operations disappear." },
    ],
    exercise: ["List the app, database, uploads and scheduled work as separate resources.", "Record each resource's owner, backup location and recovery action for both options.", "Estimate a normal month and a traffic spike with the same assumptions.", "Test a preview deployment and an application rollback using non-production data."],
    sources: [{ label: "Coolify deployment documentation", url: "https://coolify.io/docs/" }, { label: "Vercel deployment documentation", url: "https://vercel.com/docs/deployments" }],
  },
  "carrd-vs-framer": {
    reviewedAt: "2026-11-05",
    summary: "Choose around the site you will maintain. A focused landing page and an expanding content site create different editing, publishing and ownership requirements.",
    decision: "For a compact page with one clear action, test whether Carrd covers the required layout and form workflow. For a site that needs a richer visual system, repeatable content and multiple page layouts, evaluate Framer's publishing and CMS workflow. Judge the complete site you need, including its second month of updates.",
    rows: [
      { situation: "A single campaign or personal landing page", approach: "Start with a small Carrd prototype", reason: "Use one representative page to check the actual form, domain and embedded content requirements." },
      { situation: "Repeated content pages with a shared design", approach: "Test Framer's content workflow", reason: "The cost of adding and maintaining entries matters more than how quickly the initial hero section can be designed." },
      { situation: "A client will take over the finished site", approach: "Test ownership and editing in both", reason: "Account access, billing, domains and ongoing edits should remain manageable after the original designer leaves." },
    ],
    sections: [
      { heading: "Count page types before choosing a package", text: "Write a site map that separates a landing page, an article, a project entry and a legal page. Identify which layouts repeat and which need individual design work. A compact site can often use a simpler editing model, while a growing publication needs an efficient way to maintain repeated content. Do not assume that a builder's attractive demo has the structure your real content requires." },
      { heading: "Test the conversion path end to end", text: "Use a test contact address to check a form's delivery and confirmation behaviour. Verify what happens when validation fails and how a visitor finds the privacy information. For embedded booking or checkout tools, include the external service's subscription in the budget. A website builder's subscription does not necessarily include the tools connected to the page." },
      { heading: "Budget for ownership and future changes", text: "Record the domain registrar, site account owner, billing contact and process for adding an editor. Check what a new page or a design change would require after handover. Compare the full amount due today with the expected renewal, including add-ons. The better choice is the workflow your actual editor can maintain; this comparison does not assign a universal design or performance winner." },
    ],
    exercise: ["Build the same landing page and one representative content entry.", "Check mobile layout, keyboard navigation and a test form submission.", "Ask the future editor to change text and publish an update.", "Record the complete first-year and renewal costs from each current quote."],
    sources: [{ label: "Carrd official documentation", url: "https://carrd.com/docs" }, { label: "Framer help and publishing guides", url: "https://www.framer.com/help/" }],
  },
  "obsidian-vs-notion": {
    reviewedAt: "2026-11-05",
    summary: "A personal note archive and a shared team workspace have different requirements. Decide where the information should live, who edits it and how you will retrieve it after a tool change.",
    decision: "Evaluate Obsidian for a note workflow centred on a local vault and file ownership. Evaluate Notion for shared pages and workspace collaboration. If your work needs both, define which system is the source of truth instead of maintaining two competing copies.",
    rows: [
      { situation: "One person maintaining a linked research archive", approach: "Evaluate an Obsidian vault", reason: "Test your file organisation, links and retrieval workflow before adding plugins or synchronization." },
      { situation: "A team maintains shared operational pages", approach: "Evaluate a Notion workspace", reason: "Test permissions, page ownership and the way colleagues find the latest version of a document." },
      { situation: "Personal research becomes a published team document", approach: "Define a handoff between tools", reason: "Decide where edits happen after publication so that a local note and a shared page do not silently diverge." },
    ],
    sections: [
      { heading: "Separate storage from synchronization", text: "A local vault gives you a concrete set of files to include in a backup plan. Synchronization serves a different purpose: making changes available across devices. Check both independently. For a Notion workspace, test the export of a representative page and its attachments. Having an export option is different from confirming that the exported structure works for your next tool." },
      { heading: "Evaluate the actual collaboration model", text: "Ask two people to update a shared document and then find a previous decision. For a team workspace, inspect who can read, edit, invite others and change ownership. For a personal vault, decide what information should stay private and how finished work will be shared. A large plugin collection is not a substitute for a clear ownership and access model." },
      { heading: "Count the tools needed to complete the workflow", text: "Include the chosen synchronization, publishing and collaboration services in the cost comparison. Check the provider's current terms for the intended use and account configuration. Do not treat a personal note-taking setup as an equivalent quote for an organisation-wide workspace. Start with one representative project, document its retrieval and export results, and expand only after the workflow is comfortable." },
    ],
    exercise: ["Create a project note, an attachment and a linked decision record.", "Find each item from another device or account using the intended workflow.", "Export or back up the project and inspect the resulting files.", "Record which tool owns the final shared document and how access is revoked."],
    sources: [{ label: "Obsidian vaults, synchronization and publishing", url: "https://help.obsidian.md/" }, { label: "Notion workspace concepts", url: "https://www.notion.com/help/intro-to-workspaces" }],
  },
  "pocketbase-vs-supabase": {
    reviewedAt: "2026-11-05",
    summary: "Compare the database model and operational responsibilities before comparing an introductory hosting price. PocketBase's embedded SQLite backend and Supabase's PostgreSQL platform are different foundations.",
    decision: "Investigate PocketBase when a compact backend with an embedded database fits the project and you can manage its operational requirements. Investigate Supabase when PostgreSQL and its related platform services fit the application. PocketBase's documentation currently cautions against production-critical use before 1.0 without accepting ongoing migration responsibilities.",
    rows: [
      { situation: "A small project needs a compact backend deployment", approach: "Prototype with PocketBase", reason: "Confirm that the database model, access rules and upgrade process fit the project's risk and operating constraints." },
      { situation: "The application requires a PostgreSQL data model", approach: "Evaluate Supabase", reason: "Test schema migrations, authorization and the required platform services against a realistic data sample." },
      { situation: "Customer data or uptime has a strict recovery requirement", approach: "Evaluate recovery before committing", reason: "A running demo proves little about backup restoration, data isolation or the support needed during an incident." },
    ],
    sections: [
      { heading: "Model the hard query first", text: "Choose a representative relationship, permission rule and query from the actual application. Implement them before building a polished demo around simple records. Check how schema changes will be versioned and reviewed. A backend that is easy to start can still be awkward for a specific data model; the right test is your application's difficult operation, not a generic record counter." },
      { heading: "Treat authorization as application work", text: "Create two test accounts and prove that each can access only its own records. Repeat the check through the actual API used by the client. Platform authentication does not automatically establish that every table, collection or file has the intended access rules. Keep administrative credentials outside the browser and test denied requests as carefully as successful requests." },
      { heading: "Rehearse upgrades and recovery", text: "Read PocketBase's current compatibility and production guidance before committing a critical workload. For either option, record where backups live and perform a restoration into an isolated test environment. Include upgrades, storage, outbound traffic and support in the operating estimate. Self-hosting and a managed project carry different responsibilities, so compare complete configurations rather than assuming they provide equivalent operations." },
    ],
    exercise: ["Implement one realistic schema and the hardest expected query.", "Test cross-account record and file access with two disposable accounts.", "Restore a test backup into a separate environment.", "Write down the upgrade procedure, incident owner and acceptable recovery time."],
    sources: [{ label: "PocketBase introduction and production caveat", url: "https://pocketbase.io/docs/" }, { label: "Supabase database, auth and storage documentation", url: "https://supabase.com/docs" }],
  },
  "umami-vs-plausible": {
    reviewedAt: "2026-11-05",
    summary: "Choose analytics around the decisions your team needs to make. Compare event design, reporting, deployment and data handling rather than assuming that a privacy-related label makes two setups equivalent.",
    decision: "Start with a short measurement plan. Test Umami and Plausible against the same pages, campaign links and conversions. If you choose a self-hosted edition, evaluate that edition's capabilities and operating work separately from the provider's cloud service.",
    rows: [
      { situation: "You mainly need acquisition and conversion reporting", approach: "Test the same small report in both", reason: "A dashboard is useful when the team can explain a metric and take a specific action from it." },
      { situation: "You want to operate analytics infrastructure yourself", approach: "Evaluate the relevant self-hosted edition", reason: "Include application updates, database maintenance, backups and the features available in that edition." },
      { situation: "Marketing and product teams use different event definitions", approach: "Fix the measurement plan first", reason: "Changing software does not resolve incompatible definitions of a signup, lead or active user." },
    ],
    sections: [
      { heading: "Use one event dictionary", text: "Define each event, the page where it occurs and the properties required to interpret it. Send a test conversion once and confirm how each product counts it. Check for duplicate events during client-side navigation. Avoid putting email addresses, form text or other unnecessary identifying information in event properties. A migration should preserve meaningful definitions rather than reproduce every old event automatically." },
      { heading: "Investigate disagreement before judging a product", text: "Two dashboards can differ because of time zones, bot filtering, blocked requests or metric definitions. Compare a controlled test session and inspect the implementation before treating one total as correct. Keep an annotation for the installation or migration date. Neither analytics page views nor visitors are the same metric as Search Console impressions, which describe appearances in Google results." },
      { heading: "Review the chosen deployment's data flow", text: "List where the tracker sends information, who has dashboard access and how long the data is retained. Review the current documentation for the exact features you enable. Privacy requirements depend on your implementation and circumstances; a product's marketing description is not an independent legal assessment. Include operating costs and the effort of preserving historical reporting in the buying decision." },
    ],
    exercise: ["Define one page view, one campaign visit and one conversion.", "Run a controlled visit and check for duplicate or missing events.", "Compare the same time zone, filters and event definitions.", "Document hosting, access, retention and the historical-data migration plan."],
    sources: [{ label: "Umami official documentation", url: "https://docs.umami.is/docs" }, { label: "Plausible official documentation", url: "https://plausible.io/docs" }],
  },
  "vaultwarden-vs-bitwarden": {
    reviewedAt: "2026-11-05",
    summary: "Distinguish the community-maintained compatible server from the official Bitwarden service and software. Credential storage deserves a decision based on support, recovery and maintenance ownership.",
    decision: "Evaluate Vaultwarden only with an explicit plan for operating a community server and accepting its support model. Evaluate Bitwarden's official cloud or self-hosted offering when official product support and the relevant organisational features are requirements. Compatibility alone does not establish equivalent support, security assurance or licensing.",
    rows: [
      { situation: "An individual can maintain and recover a personal server", approach: "Investigate Vaultwarden's operating requirements", reason: "Check supported clients, release guidance, backups and the responsibility you are accepting." },
      { situation: "An organisation needs an official vendor relationship", approach: "Evaluate Bitwarden's official offering", reason: "Confirm the exact support, administration and commercial terms required by the organisation." },
      { situation: "Nobody can own updates and emergency recovery", approach: "Resolve that gap before self-hosting", reason: "An inexpensive server does not supply an operator when credentials become unavailable." },
    ],
    sections: [
      { heading: "Do not equate compatibility with affiliation", text: "Vaultwarden describes itself as an unofficial Bitwarden-compatible server. Treat its project documentation and support channels separately from Bitwarden's official offering. Check the exact client and server versions you intend to operate. A familiar interface is not evidence that both routes have the same organisational features or that one vendor will support another project's deployment." },
      { heading: "Plan recovery before migrating credentials", text: "Decide how account access, administrative ownership and recovery material will be maintained. Rehearse a restoration with non-sensitive test records in an isolated environment. Store recovery information so that a single lost account or unavailable server does not remove every route back into the system. Do not upload real credentials to a trial merely to populate a comparison screenshot." },
      { heading: "Include maintenance and exit costs", text: "For a self-hosted route, include the server, encrypted backup storage, updates and incident response. For a managed route, confirm the plan and organisation controls needed by your users. Test a sample export and the process for removing a member. This is a review of documented operating choices, not a penetration test or a claim that either configuration is secure simply because it starts successfully." },
    ],
    exercise: ["Document the intended server, clients, account owner and support route.", "Use disposable credentials to test adding and removing a member.", "Restore an isolated test backup and verify the records.", "Record the migration, recovery and exit procedures before moving real secrets."],
    sources: [{ label: "Vaultwarden project and support model", url: "https://github.com/dani-garcia/vaultwarden" }, { label: "Bitwarden official self-hosting documentation", url: "https://bitwarden.com/help/install-on-premise-linux/" }],
  },
};
