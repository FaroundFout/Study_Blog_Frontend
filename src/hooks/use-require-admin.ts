"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useMemo, useState } from "react";

import { getCurrentAdmin } from "@/lib/api";
import { buildAdminLoginPath } from "@/lib/article-editor";
import { readStoredAdminAuth } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth-store";

export function useRequireAdmin() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, hydrated, restore, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  const redirectTarget = useMemo(() => {
    const nextSearch = searchParams.toString();
    return nextSearch ? `${pathname}?${nextSearch}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!token) {
      clearAuth();
      setChecking(false);
      replace(buildAdminLoginPath(redirectTarget));
      return;
    }

    let cancelled = false;
    setChecking(true);

    getCurrentAdmin(token)
      .then((user) => {
        if (cancelled) {
          return;
        }

        const latestToken = readStoredAdminAuth()?.token ?? token;
        setAuth({ token: latestToken, user });
        setChecking(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearAuth();
        setChecking(false);
        replace(buildAdminLoginPath(redirectTarget, "session-expired"));
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuth, hydrated, redirectTarget, replace, setAuth, token]);

  return {
    token,
    ready: hydrated && Boolean(token) && !checking,
    checking
  };
}
