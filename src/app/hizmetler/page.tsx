import Link from "next/link";
import BrowseLayout from "@/components/BrowseLayout";
import { browseParams, type SearchParams } from "@/lib/browse";
import MarketplaceCard from "@/components/MarketplaceCard";
import { publicMetadata } from "@/lib/seo";
import { listServices } from "./data";
import styles from "./services.module.css";

const title = "Freelancer Hizmetleri";
const description = "Frenaw uzmanlarının sunduğu hizmetleri keşfet. Teslim kapsamını incele, freelancer ile doğrudan konuş ve birlikte netleştir.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = browseParams(await searchParams);
  return publicMetadata({ title, description, path: "/hizmetler", index: !filters.q && !filters.category && filters.page === 1 });
}

export default async function ServicesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = { ...browseParams(await searchParams), sort: "" };
  const result = await listServices(filters);
  return (
    <BrowseLayout title={title} description={description} path="/hizmetler" filters={filters}
      count={result.items.length} next={result.next} available={result.available}
      sorts={[{ value: "", title: "En yeni" }]}
      action={<Link href="/hizmetler/yayinla" className="btn-primary">Hizmet yayınla</Link>}>
      <div className={styles.grid}>
        {result.items.map((service) => <MarketplaceCard key={service.id} variant="service" href={"/hizmetler/" + service.id} category={service.category} title={service.title} description={service.description} person={service.name} personHref={"/profil/" + encodeURIComponent(service.username)} budget={service.budget_range}/>)}
      </div>
    </BrowseLayout>
  );
}
