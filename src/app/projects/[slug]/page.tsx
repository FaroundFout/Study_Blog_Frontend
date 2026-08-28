import type { Metadata } from "next";
import { Github, Globe2 } from "lucide-react";
import { notFound } from "next/navigation";

import { ProjectCaseStudy } from "@/components/projects/project-case-study";
import { getProjectBySlug, getProjectNavigation } from "@/lib/api";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { extractHeadings, formatDate, splitCommaText } from "@/lib/utils";

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
    title: project?.name || "项目不存在",
    description: project?.summary
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const navigation = await getProjectNavigation(params.slug);
  const status = PROJECT_STATUS_LABELS[project.status ?? ""] ?? project.status ?? "未设置";
  const techStack = splitCommaText(project.techStack);
  const timeline = getProjectTimeline(project.startDate, project.endDate);
  const githubUrl = getPublicWebUrl(project.githubUrl);
  const demoUrl = getPublicWebUrl(project.demoUrl);
  const actions = [
    githubUrl
      ? { label: "GitHub", href: githubUrl, icon: Github, external: true }
      : null,
    demoUrl
      ? { label: "在线预览", href: demoUrl, icon: Globe2, external: true }
      : null
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <ProjectCaseStudy
      recordNumber={`P-${String(project.id).padStart(3, "0")}`}
      title={project.name}
      summary={project.summary}
      status={status}
      statusHref={`/projects?status=${project.status || ""}`}
      timeline={timeline}
      techStack={techStack}
      actions={actions}
      coverImage={project.coverImage}
      coverAlt={`${project.name} 项目封面`}
      content={project.descriptionMd}
      headings={extractHeadings(project.descriptionMd)}
      previous={navigation.prev ? { label: navigation.prev.name, href: `/projects/${navigation.prev.slug}` } : null}
      next={navigation.next ? { label: navigation.next.name, href: `/projects/${navigation.next.slug}` } : null}
    />
  );
}

function getProjectTimeline(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return `${formatDate(startDate, "YYYY.MM")} — ${formatDate(endDate, "YYYY.MM")}`;
  }

  if (startDate) {
    return `${formatDate(startDate, "YYYY.MM")} — 至今`;
  }

  if (endDate) {
    return `截至 ${formatDate(endDate, "YYYY.MM")}`;
  }

  return undefined;
}

function getPublicWebUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
