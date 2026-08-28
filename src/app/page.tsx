import { HomeDesktopBoard } from "@/components/sections/home-desktop-board";
import { getCurrentHomeMusic, getHomeData } from "@/lib/api";

export default async function HomePage() {
  const [homeData, currentMusic] = await Promise.all([getHomeData(), getCurrentHomeMusic()]);
  const featuredArticle = homeData.latestArticles.find((article) => article.isTop === 1)
    ?? homeData.latestArticles[0];

  return (
    <HomeDesktopBoard
      featuredArticle={featuredArticle}
      latestArticles={homeData.latestArticles}
      latestDiaries={homeData.latestDiaries}
      featuredProject={homeData.featuredProjects[0]}
      resourceCollections={homeData.resourceCollections}
      currentMusic={currentMusic}
    />
  );
}
