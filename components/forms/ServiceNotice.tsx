export function ServiceNotice({ status, emailHref = "mailto:support@saasfolio.tech" }: { status: "loading" | "available" | "unavailable"; emailHref?: string }) {
  if (status === "available") return null;
  return <p role="status" className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-zinc-300">{status === "loading" ? "Checking online service availability…" : <>This online service is temporarily unavailable. You can <a href={emailHref} className="text-[#C6FF3D] underline">contact SaaSFolio by email</a>. Browsing software and discount guides does not require an account.</>}</p>;
}
