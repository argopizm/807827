import Image from "next/image";
import { Star } from "lucide-react";
import BrowseLayout from "@/components/BrowseLayout";
import { browseFreelancers, browseParams, type SearchParams } from "@/lib/browse";
import { publicMetadata } from "@/lib/seo";


const path = "/profil";
const title = "Freelancer Bul";
const description = "Frenaw’da uzmanlık, yetenek ve geçmiş proje değerlendirmelerine göre Türkiye’deki freelancer profillerini inceleyin.";

async function getFilters(searchParams: Promise<SearchParams>) {
  const filters = browseParams(await searchParams);
  return { ...filters, sort: filters.sort === "is" ? "is" : "" };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await getFilters(searchParams);
  return publicMetadata({ title, description, path, index: !filters.q && !filters.category && !filters.sort && filters.page === 1 });
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase("tr-TR");
}

export default async function FreelancerListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await getFilters(searchParams);
  const { items, next, available } = await browseFreelancers(filters);
  return (
    <BrowseLayout
      title={title} description={description} path={path} filters={filters}
      count={items.length} next={next} available={available}
      sorts={[{ value: "", title: "En yüksek puan" }, { value: "is", title: "En çok tamamlanan iş" }]}
    >
      {items.map((profile) => {
        const href = "/profil/" + encodeURIComponent(profile.username);
        return (
          <article key={profile.id} className="fr-row">
            <span className="ava lg" aria-hidden="true">
              {profile.avatar ? <Image unoptimized src={profile.avatar} alt="" width={64} height={64} loading="lazy" referrerPolicy="no-referrer" /> : initials(profile.name)}
            </span>
            <div>
              <div className="fr-name"><h2><a href={href}>{profile.name}</a></h2></div>
              <div className="fr-title">{profile.title}</div>
              {profile.bio && <p className="fr-bio">{profile.bio}</p>}
              {profile.skills.length > 0 && <div className="tags">{profile.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}</div>}
            </div>
            <div className="fr-side">
              <span className="fr-rating"><Star size={15} fill="currentColor" aria-hidden="true" />{profile.rating > 0 ? profile.rating.toFixed(1).replace(".", ",") : "Yeni"}</span>
              <small>{profile.completed} tamamlanan iş</small>
              <a href={href} className="btn-secondary">Profili incele</a>
            </div>
          </article>
        );
      })}
    </BrowseLayout>
  );
}
