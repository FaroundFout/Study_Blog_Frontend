"use client";

import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentAdmin, loginAdmin } from "@/lib/api";
import { ADMIN_AUTH_CHANGED_EVENT, readStoredAdminAuth } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth-store";

import styles from "./admin-login.module.css";

function getReasonMessage(reason: string | null) {
  switch (reason) {
    case "session-expired":
      return "登录会话已过期，请重新验证身份。";
    case "logged-out":
      return "你已安全退出后台。";
    case "password-updated":
      return "密码已更新，请使用新密码重新登录。";
    default:
      return null;
  }
}

function getLoginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (/failed to fetch|networkerror|network request failed/i.test(message)) {
    return "暂时无法连接后台服务，请确认服务已启动后重试。";
  }

  return message || "登录失败，请检查账号和密码。";
}

export default function AdminLoginPage() {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const { token, hydrated, restore, setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [allowInput, setAllowInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  const redirectTarget = useMemo(() => searchParams.get("redirect") || "/admin/articles", [searchParams]);
  const reasonMessage = useMemo(() => getReasonMessage(searchParams.get("reason")), [searchParams]);

  useEffect(() => {
    restore();
    const timer = window.requestAnimationFrame(() => setAllowInput(true));
    const handleAuthChanged = () => restore();
    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.cancelAnimationFrame(timer);
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [restore]);

  useEffect(() => {
    if (!hydrated || !token) return;

    let cancelled = false;
    setChecking(true);
    getCurrentAdmin(token)
      .then((currentUser) => {
        if (cancelled) return;

        const latestToken = readStoredAdminAuth()?.token ?? token;
        setAuth({ token: latestToken, user: currentUser });
        replace(redirectTarget);
      })
      .catch(() => {
        // Keep the login form available if the stored session cannot be restored.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, redirectTarget, replace, setAuth, token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await loginAdmin({ username: username.trim(), password });
        setAuth({ token: `${payload.tokenType} ${payload.token}`, user: payload.userInfo });
        replace(redirectTarget);
      } catch (error) {
        setErrorMessage(getLoginErrorMessage(error));
      }
    });
  };

  return (
    <div className={styles.page}>
      <aside className={styles.catalogPanel}>
        <div className={styles.catalogTop}>
          <Link href="/" className={styles.backLink}><ArrowLeft aria-hidden="true" />返回公开站点</Link>
          <span className={styles.entryCode}>SG</span>
        </div>

        <div className={styles.catalogBody}>
          <div className={styles.catalogCopy}>
            <p className={styles.kicker}>PRIVATE CATALOG / 00</p>
            <h1>内容<br />管理台</h1>
            <div className={styles.rule} />
            <p>这里是 Study Garden 的馆员工作台。文章、日记、项目、资源与站点资料，都从这里归档和维护。</p>
          </div>

          <div className={styles.catalogIndex} aria-label="管理内容范围">
            <span><b>01</b>内容档案</span>
            <span><b>02</b>资源索引</span>
            <span><b>03</b>站点维护</span>
          </div>
        </div>

        <div className={styles.catalogFooter}>
          <Image src="/images/home/library-stamp.png" width={248} height={142} alt="Study Garden Library" className={styles.stamp} />
          <p className={styles.serial}>STUDY GARDEN / ADMIN ENTRY / EST. 2026</p>
        </div>
      </aside>

      <main className={styles.loginArea}>
        <section className={styles.loginSheet} aria-labelledby="admin-login-title">
          <div className={styles.sheetHeader}>
            <div className={styles.lockMark}><LockKeyhole aria-hidden="true" /></div>
            <div className={styles.sheetMeta}><p>AUTHORIZED STAFF ONLY</p><span>SG — AUTH — 001</span></div>
          </div>

          <div className={styles.titleBlock}>
            <div className={styles.titleHeading}>
              <p>管理员入口</p>
              <h2 id="admin-login-title">身份核验</h2>
            </div>
            <p className={styles.titleDescription}>登录后可管理内容与站点配置；会话由现有 JWT 与刷新令牌接口保护。</p>
          </div>

          <form autoComplete="off" onSubmit={handleSubmit} className={styles.form}>
            <input type="text" name="fake-username" autoComplete="username" tabIndex={-1} aria-hidden="true" className="hidden" />
            <input type="password" name="fake-password" autoComplete="current-password" tabIndex={-1} aria-hidden="true" className="hidden" />

            <label>
              <span>管理员账号 / USERNAME</span>
              <Input name="admin-account" placeholder="请输入管理员账号" value={username} readOnly={!allowInput} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} onFocus={() => setAllowInput(true)} onChange={(event) => setUsername(event.target.value)} />
            </label>

            <label>
              <span>登录密码 / PASSWORD</span>
              <Input type="password" name="admin-passcode" placeholder="请输入登录密码" value={password} readOnly={!allowInput} autoComplete="new-password" autoCorrect="off" autoCapitalize="none" spellCheck={false} data-lpignore="true" onFocus={() => setAllowInput(true)} onChange={(event) => setPassword(event.target.value)} />
            </label>

            {reasonMessage ? <p className={styles.notice} role="status">{reasonMessage}</p> : null}
            {errorMessage ? <p className={styles.error} role="alert">{errorMessage}</p> : null}

            <Button type="submit" disabled={isPending || checking || !username.trim() || !password} className={styles.submit}>
              <ShieldCheck aria-hidden="true" />{isPending || checking ? "正在核验" : "进入管理台"}
            </Button>
          </form>

          <footer><span>ACCESS LOGGED</span><span>JWT / REFRESH TOKEN</span><span>SG — 2026</span></footer>
        </section>
      </main>
    </div>
  );
}
