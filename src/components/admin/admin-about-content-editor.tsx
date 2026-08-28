"use client";

import { Plus, Trash2 } from "lucide-react";

import {
  adminFieldLabelClassName,
  adminInsetPanelClassName
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AboutFocusItem, AboutMilestone, AboutPageContent } from "@/types";

interface AdminAboutContentEditorProps {
  value: AboutPageContent;
  onChange: (value: AboutPageContent) => void;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function AdminAboutContentEditor({ value, onChange }: AdminAboutContentEditorProps) {
  const updateField = <K extends keyof AboutPageContent,>(
    field: K,
    nextValue: AboutPageContent[K]
  ) => {
    onChange({ ...value, [field]: nextValue });
  };

  const updateFocusItem = (index: number, field: keyof AboutFocusItem, nextValue: string) => {
    const focusItems = value.focusItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: nextValue } : item
    );
    updateField("focusItems", focusItems);
  };

  const updateMilestone = (index: number, field: keyof AboutMilestone, nextValue: string) => {
    const milestones = value.milestones.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: nextValue } : item
    );
    updateField("milestones", milestones);
  };

  return (
    <Card className="space-y-7 p-5 md:p-6">
      <SectionHeading
        title="关于页结构化内容"
        description="这些字段对应前台关于页中原本固定写在代码里的个人档案、栏目标题、关注方向、成长轨迹和联系寄语。"
      />

      <section className={`space-y-4 rounded-[1.5rem] p-4 md:p-5 ${adminInsetPanelClassName}`}>
        <SectionHeading title="站长档案" description="控制档案卡中的主标题、补充介绍和三项身份信息。标题支持换行。" />
        <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
          <label className="space-y-2">
            <span className={adminFieldLabelClassName}>Section Title</span>
            <Input value={value.profileSectionTitle} onChange={(event) => updateField("profileSectionTitle", event.target.value)} placeholder="站长档案" />
          </label>
          <label className="space-y-2">
            <span className={adminFieldLabelClassName}>Profile Title</span>
            <Textarea value={value.profileTitle} onChange={(event) => updateField("profileTitle", event.target.value)} placeholder="一个把学习、项目与…" className="min-h-[88px]" />
          </label>
        </div>
        <label className="block space-y-2">
          <span className={adminFieldLabelClassName}>Profile Bio</span>
          <Textarea value={value.profileBio} onChange={(event) => updateField("profileBio", event.target.value)} placeholder="补充介绍" className="min-h-[112px]" />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Location</span><Input value={value.location} onChange={(event) => updateField("location", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Timezone</span><Input value={value.timezone} onChange={(event) => updateField("timezone", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Status</span><Input value={value.status} onChange={(event) => updateField("status", event.target.value)} /></label>
        </div>
      </section>

      <section className={`space-y-4 rounded-[1.5rem] p-4 md:p-5 ${adminInsetPanelClassName}`}>
        <SectionHeading title="栏目与短句" description="修改各卡片标题、印章引用语、联系寄语和社交链接说明。" />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Note Title</span><Input value={value.noteTitle} onChange={(event) => updateField("noteTitle", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Focus Title</span><Input value={value.focusTitle} onChange={(event) => updateField("focusTitle", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Timeline Title</span><Input value={value.timelineTitle} onChange={(event) => updateField("timelineTitle", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Contact Title</span><Input value={value.contactTitle} onChange={(event) => updateField("contactTitle", event.target.value)} /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Quote</span><Textarea value={value.quote} onChange={(event) => updateField("quote", event.target.value)} className="min-h-[92px]" /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Contact Note</span><Textarea value={value.contactNote} onChange={(event) => updateField("contactNote", event.target.value)} className="min-h-[92px]" /></label>
        </div>
        <label className="block space-y-2"><span className={adminFieldLabelClassName}>Empty Contact Text</span><Input value={value.contactEmptyText} onChange={(event) => updateField("contactEmptyText", event.target.value)} /></label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2"><span className={adminFieldLabelClassName}>GitHub Note</span><Input value={value.githubNote} onChange={(event) => updateField("githubNote", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Bilibili Note</span><Input value={value.bilibiliNote} onChange={(event) => updateField("bilibiliNote", event.target.value)} /></label>
          <label className="space-y-2"><span className={adminFieldLabelClassName}>Xiaohongshu Note</span><Input value={value.xiaohongshuNote} onChange={(event) => updateField("xiaohongshuNote", event.target.value)} /></label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title="最近关注" description="每一项包含标题和一句说明；前台会按顺序匹配现有图标。" />
          <Button type="button" variant="outline" size="sm" disabled={value.focusItems.length >= 8} onClick={() => updateField("focusItems", [...value.focusItems, { title: "", note: "" }])}>
            <Plus aria-hidden="true" className="h-4 w-4" />新增关注项
          </Button>
        </div>
        <div className="space-y-3">
          {value.focusItems.map((item, index) => (
            <div key={`focus-${index}`} className={`grid gap-3 rounded-[1.35rem] p-4 md:grid-cols-[2rem_0.72fr_1.28fr_auto] md:items-center ${adminInsetPanelClassName}`}>
              <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <Input aria-label={`第 ${index + 1} 个关注项标题`} value={item.title} onChange={(event) => updateFocusItem(index, "title", event.target.value)} placeholder="关注方向" />
              <Input aria-label={`第 ${index + 1} 个关注项说明`} value={item.note} onChange={(event) => updateFocusItem(index, "note", event.target.value)} placeholder="一句说明" />
              <Button type="button" variant="ghost" size="icon" aria-label={`删除第 ${index + 1} 个关注项`} onClick={() => updateField("focusItems", value.focusItems.filter((_, itemIndex) => itemIndex !== index))}>
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title="成长轨迹" description="日期可以使用 YYYY.MM，也可以填写其他短日期格式。" />
          <Button type="button" variant="outline" size="sm" disabled={value.milestones.length >= 12} onClick={() => updateField("milestones", [...value.milestones, { date: "", text: "" }])}>
            <Plus aria-hidden="true" className="h-4 w-4" />新增轨迹
          </Button>
        </div>
        <div className="space-y-3">
          {value.milestones.map((item, index) => (
            <div key={`milestone-${index}`} className={`grid gap-3 rounded-[1.35rem] p-4 md:grid-cols-[2rem_8rem_1fr_auto] md:items-center ${adminInsetPanelClassName}`}>
              <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <Input aria-label={`第 ${index + 1} 条成长轨迹日期`} value={item.date} onChange={(event) => updateMilestone(index, "date", event.target.value)} placeholder="2026.01" />
              <Input aria-label={`第 ${index + 1} 条成长轨迹内容`} value={item.text} onChange={(event) => updateMilestone(index, "text", event.target.value)} placeholder="记录一项成长节点" />
              <Button type="button" variant="ghost" size="icon" aria-label={`删除第 ${index + 1} 条成长轨迹`} onClick={() => updateField("milestones", value.milestones.filter((_, itemIndex) => itemIndex !== index))}>
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}
