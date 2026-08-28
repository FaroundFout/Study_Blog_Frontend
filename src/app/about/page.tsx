import type { Metadata } from "next";

import { AboutNarrative } from "@/components/about/about-narrative";
import { CatalogPage } from "@/components/sections/catalog-page";
import { getSiteInfo } from "@/lib/api";

export const metadata: Metadata = {
  title: "关于"
};

export default async function AboutPage() {
  const siteInfo = await getSiteInfo();

  return (
    <CatalogPage
      index="06"
      eyebrow="About This Site"
      title="关于"
      description=""
    >
      <AboutNarrative siteInfo={siteInfo} />
    </CatalogPage>
  );
}
