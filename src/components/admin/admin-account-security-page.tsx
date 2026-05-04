"use client";

import { CheckCircle2, KeyRound, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton,
  adminAvatarTileClassName,
  adminFieldLabelClassName,
  adminInsetPanelClassName,
  adminMintIconSurfaceClassName,
  adminPreviewSurfaceClassName
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { changeAdminPassword } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { cn, initialLetters } from "@/lib/utils";

interface PasswordFormState {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialForm: PasswordFormState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
};

function passwordChecklist(password: string) {
  return [
    {
      label: "长度为 8–64 个字符",
      passed: password.length >= 8 && password.length <= 64
    },
    {
      label: "包含大写字母",
      passed: /[A-Z]/.test(password)
    },
    {
      label: "包含小写字母",
      passed: /[a-z]/.test(password)
    },
    {
      label: "包含数字",
      passed: /\d/.test(password)
    }
  ];
}

export function AdminAccountSecurityPage() {
  const { token, user, hydrated, clearAuth } = useAuthStore();
  const [form, setForm] = useState<PasswordFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const passwordRules = useMemo(() => passwordChecklist(form.newPassword), [form.newPassword]);
  const passedRuleCount = passwordRules.filter((item) => item.passed).length;
  const allRulesPassed = passwordRules.every((item) => item.passed);
  const hasNewPasswordInput = form.newPassword.length > 0;
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword;

  const stats = useMemo(
    () => [
      { label: "当前角色", value: user?.role || "ADMIN", accent: "mint" as const },
      { label: "密码规则满足", value: `${passedRuleCount}/4`, accent: "sky" as const },
      {
        label: "确认状态",
        value: passwordsMatch ? "匹配" : form.confirmPassword ? "不匹配" : "等待",
        accent: passwordsMatch ? ("amber" as const) : ("rose" as const)
      }
    ],
    [form.confirmPassword, passedRuleCount, passwordsMatch, user?.role]
  );

  const handleChange =
    (field: keyof PasswordFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setForm((current) => ({ ...current, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    if (!allRulesPassed) {
      setNotice({
        tone: "error",
        text: "Please use a stronger new password before saving."
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setNotice({
        tone: "error",
        text: "The new password and confirmation password do not match."
      });
      return;
    }

    setSaving(true);
    setNotice({
      tone: "info",
      text: "Updating password and closing the current login session..."
    });

    try {
      await changeAdminPassword(token, form);
      setNotice({
        tone: "success",
        text: "Password updated. Please sign in again with the new password."
      });
      clearAuth();
      setForm(initialForm);
      window.location.replace("/admin/login?reason=password-updated");
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Failed to update password."
      });
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || !token) {
    return <AdminPageSkeleton sections={2} />;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm leading-7 text-muted-foreground">
              在这里更改当前管理员密码。更新成功后，当前的访问令牌（access token）和刷新令牌（refresh token 家族）将被失效，你需要使用新密码重新登录。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <div
            className={cn(
              "rounded-[1.35rem] border px-4 py-3 text-sm leading-6",
              "border-amber-200/70 bg-amber-50/80 text-amber-800",
              "dark:border-amber-400/12 dark:bg-[#241c12]/88 dark:text-amber-100/82",
            )}
          >
            密码更新会立即影响当前登录会话。
          </div>
        </div>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <Card className="space-y-5 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-[1.2rem]",
                adminMintIconSurfaceClassName,
              )}
            >
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                凭证更新
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                确认旧密码，然后设置符合安全规则的新密码。
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <p className={adminFieldLabelClassName}>当前密码</p>
              <Input
                type="password"
                name="current-password"
                autoComplete="current-password"
                value={form.oldPassword}
                onChange={handleChange("oldPassword")}
                placeholder="Enter current password"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>新密码</p>
                <Input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={handleChange("newPassword")}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>确认新密码</p>
                <Input
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Enter new password again"
                />
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-border/65 bg-background/72 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldAlert className="h-4 w-4 text-[#cc9155]" />
                新密码检查项
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {passwordRules.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-[1rem] border px-3 py-2 text-sm transition-colors",
                      item.passed &&
                        "border-[#62d4cb]/32 bg-[#f2fcfa] dark:border-[#2dd4bf]/18 dark:bg-[#0d2d33]/76",
                      !item.passed &&
                        hasNewPasswordInput &&
                        "border-amber-200/65 bg-amber-50/72 dark:border-amber-400/16 dark:bg-[#2d2111]/72",
                      !item.passed &&
                        !hasNewPasswordInput &&
                        "border-border/55 bg-white/70 dark:border-white/8 dark:bg-white/[0.045]",
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4",
                        item.passed && "text-[#2b8c81] dark:text-[#82e6dd]",
                        !item.passed && hasNewPasswordInput && "text-[#cc9155] dark:text-amber-300",
                        !item.passed && !hasNewPasswordInput && "text-muted-foreground/50 dark:text-slate-500",
                      )}
                    />
                    <span
                      className={cn(
                        item.passed && "text-foreground dark:text-slate-100",
                        !item.passed && hasNewPasswordInput && "text-[#8a6a2f] dark:text-amber-100/90",
                        !item.passed && !hasNewPasswordInput && "text-muted-foreground dark:text-slate-400",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={
                  saving ||
                  !form.oldPassword ||
                  !form.newPassword ||
                  !form.confirmPassword
                }
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                更新密码
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(initialForm);
                  setNotice(null);
                }}
                disabled={saving}
              >
                重置表单
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <div className={`overflow-hidden rounded-[1.6rem] p-5 ${adminPreviewSurfaceClassName}`}>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-[1.4rem] text-lg font-semibold",
                    adminAvatarTileClassName,
                  )}
                >
                  {initialLetters(user?.nickname || user?.username || "AD")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold tracking-tight text-foreground">
                    {user?.nickname || user?.username || "Administrator"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-slate-300">
                    Username: {user?.username || "admin"}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "mt-5 rounded-[1.3rem] px-4 py-3 text-sm leading-7 text-muted-foreground dark:text-slate-300",
                  adminInsetPanelClassName,
                )}
              >
                该模块仅管理当前登录的管理员账户。出于安全考虑，密码修改成功后需要立即重新登录。
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">推荐操作流程</p>
              <p className="mt-1 text-sm text-muted-foreground">
                为避免操作过程中被强制退出，请按以下步骤：
              </p>
            </div>
            <div className="space-y-3">
              {[
                "提交前先确认当前密码正确",
                "使用与当前密码不同的新密码",
                "修改成功后立即用新密码重新登录"
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-border/60 bg-background/72 px-4 py-3"
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      adminMintIconSurfaceClassName,
                    )}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
