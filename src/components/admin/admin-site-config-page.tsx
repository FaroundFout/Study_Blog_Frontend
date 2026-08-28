"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { revalidateSiteConfigPublicContent } from "@/app/actions/revalidate-public-content";
import { AdminAboutContentEditor } from "@/components/admin/admin-about-content-editor";
import { AdminMarkdownPreview } from "@/components/admin/admin-markdown-preview";
import { AdminMediaField } from "@/components/admin/admin-media-field";
import {
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton,
  adminAvatarTileClassName,
  adminFieldLabelClassName,
  adminInsetPanelClassName,
  adminMarkdownTextareaClassName,
  adminPreviewSurfaceClassName
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  parseAboutPageContent,
  serializeAboutPageContent
} from "@/lib/about-page-content";
import { getAdminSiteConfig, updateAdminSiteConfig } from "@/lib/api";
import { validateSiteConfigFields } from "@/lib/site-config-validation";
import { useAuthStore } from "@/store/auth-store";
import type { AboutPageContent, AdminSiteConfigUpdatePayload } from "@/types";

interface SiteFormState {
  siteName: string;
  siteSubtitle: string;
  homeBrandLabel: string;
  homeIntroText: string;
  logo: string;
  avatar: string;
  githubUrl: string;
  bilibiliUrl: string;
  xiaohongshuUrl: string;
  email: string;
  announcement: string;
  aboutMeMd: string;
  aboutPage: AboutPageContent;
}

const emptyForm: SiteFormState = {
  siteName: "",
  siteSubtitle: "",
  homeBrandLabel: "",
  homeIntroText: "",
  logo: "",
  avatar: "",
  githubUrl: "",
  bilibiliUrl: "",
  xiaohongshuUrl: "",
  email: "",
  announcement: "",
  aboutMeMd: "",
  aboutPage: parseAboutPageContent()
};

export function AdminSiteConfigPage() {
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<SiteFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const loadedRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { isDirty, markSaved } = useUnsavedChanges(form, hydrated && Boolean(token) && !loading);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!hydrated || !token || loadedRef.current) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminSiteConfig(token)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const loadedForm: SiteFormState = {
          siteName: payload.siteName || "",
          siteSubtitle: payload.siteSubtitle || "",
          homeBrandLabel: payload.homeBrandLabel || "",
          homeIntroText: payload.homeIntroText || "",
          logo: payload.logo || "",
          avatar: payload.avatar || "",
          githubUrl: payload.githubUrl || "",
          bilibiliUrl: payload.bilibiliUrl || "",
          xiaohongshuUrl: payload.xiaohongshuUrl || "",
          email: payload.email || "",
          announcement: payload.announcement || "",
          aboutMeMd: payload.aboutMeMd || "",
          aboutPage: parseAboutPageContent(payload.aboutPageJson)
        };
        setForm(loadedForm);
        markSaved(loadedForm);
        loadedRef.current = true;
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载站点配置失败。"
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
  }, [hydrated, markSaved, token]);

  const stats = useMemo(() => {
    const configuredLinks = [
      form.githubUrl,
      form.bilibiliUrl,
      form.xiaohongshuUrl,
      form.email
    ].filter(Boolean).length;

    return [
      { label: "已配置链接", value: configuredLinks, accent: "mint" as const },
      { label: "站点名称", value: form.siteName || "未填写", accent: "amber" as const },
      {
        label: "首页文案字数",
        value: (form.homeBrandLabel + form.homeIntroText).replace(/\s+/g, "").length,
        accent: "sky" as const
      },
      {
        label: "关于页条目",
        value: form.aboutPage.focusItems.length + form.aboutPage.milestones.length,
        accent: "mint" as const
      }
    ];
  }, [
    form.bilibiliUrl,
    form.email,
    form.githubUrl,
    form.homeBrandLabel,
    form.homeIntroText,
    form.siteName,
    form.xiaohongshuUrl,
    form.aboutPage.focusItems.length,
    form.aboutPage.milestones.length
  ]);

  const handleSave = async () => {
    if (!token || saving) {
      return;
    }

    const errors = validateSiteConfigFields(form);
    setFieldErrors(errors);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const field = formRef.current?.elements.namedItem(firstError);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    setSaving(true);
    setNotice({ tone: "info", text: "正在保存站点配置..." });

    try {
      const payload: AdminSiteConfigUpdatePayload = {
        siteName: form.siteName.trim(),
        siteSubtitle: form.siteSubtitle.trim() || undefined,
        homeBrandLabel: form.homeBrandLabel.trim() || undefined,
        homeIntroText: form.homeIntroText.trim() || undefined,
        logo: form.logo.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        bilibiliUrl: form.bilibiliUrl.trim() || undefined,
        xiaohongshuUrl: form.xiaohongshuUrl.trim() || undefined,
        email: form.email.trim() || undefined,
        announcement: form.announcement.trim() || undefined,
        aboutMeMd: form.aboutMeMd.trim() || undefined,
        aboutPageJson: serializeAboutPageContent(form.aboutPage)
      };

      await updateAdminSiteConfig(token, payload);
      markSaved(form);
      await revalidateSiteConfigPublicContent();
      setNotice({ tone: "success", text: "站点配置已更新，前台缓存已刷新。" });
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
    <form
      ref={formRef}
      noValidate
      autoComplete="off"
      className="space-y-6"
      onSubmit={(event) => {
        // Portal forms (the media picker search) have their own submit behavior.
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        void handleSave();
      }}
      onChangeCapture={(event) => {
        const field = event.target;
        if (field instanceof HTMLInputElement && fieldErrors[field.name]) {
          setFieldErrors((current) => {
            const next = { ...current };
            delete next[field.name];
            return next;
          });
        }
      }}
    >
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm leading-7 text-muted-foreground">
              这里维护的是公开页面会直接消费的站点信息，包括站点标题、首页品牌文案、公告、社交链接、Logo、头像和关于页内容。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存配置
          </Button>
        </div>

        {isDirty ? <p className="text-sm text-muted-foreground">有未保存的修改</p> : null}
        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="site-name" className={adminFieldLabelClassName}>Site Name</label>
                <Input
                  id="site-name"
                  name="siteName"
                  required
                  aria-invalid={Boolean(fieldErrors.siteName)}
                  aria-describedby={fieldErrors.siteName ? "siteName-error" : undefined}
                  value={form.siteName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, siteName: event.target.value }))
                  }
                  placeholder="Study Garden"
                />
                <SiteFieldError name="siteName" message={fieldErrors.siteName} />
              </div>

              <div className="space-y-2">
                <label htmlFor="site-email" className={adminFieldLabelClassName}>Email</label>
                <Input
                  id="site-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="hello@example.com"
                />
                <SiteFieldError name="email" message={fieldErrors.email} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="site-subtitle" className={adminFieldLabelClassName}>Subtitle</label>
              <Input
                id="site-subtitle"
                name="siteSubtitle"
                value={form.siteSubtitle}
                onChange={(event) =>
                  setForm((current) => ({ ...current, siteSubtitle: event.target.value }))
                }
                placeholder="记录学习、项目和成长过程"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="site-home-brand" className={adminFieldLabelClassName}>Home Brand Label</label>
                <Input
                  id="site-home-brand"
                  name="homeBrandLabel"
                  value={form.homeBrandLabel}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, homeBrandLabel: event.target.value }))
                  }
                  placeholder="wwt home board"
                />
                <p className="text-xs leading-6 text-muted-foreground">
                  显示在首页顶部站点名称下方，适合 1 行短句。
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="site-announcement" className={adminFieldLabelClassName}>Announcement</label>
                <Textarea
                  id="site-announcement"
                  name="announcement"
                  value={form.announcement}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, announcement: event.target.value }))
                  }
                  placeholder="用于首页或关于页的短公告。"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="site-home-intro" className={adminFieldLabelClassName}>Home Intro Text</label>
              <Textarea
                id="site-home-intro"
                name="homeIntroText"
                value={form.homeIntroText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, homeIntroText: event.target.value }))
                }
                placeholder="一个正在认真整理学习记录、项目想法和个人空间的人。"
                className="min-h-[132px]"
              />
              <p className="text-xs leading-6 text-muted-foreground">
                显示在首页中部问候卡片下方，建议控制在 1 到 2 句话内。
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="site-github" className={adminFieldLabelClassName}>GitHub</label>
                <Input
                  id="site-github"
                  name="githubUrl"
                  type="url"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.githubUrl)}
                  aria-describedby={fieldErrors.githubUrl ? "githubUrl-error" : undefined}
                  value={form.githubUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, githubUrl: event.target.value }))
                  }
                  placeholder="https://github.com/..."
                />
                <SiteFieldError name="githubUrl" message={fieldErrors.githubUrl} />
              </div>

              <div className="space-y-2">
                <label htmlFor="site-bilibili" className={adminFieldLabelClassName}>Bilibili</label>
                <Input
                  id="site-bilibili"
                  name="bilibiliUrl"
                  type="url"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.bilibiliUrl)}
                  aria-describedby={fieldErrors.bilibiliUrl ? "bilibiliUrl-error" : undefined}
                  value={form.bilibiliUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, bilibiliUrl: event.target.value }))
                  }
                  placeholder="https://space.bilibili.com/..."
                />
                <SiteFieldError name="bilibiliUrl" message={fieldErrors.bilibiliUrl} />
              </div>

              <div className="space-y-2">
                <label htmlFor="site-xiaohongshu" className={adminFieldLabelClassName}>Xiaohongshu</label>
                <Input
                  id="site-xiaohongshu"
                  name="xiaohongshuUrl"
                  type="url"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.xiaohongshuUrl)}
                  aria-describedby={fieldErrors.xiaohongshuUrl ? "xiaohongshuUrl-error" : undefined}
                  value={form.xiaohongshuUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, xiaohongshuUrl: event.target.value }))
                  }
                  placeholder="https://www.xiaohongshu.com/..."
                />
                <SiteFieldError name="xiaohongshuUrl" message={fieldErrors.xiaohongshuUrl} />
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5 md:p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <AdminMediaField
                name="logo"
                label="Logo"
                value={form.logo}
                onChange={(value) => setForm((current) => ({ ...current, logo: value }))}
                placeholder="https://example.com/logo.png"
                helperText="用于导航栏和站点识别区域。"
              />
              <AdminMediaField
                name="avatar"
                label="Avatar"
                value={form.avatar}
                onChange={(value) => setForm((current) => ({ ...current, avatar: value }))}
                placeholder="https://example.com/avatar.png"
                helperText="用于首页个人卡、关于页和后台预览。"
              />
            </div>
          </Card>

          <Card className="space-y-4 p-5 md:p-6">
            <div>
              <label htmlFor="site-about-markdown" className="text-sm font-semibold text-foreground">关于页文案</label>
              <p className="mt-1 text-sm text-muted-foreground">
                这里支持 Markdown，前台关于页会直接渲染这段内容。
              </p>
            </div>
            <Textarea
              id="site-about-markdown"
              name="aboutMeMd"
              value={form.aboutMeMd}
              onChange={(event) =>
                setForm((current) => ({ ...current, aboutMeMd: event.target.value }))
              }
              placeholder="## 我是谁"
              className={`min-h-[420px] ${adminMarkdownTextareaClassName}`}
            />
          </Card>

          <AdminAboutContentEditor
            value={form.aboutPage}
            onChange={(aboutPage) => setForm((current) => ({ ...current, aboutPage }))}
          />
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <div className={`overflow-hidden rounded-[1.6rem] p-5 ${adminPreviewSurfaceClassName}`}>
              <div className="flex items-center gap-4">
                {form.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.avatar}
                    alt={form.siteName || "Avatar preview"}
                    className="h-16 w-16 rounded-[1.4rem] object-cover shadow-[0_18px_28px_-24px_rgba(62,116,117,0.42)]"
                  />
                ) : (
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] text-lg font-semibold ${adminAvatarTileClassName}`}
                  >
                    {(form.siteName || "SG").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold tracking-tight text-foreground">
                    {form.siteName || "站点名称"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-slate-300">
                    {form.siteSubtitle || "这里会显示站点副标题。"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className={`rounded-[1.25rem] px-4 py-3 ${adminInsetPanelClassName}`}>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Home Brand Label
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground dark:text-slate-100">
                    {form.homeBrandLabel || "wwt home board"}
                  </p>
                </div>

                <div className={`rounded-[1.25rem] px-4 py-3 ${adminInsetPanelClassName}`}>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Home Intro Text
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground dark:text-slate-300">
                    {form.homeIntroText ||
                      "一个正在认真整理学习记录、项目想法和个人空间的人。首页会继续为后续的转场和点击动画预留结构。"}
                  </p>
                </div>

                <div
                  className={`rounded-[1.3rem] px-4 py-3 text-sm leading-7 text-muted-foreground dark:text-slate-300 ${adminInsetPanelClassName}`}
                >
                  {form.announcement || "保存公告后，这里会更接近公开页的展示效果。"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">关于页预览</p>
              <p className="mt-1 text-sm text-muted-foreground">
                这里会尽量贴近前台关于页的 Markdown 呈现方式。
              </p>
            </div>
            <div className={`rounded-[1.5rem] p-5 ${adminInsetPanelClassName}`}>
              <p className="whitespace-pre-line text-lg font-semibold leading-7 text-foreground">
                {form.aboutPage.profileTitle}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground dark:text-slate-300">
                {form.aboutPage.profileBio}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <span>{form.aboutPage.focusItems.length} 个关注方向</span>
                <span>{form.aboutPage.milestones.length} 条成长轨迹</span>
              </div>
              <p className="mt-4 border-l-2 border-primary/40 pl-3 text-sm italic leading-7 text-muted-foreground">
                {form.aboutPage.quote}
              </p>
            </div>
            <div className={`rounded-[1.5rem] p-5 ${adminInsetPanelClassName}`}>
              <AdminMarkdownPreview
                content={form.aboutMeMd.trim() || "这里会实时预览关于页 Markdown。"}
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function SiteFieldError({ name, message }: { name: string; message?: string }) {
  return message ? <p id={`${name}-error`} role="alert" className="text-sm text-rose-600">{message}</p> : null;
}
