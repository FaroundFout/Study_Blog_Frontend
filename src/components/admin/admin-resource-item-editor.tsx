"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

import { AdminMediaField } from "@/components/admin/admin-media-field";
import {
  AdminNotice,
  AdminPageSkeleton,
  adminFieldLabelClassName,
  adminSelectClassName
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminResourceItem,
  getAdminResourceCollections,
  getAdminResourceItemById,
  updateAdminResourceItem
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type {
  AdminResourceItemSavePayload,
  ResourceCollection,
  ResourceItem
} from "@/types";

interface ResourceItemFormState {
  collectionId: string;
  title: string;
  summary: string;
  linkUrl: string;
  coverImage: string;
  sourceName: string;
  tagsText: string;
  sort: string;
}

const emptyForm: ResourceItemFormState = {
  collectionId: "",
  title: "",
  summary: "",
  linkUrl: "",
  coverImage: "",
  sourceName: "",
  tagsText: "",
  sort: "0"
};

function mapItemToForm(item: ResourceItem): ResourceItemFormState {
  return {
    collectionId: String(item.collectionId),
    title: item.title || "",
    summary: item.summary || "",
    linkUrl: item.linkUrl || "",
    coverImage: item.coverImage || "",
    sourceName: item.sourceName || "",
    tagsText: item.tagsText || "",
    sort: String(item.sort ?? 0)
  };
}

export function AdminResourceItemEditor({
  itemId
}: {
  itemId?: number;
}) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<ResourceItemFormState>(emptyForm);
  const [collections, setCollections] = useState<ResourceCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = itemId !== undefined;

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getAdminResourceCollections(token, { pageNum: 1, pageSize: 100 }),
      itemId ? getAdminResourceItemById(token, itemId) : Promise.resolve(null)
    ])
      .then(([collectionsPayload, itemPayload]) => {
        if (cancelled) {
          return;
        }

        setCollections(collectionsPayload.list);

        if (itemPayload) {
          setForm(mapItemToForm(itemPayload));
        } else if (collectionsPayload.list[0]) {
          setForm((current) => ({
            ...current,
            collectionId: current.collectionId || String(collectionsPayload.list[0].id)
          }));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载资源项失败。"
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
  }, [hydrated, itemId, token]);

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!form.collectionId) {
      setNotice({ tone: "error", text: "请先选择所属分组。" });
      return;
    }

    if (!form.title.trim()) {
      setNotice({ tone: "error", text: "请先填写资源标题。" });
      return;
    }

    if (!form.linkUrl.trim()) {
      setNotice({ tone: "error", text: "链接地址不能为空。" });
      return;
    }

    setSaving(true);
    setNotice({ tone: "info", text: "正在保存资源项..." });

    try {
      const payload: AdminResourceItemSavePayload = {
        collectionId: Number(form.collectionId),
        title: form.title.trim(),
        summary: form.summary.trim() || undefined,
        linkUrl: form.linkUrl.trim(),
        coverImage: form.coverImage.trim() || undefined,
        sourceName: form.sourceName.trim() || undefined,
        tagsText: form.tagsText.trim() || undefined,
        sort: Number(form.sort || "0")
      };

      if (isEditing && itemId) {
        await updateAdminResourceItem(token, itemId, payload);
        setNotice({ tone: "success", text: "资源项已更新。" });
      } else {
        const createdId = await createAdminResourceItem(token, payload);
        setNotice({ tone: "success", text: "资源项已创建。" });
        router.replace(`/admin/resource-items/${createdId}`);
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
              href="/admin/resource-items"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              返回资源项列表
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                {isEditing ? "编辑资源项" : "新建资源项"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                资源项会直接出现在公开页的分组内容里，建议把标题、来源和摘要写得更清楚。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.linkUrl ? (
              <a href={form.linkUrl} target="_blank" rel="noreferrer" className="inline-flex">
                <Button variant="secondary">
                  <ExternalLink className="h-4 w-4" />
                  打开链接
                </Button>
              </a>
            ) : null}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存资源项
            </Button>
          </div>
        </div>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Collection</p>
              <select
                value={form.collectionId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, collectionId: event.target.value }))
                }
                className={adminSelectClassName}
              >
                <option value="">请选择分组</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Title</p>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Next.js Documentation"
                className="h-14 rounded-[1.2rem] text-base"
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Summary</p>
              <Textarea
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summary: event.target.value }))
                }
                placeholder="用一句话说明为什么值得收藏。"
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Link URL</p>
              <Input
                value={form.linkUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, linkUrl: event.target.value }))
                }
                placeholder="https://nextjs.org/docs"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Source Name</p>
                <Input
                  value={form.sourceName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sourceName: event.target.value }))
                  }
                  placeholder="Vercel"
                />
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

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Tags</p>
              <Input
                value={form.tagsText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tagsText: event.target.value }))
                }
                placeholder="Next.js, 文档, 前端"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <AdminMediaField
              label="Cover"
              value={form.coverImage}
              onChange={(value) => setForm((current) => ({ ...current, coverImage: value }))}
              placeholder="https://example.com/resource-cover.png"
              helperText="资源项封面会用于资源页卡片展示。"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
