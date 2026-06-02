"use client";

import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminMetricStrip,
  AdminModal,
  AdminNotice,
  AdminPageSkeleton,
  adminFieldLabelClassName
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminCategory,
  createAdminTag,
  deleteAdminCategory,
  deleteAdminTag,
  getAdminCategoriesPage,
  getAdminTagsPage,
  updateAdminCategory,
  updateAdminTag
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type {
  AdminCategorySavePayload,
  AdminTagSavePayload,
  Category,
  PageResponse,
  Tag
} from "@/types";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=<>{}[\]|\\:;"'?,./\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function AdminTaxonomyPage({
  kind
}: {
  kind: "category" | "tag";
}) {
  const { token, hydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageData, setPageData] = useState<PageResponse<Category | Tag> | null>(null);
  const [editingItem, setEditingItem] = useState<Category | Tag | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sort: "0",
    description: ""
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isCategory = kind === "category";
  const totalPages = Math.max(
    1,
    Math.ceil((pageData?.total ?? 0) / Math.max(1, pageData?.pageSize ?? 10)),
  );

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    const request = isCategory
      ? getAdminCategoriesPage(token, {
          pageNum: page,
          pageSize: 10,
          keyword: keyword || undefined
        })
      : getAdminTagsPage(token, {
          pageNum: page,
          pageSize: 10,
          keyword: keyword || undefined
        });

    request
      .then((payload) => {
        if (!cancelled) {
          setPageData(payload);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载列表失败。"
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
  }, [hydrated, isCategory, keyword, page, refreshKey, token]);

  const stats = useMemo(
    () => [
      {
        label: isCategory ? "当前页分类" : "当前页标签",
        value: pageData?.list.length ?? 0,
        accent: "mint" as const
      },
      {
        label: isCategory ? "全部分类" : "全部标签",
        value: pageData?.total ?? 0,
        accent: "amber" as const
      },
      {
        label: "当前分页",
        value: `${page} / ${totalPages}`,
        accent: "sky" as const
      }
    ],
    [isCategory, page, pageData?.list.length, pageData?.total, totalPages],
  );

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      sort: "0",
      description: ""
    });
    setEditingItem(null);
    setSlugEdited(false);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: Category | Tag) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      slug: item.slug,
      sort: "sort" in item ? String(item.sort ?? 0) : "0",
      description: "description" in item ? item.description ?? "" : ""
    });
    setSlugEdited(true);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!form.name.trim()) {
      setNotice({ tone: "error", text: "请先填写名称。" });
      return;
    }

    if (!form.slug.trim()) {
      setNotice({ tone: "error", text: "Slug 不能为空。" });
      return;
    }

    setSaving(true);

    try {
      if (isCategory) {
        const payload: AdminCategorySavePayload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          sort: Number(form.sort || "0"),
          description: form.description.trim() || undefined
        };

        if (editingItem) {
          await updateAdminCategory(token, editingItem.id, payload);
          setNotice({ tone: "success", text: "分类已更新。" });
        } else {
          await createAdminCategory(token, payload);
          setNotice({ tone: "success", text: "分类已创建。" });
        }
      } else {
        const payload: AdminTagSavePayload = {
          name: form.name.trim(),
          slug: form.slug.trim()
        };

        if (editingItem) {
          await updateAdminTag(token, editingItem.id, payload);
          setNotice({ tone: "success", text: "标签已更新。" });
        } else {
          await createAdminTag(token, payload);
          setNotice({ tone: "success", text: "标签已创建。" });
        }
      }

      setDialogOpen(false);
      resetForm();
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存失败，请稍后再试。"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Category | Tag) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除 ${item.name} 吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      if (isCategory) {
        await deleteAdminCategory(token, item.id);
      } else {
        await deleteAdminTag(token, item.id);
      }
      setNotice({ tone: "success", text: `${item.name} 已删除。` });
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "删除失败。"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!hydrated || !token || loading) {
    return <AdminPageSkeleton sections={2} />;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isCategory
                ? "分类会出现在文章筛选和内容导航里。"
                : "标签更适合表达细粒度主题，用来建立跨内容的连接。"}
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {isCategory ? "新增分类" : "新增标签"}
          </Button>
        </div>

        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setKeyword(keywordInput.trim());
          }}
        >
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder={isCategory ? "按分类名、slug 或描述搜索" : "按标签名或 slug 搜索"}
          />
          <Button type="submit" variant="secondary">
            搜索
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setKeywordInput("");
              setKeyword("");
              setPage(1);
            }}
          >
            清空
          </Button>
        </form>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      {pageData?.list.length ? (
        <>
          <div className="grid gap-4">
            {pageData.list.map((item) => (
              <Card key={item.id} className="space-y-4 p-5 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-[#62d4cb]/35 bg-[#eefaf7] px-2.5 py-1 text-[11px] font-medium text-[#247c76] dark:border-[#2dd4bf]/22 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]">
                        {isCategory ? "分类" : "标签"}
                      </span>
                      {"sort" in item ? (
                        <span className="inline-flex rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                          排序 {item.sort ?? 0}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xl font-semibold tracking-tight text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">/{item.slug}</p>
                    </div>
                    {"description" in item && item.description ? (
                      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">这条数据还没有补充说明。</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>创建于：{formatDate(item.createdAt, "YYYY/MM/DD HH:mm")}</span>
                      <span>更新于：{formatDate(item.updatedAt, "YYYY/MM/DD HH:mm")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => openEdit(item)}>
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item)}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页，共 {pageData.total} 条数据
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                上一页
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                下一页
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRefreshKey((current) => current + 1)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                刷新
              </Button>
            </div>
          </Card>
        </>
      ) : (
        <Card className="space-y-4 px-8 py-14 text-center">
          <p className="text-lg font-semibold text-foreground">
            {isCategory ? "还没有分类" : "还没有标签"}
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
            {isCategory
              ? "先创建几个内容分类，后面写文章时就能直接挂到正确栏目下。"
              : "先把常用主题标签建好，文章和项目录入时就能直接复用。"}
          </p>
          <div className="flex justify-center">
            <Button variant="secondary" onClick={openCreate}>
              {isCategory ? "新增分类" : "新增标签"}
            </Button>
          </div>
        </Card>
      )}

      <AdminModal
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        title={editingItem ? `编辑${isCategory ? "分类" : "标签"}` : `新增${isCategory ? "分类" : "标签"}`}
        description={
          isCategory
            ? "分类更适合承载稳定的栏目结构。"
            : "标签更适合表达跨内容的细粒度主题。"
        }
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingItem ? "保存修改" : "创建"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <p className={adminFieldLabelClassName}>Name</p>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: slugEdited ? current.slug : createSlug(event.target.value)
                }))
              }
              placeholder={isCategory ? "例如：前端工程" : "例如：Next.js"}
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
              placeholder="frontend-engineering"
            />
          </div>

          {isCategory ? (
            <>
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

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Description</p>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="这一类内容主要涵盖什么主题？"
                />
              </div>
            </>
          ) : null}
        </div>
      </AdminModal>
    </div>
  );
}
