import {
  ArrowUpRight,
  CalendarDays,
  Code2,
  ExternalLink,
  FileText,
  Globe2
} from "lucide-react";
import Link from "next/link";

import { normalizeProjectStage, type ProjectStage } from "@/components/projects/project-status";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { cn, formatDate, splitCommaText } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  index: number;
  lead?: boolean;
}

const PROJECT_STAGE_CODES: Record<ProjectStage, string> = {
  planning: "PLANNING",
  ongoing: "ACTIVE",
  completed: "COMPLETED",
  archived: "ARCHIVED"
};

const PROJECT_STAMP_LABELS: Record<ProjectStage, string> = {
  planning: "规划中",
  ongoing: "进行中",
  completed: "已完成",
  archived: "已归档"
};

export function ProjectCard({ project, index, lead = false }: ProjectCardProps) {
  const href = `/projects/${encodeURIComponent(project.slug)}`;
  const stage = normalizeProjectStage(project.status);
  const statusLabel =
    PROJECT_STATUS_LABELS[project.status ?? ""] ?? project.status ?? PROJECT_STAMP_LABELS[stage];
  const stampLabel = stage === "archived" ? PROJECT_STAMP_LABELS.archived : statusLabel;
  const startDate = formatDate(project.startDate, "YYYY / MM / DD");
  const projectYear = formatDate(project.startDate, "YYYY");
  const stacks = splitCommaText(project.techStack).slice(0, 4);
  const projectNumber = String(index).padStart(2, "0");

  return (
    <article
      className={cn(
        "project-work-card",
        lead && "project-work-card-lead",
        `project-work-card-${stage}`
      )}
    >
      <Link href={href} className="project-folder-link group" aria-label={`查看项目：${project.name}`}>
        <span className="project-folder-tab" aria-hidden="true">
          {PROJECT_STAGE_CODES[stage]}
        </span>

        <div className="project-folder-panel">
          <header className="project-folder-register">
            <span>PRJ — {projectYear} — {projectNumber}</span>
          </header>

          <div className="project-folder-sheet">
            <div className="project-folder-content">
              <span className="project-folder-punch" aria-hidden="true" />

              <div className="project-folder-copy">
                <h3>{project.name}</h3>
                {stacks.length ? (
                  <ul className="project-folder-stack" aria-label="项目技术栈">
                    {stacks.map((stack) => (
                      <li key={stack}>{stack}</li>
                    ))}
                  </ul>
                ) : null}
                <p>{project.summary}</p>
              </div>

              <span className="project-folder-stamp" aria-hidden="true">
                <strong>{stampLabel}</strong>
                <small>{PROJECT_STAGE_CODES[stage]}</small>
              </span>
            </div>

            <footer className="project-folder-footer">
              <span>
                <CalendarDays aria-hidden="true" />
                创建于 {startDate}
              </span>
              <span>
                {project.githubUrl ? <Code2 aria-hidden="true" /> : <FileText aria-hidden="true" />}
                {project.githubUrl ? "GitHub" : "项目档案"}
                <ExternalLink aria-hidden="true" className="project-folder-external" />
              </span>
              <span>
                {project.demoUrl ? <Globe2 aria-hidden="true" /> : <FileText aria-hidden="true" />}
                {project.demoUrl ? "在线预览" : "查看档案"}
                <ArrowUpRight aria-hidden="true" className="project-folder-external" />
              </span>
            </footer>
          </div>
        </div>
      </Link>
    </article>
  );
}
