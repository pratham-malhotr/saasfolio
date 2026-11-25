export function BrandAvatar({ name, letters, category, className = "" }: {
  name: string;
  letters?: string;
  category?: string;
  className?: string;
}) {
  const initials = name.trim().split(/[\s.-]+/).slice(0, 2).map(word => word.charAt(0)).join("");

  return (
    <span aria-hidden="true" data-category={category} className={`brand-avatar ${className}`}>
      {letters || initials.toUpperCase() || "#"}
    </span>
  );
}
