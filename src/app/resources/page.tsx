import type { Metadata } from "next";

import { ResourceCard } from "@/components/cards/resource-card";
import { PageHero } from "@/components/sections/page-hero";
import { getResources } from "@/lib/api";

export const metadata: Metadata = {
  title: "资源"
};

export default async function ResourcesPage() {
  const collections = await getResources();

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Resource Atlas"
        title="资源分享"
        description="把常用文档、课程、工具和参考资料整理成更松弛的索引，方便回看，也为后续持续补充预留出清晰的秩序。"
      />

      <div className="space-y-8 md:space-y-10">
        {collections.map((collection) => (
          <section key={collection.id} id={collection.slug} className="space-y-5">
            <div className="page-panel px-5 py-5 md:px-6">
              <p className="page-section-kicker">Resource Collection</p>
              <div className="mt-3 max-w-3xl space-y-2.5">
                <h2 className="page-section-title">{collection.name}</h2>
                <p className="page-section-description">{collection.description}</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {collection.items?.map((item) => (
                <ResourceCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
