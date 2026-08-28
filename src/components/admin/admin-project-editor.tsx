"use client";

import Link from "next/link";
import { ArrowLeft, Eye, Loader2, Save, Sparkles, Star } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useMemo, useState } from "react";

import { AdminMarkdownPreview } from "@/components/admin/admin-markdown-preview";
import { AdminMediaField } from "@/components/admin/admin-media-field";
import {
  AdminNotice,
  AdminPageSkeleton,
  adminFieldLabelClassName,
  adminMarkdownTextareaClassName,
  adminSelectClassName
} from "@/components/admin/admin-page-kit";
import { AdminStateBadge } from "@/components/admin/admin-state-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAdminProject, getAdminProjectById, updateAdminProject } from "@/lib/api";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";
import type { AdminProjectSavePayload, ProjectDetail } from "@/types";

interface ProjectFormState {
  name: string;
  slug: string;
  summary: string;
  descriptionMd: string;
  techStack: string;
  githubUrl: string;
  demoUrl: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  status: "planning" | "ongoing" | "completed";
  sort: string;
  isFeatured: boolean;
}

const emptyForm: ProjectFormState = {
  name: "",
  slug: "",
  summary: "",
  descriptionMd: "",
  techStack: "",
  githubUrl: "",
  demoUrl: "",
  coverImage: "",
  startDate: "",
  endDate: "",
  status: "planning",
  sort: "0",
  isFeatured: false
};

function buildSlugFromName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=<>{}[\]|\\:;"'?,./\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeProjectStatus(status?: string): ProjectFormState["status"] {
  if (status === "planning" || status === "ongoing" || status === "completed") {
    return status;
  }

  if (status === "active") {
    return "ongoing";
  }

  if (status === "archived") {
    return "completed";
  }

  return "planning";
}

function mapProjectToForm(project: ProjectDetail): ProjectFormState {
  return {
    name: project.name || "",
    slug: project.slug || "",
    summary: project.summary || "",
    descriptionMd: project.descriptionMd || "",
    techStack: project.techStack || "",
    githubUrl: project.githubUrl || "",
    demoUrl: project.demoUrl || "",
    coverImage: project.coverImage || "",
    startDate: project.startDate || "",
    endDate: project.endDate || "",
    status: normalizeProjectStatus(project.status),
    sort: String(project.sort ?? 0),
    isFeatured: project.isFeatured === 1
  };
}

function projectTone(status: ProjectFormState["status"]) {
  if (status === "completed") {
    return "sky";
  }
  if (status === "planning") {
    return "amber";
  }
  return "mint";
}

export function AdminProjectEditor({
  projectId
}: {
  projectId?: number;
}) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(projectId));
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = projectId !== undefined;
  const publicPreviewHref = form.slug ? `/projects/${encodeURIComponent(form.slug)}` : "";

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    if (!projectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminProjectById(token, projectId)
      .then((payload) => {
        if (!cancelled && payload) {
          setForm(mapProjectToForm(payload));
          setSlugEdited(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载项目详情失败。"
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, projectId, token]);

  const previewContent = useMemo(
    () => form.descriptionMd.trim() || "## 项目说明\n\n右侧会实时预览项目说明的 Markdown 内容。",
    [form.descriptionMd],
  );

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!form.name.trim()) {
      setNotice({ tone: "error", text: "请先填写项目名称。" });
      return;
    }

    if (!form.slug.trim()) {
      setNotice({ tone: "error", text: "请先填写 slug。" });
      return;
    }

    setSaving(true);
    setNotice({ tone: "info", text: "正在保存项目..." });

    try {
      const payload: AdminProjectSavePayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || undefined,
        descriptionMd: form.descriptionMd.trim() || undefined,
        techStack: form.techStack.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        demoUrl: form.demoUrl.trim() || undefined,
        coverImage: form.coverImage.trim() || undefined,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status,
        sort: Number(form.sort || "0"),
        isFeatured: form.isFeatured ? 1 : 0
      };

      if (isEditing && projectId) {
        await updateAdminProject(token, projectId, payload);
        setNotice({ tone: "success", text: "项目已更新。" });
      } else {
        const createdId = await createAdminProject(token, payload);
        setNotice({ tone: "success", text: "项目已创建。" });
        router.replace(`/admin/projects/${createdId}`);
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存失败，请稍后再试。"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || !token || loading) {
    return <AdminPageSkeleton sections={3} />;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              返回项目列表
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStateBadge
                  label={PROJECT_STATUS_LABELS[form.status]}
                  tone={projectTone(form.status)}
                />
                {form.isFeatured ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e7d3ab]/45 bg-[#fff7df] px-2.5 py-1 text-[11px] text-[#9a7d42] dark:border-[#e7b95d]/24 dark:bg-[#332612]/88 dark:text-[#f4dea6]">
                    <Star className="h-3.5 w-3.5" />
                    推荐项目
                  </span>
                ) : null}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                {isEditing ? "编辑项目" : "新建项目"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                项目编辑器会把摘要、说明、技术栈、封面和外链整理在一处，方便前台项目页统一消费。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isEditing && publicPreviewHref ? (
              <Link href={publicPreviewHref} target="_blank" className="inline-flex">
                <Button variant="secondary">
                  <Eye className="h-4 w-4" />
                  预览前台
                </Button>
              </Link>
            ) : null}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存项目
            </Button>
          </div>
        </div>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Name</p>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug: slugEdited ? current.slug : buildSlugFromName(event.target.value)
                    }))
                  }
                  placeholder="Study Garden Frontend"
                  className="h-14 rounded-[1.2rem] text-base"
                />
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Slug</p>
                <Input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setForm((current) => ({ ...current, slug: event.target.value }));
                  }}
                  placeholder="study-garden-frontend"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Summary</p>
              <Textarea
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summary: event.target.value }))
                }
                placeholder="用两三句话概括项目想解决的问题。"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className={adminFieldLabelClassName}>Description Markdown</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-[#4dcfc4]" />
                  实时预览已开启
                </div>
              </div>
              <Textarea
                value={form.descriptionMd}
                onChange={(event) =>
                  setForm((current) => ({ ...current, descriptionMd: event.target.value }))
                }
                placeholder="## 项目说明"
                className={`min-h-[520px] ${adminMarkdownTextareaClassName}`}
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border/60 px-5 py-4 md:px-6">
              <p className="text-sm font-semibold text-foreground">项目说明预览</p>
              <p className="mt-1 text-sm text-muted-foreground">
                这里会尽量贴近前台项目详情页的 Markdown 阅读效果。
              </p>
            </div>
            <div className="space-y-5 p-5 md:p-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {form.name || "这里会显示项目名称"}
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-muted-foreground">
                  {form.summary || "写好摘要后，这里会更接近前台项目卡片的展示效果。"}
                </p>
              </div>
              <div className="rounded-[1.55rem] border border-border/60 bg-background/72 p-5 md:p-6">
                <AdminMarkdownPreview content={previewContent} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Tech Stack</p>
              <Input
                value={form.techStack}
                onChange={(event) =>
                  setForm((current) => ({ ...current, techStack: event.target.value }))
                }
                placeholder="Next.js, TypeScript, Tailwind CSS"
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>GitHub URL</p>
              <Input
                value={form.githubUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, githubUrl: event.target.value }))
                }
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Demo URL</p>
              <Input
                value={form.demoUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, demoUrl: event.target.value }))
                }
                placeholder="https://demo.example.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Start Date</p>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>End Date</p>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Status</p>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as ProjectFormState["status"]
                    }))
                  }
                  className={adminSelectClassName}
                >
                  <option value="planning">规划中</option>
                  <option value="ongoing">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Sort</p>
                <Input
                  type="number"
                  value={form.sort}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sort: event.target.value }))
                  }
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, isFeatured: !current.isFeatured }))
              }
              className={`flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left transition-all ${
                form.isFeatured
                  ? "border-[#63d4cb]/45 bg-[#eefaf7] text-[#247c76] dark:border-[#2dd4bf]/22 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-slate-100"
              }`}
            >
              <div>
                <p className="text-sm font-medium">推荐项目</p>
                <p className="mt-1 text-xs leading-5 opacity-80">
                  开启后，这个项目会更适合在首页或项目页重点展示。
                </p>
              </div>
              <span className="text-sm">{form.isFeatured ? "已开启" : "未开启"}</span>
            </button>
          </Card>

          <Card className="space-y-5 p-5">
            <AdminMediaField
              label="Cover"
              value={form.coverImage}
              onChange={(value) => setForm((current) => ({ ...current, coverImage: value }))}
              placeholder="https://example.com/project-cover.png"
              helperText="建议使用横向封面，便于项目列表和详情页统一展示。"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
