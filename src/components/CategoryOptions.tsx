import { CATEGORY_GROUPS } from "@/lib/categories";

export default function CategoryOptions({ allLabel }: { allLabel?: string }) {
  return (
    <>
      {allLabel && <option value="">{allLabel}</option>}
      {CATEGORY_GROUPS.map((category) => (
        <optgroup key={category.slug} label={category.title}>
          <option value={category.slug}>{category.title} (tümü)</option>
          {category.specialties.map((specialty) => <option key={specialty.slug} value={specialty.slug}>{specialty.title}</option>)}
        </optgroup>
      ))}
      <option value="Genel">Genel</option>
    </>
  );
}
