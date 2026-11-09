import { notFound } from "next/navigation";
import CategoryLanding, { categoryInventory } from "@/components/CategoryLanding";
import { categoryHasIndexableInventory, getCategoryPage } from "@/lib/category-pages";
import { publicMetadata } from "@/lib/seo";


type Props = { params: Promise<{ slug: string; uzmanlik: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, uzmanlik } = await params;
  const category = getCategoryPage(slug, uzmanlik);
  if (!category) notFound();
  return publicMetadata({ ...category, index: categoryHasIndexableInventory(category, await categoryInventory()) });
}

export default async function SpecialtyPage({ params }: Props) {
  const { slug, uzmanlik } = await params;
  const category = getCategoryPage(slug, uzmanlik);
  if (!category) notFound();
  return <CategoryLanding category={category} />;
}
