import type { Metadata } from "next";

import { ProjectCard } from "@/components/cards/project-card";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { PageHero } from "@/components/sections/page-hero";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/constants";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "项目"
};

interface ProjectsPageProps {
  searchParams: {
    page?: string;
    keyword?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const page = Number(searchParams.page || "1");
  const projectPage = await getProjects({
    pageNum: page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    keyword: searchParams.keyword
  });

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Project Wall"
        title="项目"
        description="把项目整理成更适合浏览与回看的形式，既保留进展与技术信息，也让页面本身更像一面安静、有节奏的作品墙。"
      />

      <section className="page-panel p-5 md:p-6">
        <SearchBar
          action="/projects"
          placeholder="搜索项目名、简介或技术栈"
          defaultValue={searchParams.keyword}
        />
      </section>

      {projectPage.list.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projectPage.list.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={projectPage.pageSize}
            total={projectPage.total}
            pathname="/projects"
            query={{ keyword: searchParams.keyword }}
          />
        </>
      ) : (
        <EmptyState
          title="暂时还没有匹配的项目"
          description="可以换个关键词，或者先从首页推荐的项目开始浏览。"
          actionHref="/"
          actionLabel="回到首页"
        />
      )}
    </div>
  );
}
