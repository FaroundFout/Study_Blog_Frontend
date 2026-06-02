import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Github, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { getProjectCoverImage, splitCommaText } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  const href = `/projects/${encodeURIComponent(project.slug)}`;
  const coverImage = getProjectCoverImage(project);

  return (
    <Link href={href} className="group block">
      <Card className="page-card-shell">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border/60 bg-accent/55">
          <Image
            src={coverImage}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 via-black/0 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {project.isFeatured ? <Badge>推荐</Badge> : null}
            {project.status ? (
              <Badge variant="secondary">
                {PROJECT_STATUS_LABELS[project.status] ?? project.status}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="page-card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <h3 className="page-card-title transition-colors group-hover:text-primary">
                {project.name}
              </h3>
              <p className="page-card-summary line-clamp-3">{project.summary}</p>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>

          <div className="flex flex-wrap gap-2">
            {splitCommaText(project.techStack)
              .slice(0, 4)
              .map((stack) => (
                <Badge key={stack} variant="secondary">
                  {stack}
                </Badge>
              ))}
          </div>

          <div className="page-card-divider page-card-meta flex items-center gap-4">
            {project.githubUrl ? (
              <span className="inline-flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </span>
            ) : null}
            {project.demoUrl ? (
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                Demo
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
