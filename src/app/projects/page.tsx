import type { Metadata } from "next";

import { ProjectCard } from "@/components/cards/project-card";
import {
  CatalogNavigation,
  CatalogResultsRegion
} from "@/components/common/catalog-navigation-transition";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { CatalogPage } from "@/components/sections/catalog-page";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/constants";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "项目"
};

const PROJECT_RESULTS_ID = "project-catalog-results";

interface ProjectsPageProps {
  searchParams: {
    page?: string;
    featured?: string;
    keyword?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const page = Number(searchParams.page || "1");
  const featuredOnly = searchParams.featured === "1";
  const projectPage = await getProjects({
    pageNum: page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    featured: featuredOnly,
    keyword: searchParams.keyword
  });
  const contentKey = JSON.stringify([
    "projects",
    page,
    featuredOnly,
    searchParams.keyword ?? ""
  ]);

  return (
    <CatalogNavigation contentKey={contentKey} resultsId={PROJECT_RESULTS_ID}>
      <CatalogPage
        index="03"
        eyebrow="Project Catalog"
        title="项目"
        description="记录我正在构建的、已完成的和已归档的个人项目。每个项目都是一个想法的落地与成长。"
        mobileShowControls={false}
        controlsLabel="搜索项目"
        controlsMeta="Search / Project"
        controls={
          <div className="project-search-system">
            <SearchBar
              action="/projects"
              placeholder="搜索项目名称、摘要或技术栈…"
              defaultValue={searchParams.keyword}
              hiddenFields={{ featured: featuredOnly ? "1" : undefined }}
              showButton={false}
            />
            <p>如：Next.js、笔记、Markdown、API</p>
          </div>
        }
      >
        <CatalogResultsRegion
          id={PROJECT_RESULTS_ID}
          label="项目列表"
          variant="projects"
        >
          {projectPage.list.length ? (
            <div className="project-work-grid">
              {projectPage.list.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index + 1} lead={index === 0} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="catalog"
              title={featuredOnly ? "暂时还没有推荐项目" : "暂时还没有公开项目"}
              description="新的实践档案发布后，会按照项目优先级出现在这里。"
              actionHref={featuredOnly ? "/projects" : "/"}
              actionLabel={featuredOnly ? "查看全部项目" : "回到首页"}
            />
          )}
        </CatalogResultsRegion>

        {projectPage.list.length ? (
          <Pagination
            page={page}
            pageSize={projectPage.pageSize}
            total={projectPage.total}
            pathname="/projects"
            query={{ featured: featuredOnly ? "1" : undefined, keyword: searchParams.keyword }}
            alwaysVisible
            itemLabel="个项目"
            ariaLabel="项目分页"
          />
        ) : null}
      </CatalogPage>
    </CatalogNavigation>
  );
}
