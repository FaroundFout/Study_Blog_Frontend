"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentAdmin, loginAdmin } from "@/lib/api";
import { ADMIN_AUTH_CHANGED_EVENT, readStoredAdminAuth } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth-store";

function getReasonMessage(reason: string | null) {
  switch (reason) {
    case "session-expired":
      return "Your login session expired. Please sign in again.";
    case "logged-out":
      return "You have signed out safely.";
    case "password-updated":
      return "Password updated successfully. Please sign in again with the new password.";
    default:
      return null;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, hydrated, restore, setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [allowInput, setAllowInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  const redirectTarget = useMemo(
    () => searchParams.get("redirect") || "/admin/articles",
    [searchParams]
  );
  const reasonMessage = useMemo(
    () => getReasonMessage(searchParams.get("reason")),
    [searchParams]
  );

  useEffect(() => {
    restore();

    const timer = window.requestAnimationFrame(() => {
      setAllowInput(true);
    });
    const handleAuthChanged = () => restore();

    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);

    return () => {
      window.cancelAnimationFrame(timer);
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [restore]);

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    setChecking(true);
    getCurrentAdmin(token)
      .then((currentUser) => {
        const latestToken = readStoredAdminAuth()?.token ?? token;
        setAuth({ token: latestToken, user: currentUser });
        router.replace(redirectTarget);
      })
      .catch(() => {
        setChecking(false);
      })
      .finally(() => setChecking(false));
  }, [hydrated, redirectTarget, router, setAuth, token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await loginAdmin({
          username: username.trim(),
          password
        });
        setAuth({
          token: `${payload.tokenType} ${payload.token}`,
          user: payload.userInfo
        });
        router.replace(redirectTarget);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Login failed.");
      }
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-[560px] rounded-[2rem] p-8 shadow-[0_30px_60px_-36px_rgba(61,74,94,0.34)] md:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-primary/85">Admin Entry</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[2.45rem]">
              Backstage Login
            </h1>
            <p className="mx-auto max-w-[30rem] text-sm leading-7 text-muted-foreground md:text-[0.95rem]">
              Sign in to manage articles, study diaries, resources, and site settings.
            </p>
          </div>
        </div>

        <form autoComplete="off" onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="fake-username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="current-password"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />

          <Input
            name="admin-account"
            placeholder="Username"
            value={username}
            readOnly={!allowInput}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            onFocus={() => setAllowInput(true)}
            onChange={(event) => setUsername(event.target.value)}
          />

          <Input
            type="password"
            name="admin-passcode"
            placeholder="Password"
            value={password}
            readOnly={!allowInput}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            onFocus={() => setAllowInput(true)}
            onChange={(event) => setPassword(event.target.value)}
          />

          {reasonMessage ? (
            <p className="rounded-[1rem] border border-[#69d2ca]/40 bg-[#edfbf8] px-4 py-3 text-sm text-[#257e79]">
              {reasonMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending || checking || !username.trim() || !password}
            className="h-12 w-full rounded-full"
          >
            {isPending || checking ? "Signing in..." : "Enter Admin"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
