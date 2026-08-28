import { Activity, Grid2X2, RotateCcw, Star } from "lucide-react";
import Link from "next/link";

import { PROJECT_STAGES, normalizeProjectStage } from "@/components/projects/project-status";
import type { Project } from "@/types";

interface ProjectStatusSystemProps {
  projects: Project[];
  total: number;
  featuredOnly: boolean;
}

export function ProjectStatusSystem({ projects, total, featuredOnly }: ProjectStatusSystemProps) {
  const stageCounts = PROJECT_STAGES.reduce<Record<string, number>>((counts, stage) => {
    counts[stage.key] = projects.filter(
      (project) => normalizeProjectStage(project.status) === stage.key
    ).length;
    return counts;
  }, {});
  const featuredCount = projects.filter((project) => project.isFeatured === 1).length;

  return (
    <div className="project-status-system">
      <div className="project-view-row">
        <div>
          <p className="article-filter-label">Project view / 作品视图</p>
          <nav className="project-view-switch" aria-label="项目展示范围">
            <Link
              href="/projects"
              className={!featuredOnly ? "project-view-link-active" : undefined}
              aria-current={!featuredOnly ? "page" : undefined}
            >
              <Grid2X2 aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
              全部作品
            </Link>
            <Link
              href="/projects?featured=1"
              className={featuredOnly ? "project-view-link-active" : undefined}
              aria-current={featuredOnly ? "page" : undefined}
            >
              <Star aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
              推荐作品
            </Link>
          </nav>
        </div>

        <dl className="project-view-overview" aria-label="项目视图统计">
          <div>
            <dt>视图总数</dt>
            <dd>{String(total).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>本页推荐</dt>
            <dd>{String(featuredCount).padStart(2, "0")}</dd>
          </div>
        </dl>
      </div>

      <div className="project-stage-register">
        <div className="project-stage-heading">
          <Activity aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
          <span>当前页状态轨道</span>
        </div>
        <ol className="project-stage-track">
          {PROJECT_STAGES.map((stage, index) => (
            <li key={stage.key} className={`project-stage-${stage.key}`}>
              <span className="project-stage-node" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="project-stage-copy">
                <strong>{stage.label}</strong>
                <small>{stage.code}</small>
              </span>
              <span className="project-stage-count">{stageCounts[stage.key] ?? 0}</span>
            </li>
          ))}
        </ol>
        {featuredOnly ? (
          <Link href="/projects" className="article-filter-reset project-view-reset">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.75]" />
            查看全部
          </Link>
        ) : (
          <span className="project-view-mode">Public works / 公开作品</span>
        )}
      </div>
    </div>
  );
}
