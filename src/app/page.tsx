import { HomeDesktopBoard } from "@/components/sections/home-desktop-board";
import { getCurrentHomeMusic, getFeaturedArticle, getHomeData } from "@/lib/api";

export default async function HomePage() {
  const [homeData, currentMusic] = await Promise.all([getHomeData(), getCurrentHomeMusic()]);
  const latestArticle = homeData.latestArticles[0] ?? getFeaturedArticle();
  const initialNowIso = new Date().toISOString();

  return (
    <HomeDesktopBoard
      siteInfo={homeData.siteInfo}
      latestArticle={latestArticle}
      featuredProject={homeData.featuredProjects[0]}
      resourceCollection={homeData.resourceCollections[1] ?? homeData.resourceCollections[0]}
      currentMusic={currentMusic}
      initialNowIso={initialNowIso}
      displayName="wwt"
    />
  );
}
