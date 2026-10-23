import { BrandMark } from "@/components/brand/BrandMark";

export function SocialImage({ title, label = "SAAS DISCOUNTS & SOFTWARE DEALS" }: { title: string; label?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", background: "#050505", color: "#ededed", fontFamily: "sans-serif", borderBottom: "12px solid #c6ff3d" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, color: "#ededed", fontWeight: 700 }}><BrandMark size={54} />SaaSFolio</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ fontSize: 20, color: "#c6ff3d", letterSpacing: 3 }}>{label}</div>
        <div style={{ display: "flex", fontSize: title.length > 90 ? 48 : 64, fontWeight: 700, lineHeight: 1.12 }}>{title}</div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#a1a1aa" }}>saasfolio.tech</div>
    </div>
  );
}
