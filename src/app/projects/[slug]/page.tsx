import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarRange, Github, Globe2 } from "lucide-react";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { TagList } from "@/components/common/tag-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProjectBySlug } from "@/lib/api";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, splitCommaText } from "@/lib/utils";

interface ProjectDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params
}: ProjectDetailPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  return {
    title: project ? project.name : "项目不存在",
    description: project?.summary
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="detail-shell mx-auto max-w-5xl">
      <Card className="page-panel overflow-hidden">
        <div className="space-y-6 p-6 md:p-8">
          <Link href="/projects" className="detail-backlink">
            <ArrowLeft className="h-4 w-4" />
            返回项目列表
          </Link>
          <div className="space-y-4">
            <p className="detail-kicker">
              {PROJECT_STATUS_LABELS[project.status ?? ""] ?? project.status}
            </p>
            <h1 className="detail-title">{project.name}</h1>
            <p className="detail-summary">{project.summary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                <Button className="page-button-text">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
            ) : null}
            {project.demoUrl ? (
              <a href={project.demoUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="page-button-text">
                  <Globe2 className="h-4 w-4" />
                  在线预览
                </Button>
              </a>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <TagList tags={splitCommaText(project.techStack)} />
            <div className="page-note-panel">
              <p className="page-note-copy inline-flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                {formatDate(project.startDate, "YYYY.MM")} -{" "}
                {project.endDate ? formatDate(project.endDate, "YYYY.MM") : "至今"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="page-panel p-6 md:p-9">
        <MarkdownRenderer content={project.descriptionMd} />
      </Card>
    </div>
  );
}
