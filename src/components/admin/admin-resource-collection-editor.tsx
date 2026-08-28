"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

import {
  AdminNotice,
  AdminPageSkeleton,
  adminFieldLabelClassName
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminResourceCollection,
  getAdminResourceCollectionById,
  updateAdminResourceCollection
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { AdminResourceCollectionSavePayload, ResourceCollection } from "@/types";

interface CollectionFormState {
  name: string;
  slug: string;
  description: string;
  sort: string;
}

const emptyForm: CollectionFormState = {
  name: "",
  slug: "",
  description: "",
  sort: "0"
};

function buildSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=<>{}[\]|\\:;"'?,./\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function mapCollectionToForm(collection: ResourceCollection): CollectionFormState {
  return {
    name: collection.name || "",
    slug: collection.slug || "",
    description: collection.description || "",
    sort: String(collection.sort ?? 0)
  };
}

export function AdminResourceCollectionEditor({
  collectionId
}: {
  collectionId?: number;
}) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<CollectionFormState>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(Boolean(collectionId));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = collectionId !== undefined;

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    if (!collectionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminResourceCollectionById(token, collectionId)
      .then((payload) => {
        if (!cancelled && payload) {
          setForm(mapCollectionToForm(payload));
          setSlugEdited(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载分组失败。"
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
  }, [collectionId, hydrated, token]);

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!form.name.trim()) {
      setNotice({ tone: "error", text: "请先填写分组名称。" });
      return;
    }

    if (!form.slug.trim()) {
      setNotice({ tone: "error", text: "请先填写 slug。" });
      return;
    }

    setSaving(true);
    setNotice({ tone: "info", text: "正在保存分组..." });

    try {
      const payload: AdminResourceCollectionSavePayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        sort: Number(form.sort || "0")
      };

      if (isEditing && collectionId) {
        await updateAdminResourceCollection(token, collectionId, payload);
        setNotice({ tone: "success", text: "分组已更新。" });
      } else {
        const createdId = await createAdminResourceCollection(token, payload);
        setNotice({ tone: "success", text: "分组已创建。" });
        router.replace(`/admin/resource-collections/${createdId}`);
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
    return <AdminPageSkeleton sections={2} />;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <Link
              href="/admin/resource-collections"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              返回分组列表
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                {isEditing ? "编辑资源分组" : "新建资源分组"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                分组是资源页的一级结构，名称和描述会直接影响公开页的阅读感。
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存分组
          </Button>
        </div>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

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
                  slug: slugEdited ? current.slug : buildSlug(event.target.value)
                }))
              }
              placeholder="官方文档"
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
              placeholder="official-docs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className={adminFieldLabelClassName}>Description</p>
          <Textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="适合打基础、查 API 和做权威确认。"
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
      </Card>
    </div>
  );
}
