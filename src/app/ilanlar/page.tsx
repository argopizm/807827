import Link from "next/link";
import MarketplaceCard from "@/components/MarketplaceCard";
import BrowseLayout from "@/components/BrowseLayout";
import { browseJobs, browseParams, type SearchParams } from "@/lib/browse";
import { publicMetadata } from "@/lib/seo";


const path = "/ilanlar";
const title = "Freelance Proje İlanları";
const description = "Türkiye’deki freelance proje ilanlarını keşfedin. Uzmanlık alanına göre arayın ve ilan sahibine doğrudan teklif verin.";

async function getFilters(searchParams: Promise<SearchParams>) {
  const filters = browseParams(await searchParams);
  return { ...filters, sort: filters.sort === "butce" ? "butce" : "" };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await getFilters(searchParams);
  return publicMetadata({ title, description, path, index: !filters.q && !filters.category && !filters.sort && filters.page === 1 });
}

export default async function JobBoardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await getFilters(searchParams);
  const { items, next, available } = await browseJobs(filters);
  return (
    <BrowseLayout
      title={title} description={description} path={path} filters={filters}
      count={items.length} next={next} available={available}
      sorts={[{ value: "", title: "En yeni" }, { value: "butce", title: "Bütçe yüksekten düşüğe" }]}
      action={<Link href="/ilan-ver" className="btn-primary">Ücretsiz ilan ver</Link>}
    >
      {items.map((job) => {
        const href = "/isler/" + encodeURIComponent(job.id);
        return (
          <MarketplaceCard key={job.id} href={href} title={job.title} category={job.category} budget={job.budget} description={job.description} person={job.client} time={job.time} proposals={job.proposals} skills={job.skills}/>
        );
      })}
    </BrowseLayout>
  );
}
