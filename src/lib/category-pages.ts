import { getCategory, getSpecialty, categoryPath } from "@/lib/categories";

export function getCategoryPage(slug: string, specialtySlug?: string) {
  const group = getCategory(slug);
  if (!group || group.slug !== slug) return null;
  const specialty = specialtySlug ? getSpecialty(slug, specialtySlug) : null;
  if (specialtySlug && specialty?.slug !== specialtySlug) return null;

  return {
    group,
    specialty,
    value: specialty?.slug ?? group.slug,
    path: categoryPath(specialty?.slug ?? group.slug),
    title: specialty?.title ?? group.title,
    description: specialty ? specialty.title + " için açık proje ilanlarını ve Frenaw’daki ilgili uzmanları inceleyin." : group.description,
  };
}

export type CategoryPageData = NonNullable<ReturnType<typeof getCategoryPage>>;

export function categoryHasIndexableInventory(category: CategoryPageData, inventory: Map<string, number>) {
  if (category.specialty) return (inventory.get(category.specialty.slug) ?? 0) >= 3;
  return [category.group.slug, ...category.group.specialties.map(({ slug }) => slug)]
    .some((slug) => (inventory.get(slug) ?? 0) > 0);
}
