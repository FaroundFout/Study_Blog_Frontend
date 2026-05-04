"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { createAdminFriendLink, getAdminFriendLinkById, updateAdminFriendLink } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { AdminFriendLinkSavePayload, FriendLink, FriendLinkStatus } from "@/types";

interface FriendLinkFormState {
  siteName: string;
  siteUrl: string;
  avatar: string;
  description: string;
  status: FriendLinkStatus;
  sort: string;
}

const emptyForm: FriendLinkFormState = {
  siteName: "",
  siteUrl: "",
  avatar: "",
  description: "",
  status: "pending",
  sort: "0"
};

function mapFriendLinkToForm(item: FriendLink): FriendLinkFormState {
  return {
    siteName: item.siteName || "",
    siteUrl: item.siteUrl || "",
    avatar: item.avatar || "",
    description: item.description || "",
    status:
      item.status === "approved" || item.status === "rejected" ? item.status : "pending",
    sort: String(item.sort ?? 0)
  };
}

export function AdminFriendLinkEditor({
  friendLinkId
}: {
  friendLinkId?: number;
}) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<FriendLinkFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = friendLinkId !== undefined;

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    if (!friendLinkId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminFriendLinkById(token, friendLinkId)
      .then((payload) => {
        if (!cancelled && payload) {
          setForm(mapFriendLinkToForm(payload));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载友链详情失败。"
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
  }, [friendLinkId, hydrated, token]);

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!form.siteName.trim()) {
      setNotice({ tone: "error", text: "请先填写站点名称。" });
      return;
    }

    if (!form.siteUrl.trim()) {
      setNotice({ tone: "error", text: "站点地址不能为空。" });
      return;
    }

    setSaving(true);
    setNotice({ tone: "info", text: "正在保存友链..." });

    try {
      const payload: AdminFriendLinkSavePayload = {
        siteName: form.siteName.trim(),
        siteUrl: form.siteUrl.trim(),
        avatar: form.avatar.trim() || undefined,
        description: form.description.trim() || undefined,
        status: form.status,
        sort: Number(form.sort || "0")
      };

      if (isEditing && friendLinkId) {
        await updateAdminFriendLink(token, friendLinkId, payload);
        setNotice({ tone: "success", text: "友链已更新。" });
      } else {
        const createdId = await createAdminFriendLink(token, payload);
        setNotice({ tone: "success", text: "友链已创建。" });
        router.replace(`/admin/friend-links/${createdId}`);
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
              href="/admin/friend-links"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              返回友链列表
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                {isEditing ? "编辑友链" : "新增友链"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                站点名称、简介和状态会直接影响公开页友链区域的观感，建议保持信息简洁准确。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.siteUrl ? (
              <a href={form.siteUrl} target="_blank" rel="noreferrer" className="inline-flex">
                <Button variant="secondary">
                  <ExternalLink className="h-4 w-4" />
                  打开站点
                </Button>
              </a>
            ) : null}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存友链
            </Button>
          </div>
        </div>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Site Name</p>
              <Input
                value={form.siteName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, siteName: event.target.value }))
                }
                placeholder="晨间代码薄雾"
                className="h-14 rounded-[1.2rem] text-base"
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Site URL</p>
              <Input
                value={form.siteUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, siteUrl: event.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>Description</p>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="一句话概括这个站点的风格与内容。"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>Status</p>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as FriendLinkStatus
                    }))
                  }
                  className={adminSelectClassName}
                >
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
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
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <AdminMediaField
              label="Avatar"
              value={form.avatar}
              onChange={(value) => setForm((current) => ({ ...current, avatar: value }))}
              placeholder="https://example.com/avatar.png"
              helperText="如果对方站点没有头像，也可以先留空。"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
