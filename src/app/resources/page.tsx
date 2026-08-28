import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ResourceAtlasExplorer } from "@/components/resources/resource-atlas-explorer";
import { CatalogPage } from "@/components/sections/catalog-page";
import { getResources } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "资源"
};

export default async function ResourcesPage() {
  const collections = await getResources();
  const updateDates = collections
    .flatMap((collection) => [collection.createdAt, ...(collection.items ?? []).map((item) => item.createdAt)])
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => Date.parse(right) - Date.parse(left));
  const lastUpdated = updateDates[0];
  const lastUpdatedLabel = lastUpdated ? formatDate(lastUpdated, "YYYY / MM / DD") : "—";
  const catalogYear = lastUpdated ? formatDate(lastUpdated, "YYYY") : "INDEX";

  return (
    <CatalogPage
      index="04"
      eyebrow="Resource Atlas"
      title="资源分享"
      description="精心整理的学习与创作资源，按主题归类，持续更新，助你更高效地学习与实践。"
      mobileShowControls={false}
    >
      <>
        <ResourceAtlasExplorer collections={collections} />

        <footer className="resource-catalog-footer">
          <div className="resource-footer-identity">
            <span className="resource-footer-books" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              <strong>Study Garden Library</strong>
              <small>资源索引卡 · Resource index card</small>
            </span>
          </div>

          <dl className="resource-footer-meta">
            <div>
              <dt>Catalog code</dt>
              <dd>SG—RES—{catalogYear}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{lastUpdatedLabel}</dd>
            </div>
          </dl>

          <p className="resource-footer-note">
            持续整理中，更多资源陆续上架
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </p>

          <p className="resource-footer-source">
            <strong>数据来源</strong>
            <span>
              站内目录来自公开资源接口 <code>/api/public/resources</code>；开发环境接口不可用时回退至本地示例数据，外链内容归对应官方网站或第三方站点所有。
            </span>
          </p>
        </footer>
      </>
    </CatalogPage>
  );
}
