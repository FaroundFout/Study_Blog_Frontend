"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AdminMarkdownPreview } from "@/components/admin/admin-markdown-preview";
import {
  AdminNotice,
  AdminPageSkeleton,
  adminFieldLabelClassName,
  adminSelectClassName
} from "@/components/admin/admin-page-kit";
import { AdminStateBadge } from "@/components/admin/admin-state-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAdminDiary, getAdminDiaryById, updateAdminDiary } from "@/lib/api";
import { DIARY_VISIBILITY_LABELS } from "@/lib/constants";
import { splitCommaText } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { AdminDiarySavePayload, DiaryDetail } from "@/types";

interface DiaryFormState {
  diaryDate: string;
  title: string;
  contentMd: string;
  mood: string;
  studyHours: string;
  tagsText: string;
  visibility: "public" | "private";
}

const emptyForm: DiaryFormState = {
  diaryDate: "",
  title: "",
  contentMd: "",
  mood: "",
  studyHours: "0",
  tagsText: "",
  visibility: "public"
};

function mapDiaryToForm(diary: DiaryDetail): DiaryFormState {
  return {
    diaryDate: diary.diaryDate || "",
    title: diary.title || "",
    contentMd: diary.contentMd || "",
    mood: diary.mood || "",
    studyHours: String(diary.studyHours ?? 0),
    tagsText: diary.tagsText || "",
    visibility: diary.visibility === "private" ? "private" : "public"
  };
}

export function AdminDiaryEditor({
  diaryId
}: {
  diaryId?: number;
}) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<DiaryFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = diaryId !== undefined;

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    if (!diaryId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminDiaryById(token, diaryId)
      .then((payload) => {
        if (!cancelled && payload) {
          setForm(mapDiaryToForm(payload));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载日记失败。"
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
  }, [diaryId, hydrated, token]);

  const previewContent = useMemo(
    () => form.contentMd.trim() || "## 在这里写下今天学了什么\n\n右侧会实时预览 Markdown 内容。",
    [form.contentMd],
  );

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!form.title.trim()) {
      setNotice({ tone: "error", text: "请先填写日记标题。" });
      return;
    }

    if (!form.diaryDate) {
      setNotice({ tone: "error", text: "请先选择日期。" });
      return;
    }

    if (!form.contentMd.trim()) {
      setNotice({ tone: "error", text: "正文不能为空。" });
      return;
    }

    setSaving(true);
    setNotice({ tone: "info", text: "正在保存日记..." });

    try {
      const payload: AdminDiarySavePayload = {
        diaryDate: form.diaryDate,
        title: form.title.trim(),
        contentMd: form.contentMd.trim(),
        mood: form.mood.trim() || undefined,
        studyHours: Number(form.studyHours || "0"),
        tagsText: form.tagsText.trim() || undefined,
        visibility: form.visibility
      };

      if (isEditing && diaryId) {
        await updateAdminDiary(token, diaryId, payload);
        setNotice({ tone: "success", text: "日记已更新。" });
      } else {
        const createdId = await createAdminDiary(token, payload);
        setNotice({ tone: "success", text: "日记已创建。" });
        router.replace(`/admin/diaries/${createdId}`);
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
              href="/admin/diaries"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              返回日记列表
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStateBadge
                  label={DIARY_VISIBILITY_LABELS[form.visibility]}
                  tone={form.visibility === "private" ? "slate" : "mint"}
                />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                {isEditing ? "编辑学习日记" : "写一篇学习日记"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                这里适合记录每天的学习节奏、状态和一点点推进。编辑器保持和前台一致的明亮阅读感。
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存日记
          </Button>
        </div>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Title</p>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="例如：今天把首页布局终于调顺了"
                className="h-14 rounded-[1.2rem] text-base"
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Markdown</p>
              <Textarea
                value={form.contentMd}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contentMd: event.target.value }))
                }
                placeholder="记录今天学了什么、踩了哪些坑、下一步打算做什么。"
                className="min-h-[560px] rounded-[1.5rem] bg-[#fbfaf5] font-mono text-[13px] leading-7"
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border/60 px-5 py-4 md:px-6">
              <p className="text-sm font-semibold text-foreground">阅读预览</p>
              <p className="mt-1 text-sm text-muted-foreground">
                这里会更接近前台最终的 Markdown 阅读效果。
              </p>
            </div>
            <div className="space-y-5 p-5 md:p-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {form.title || "这里会显示日记标题"}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {splitCommaText(form.tagsText).length ? (
                    splitCommaText(form.tagsText).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded-full bg-accent/78 px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">暂未填写标签</span>
                  )}
                </div>
              </div>
              <div className="rounded-[1.55rem] border border-border/60 bg-background/72 p-5 md:p-6">
                <AdminMarkdownPreview content={previewContent} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <div className="grid gap-4">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Date</p>
                <Input
                  type="date"
                  value={form.diaryDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, diaryDate: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <p className={adminFieldLabelClassName}>Mood</p>
                  <Input
                    value={form.mood}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, mood: event.target.value }))
                    }
                    placeholder="focus / calm / curious"
                  />
                </div>
                <div className="space-y-2">
                  <p className={adminFieldLabelClassName}>Study Hours</p>
                  <Input
                    type="number"
                    step="0.5"
                    value={form.studyHours}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, studyHours: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Tags</p>
                <Input
                  value={form.tagsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tagsText: event.target.value }))
                  }
                  placeholder="Next.js, 布局, 联调"
                />
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Visibility</p>
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value === "private" ? "private" : "public"
                    }))
                  }
                  className={adminSelectClassName}
                >
                  <option value="public">公开</option>
                  <option value="private">私密</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {form.diaryDate || "未设置日期"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {form.studyHours || "0"} h
            </div>
            <div className="rounded-[1.3rem] border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              当前可见性：
              <span className="ml-2 inline-flex">
                <AdminStateBadge
                  label={DIARY_VISIBILITY_LABELS[form.visibility]}
                  tone={form.visibility === "private" ? "slate" : "mint"}
                />
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
