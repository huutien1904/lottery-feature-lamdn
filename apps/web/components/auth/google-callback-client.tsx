"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

import type { AppLocale } from "@/lib/i18n/config";
import { persistAuthTokens, fetchAndCacheUser } from "@/lib/auth-session";
import { getPublicApiBaseUrl } from "@/lib/public-api-url";

type OauthCallbackCopy = {
  working: string;
  errorGeneric: string;
  continueHome: string;
  existingAccountTitle: string;
  existingAccountSubtitle: string;
  continueToApp: string;
};

type GoogleCallbackClientProps = {
  locale: AppLocale;
  messages: OauthCallbackCopy;
};

type Phase = "working" | "error";

export function GoogleCallbackClient({ locale, messages }: GoogleCallbackClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("working");
  // Prevent double-processing in React Strict Mode (effect runs twice in dev)
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const qError = searchParams.get("error");
    if (qError) {
      startTransition(() => setPhase("error"));
      return;
    }

    const rawHash =
      typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const params = new URLSearchParams(rawHash);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const isNew = params.get("is_new") === "1";

    if (!access || !refresh) {
      startTransition(() => setPhase("error"));
      return;
    }

    persistAuthTokens(access, refresh);

    // Clear tokens from URL (security — don't leave them in browser history)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // useEffect callback cannot be async — use inner async function
    void (async () => {
      await fetchAndCacheUser(getPublicApiBaseUrl());
      if (isNew) {
        router.replace(`/${locale}/auth/google-welcome`);
      } else {
        router.replace(`/${locale}`);
      }
    })();
  }, [locale, router, searchParams]);

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <p className="text-muted-foreground">{messages.errorGeneric}</p>
        <Link
          href={`/${locale}`}
          className="inline-block font-semibold text-secondary underline underline-offset-2"
        >
          {messages.continueHome}
        </Link>
      </div>
    );
  }

  // "working" — show spinner while processing/redirecting
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-secondary" />
      <p className="text-muted-foreground">{messages.working}</p>
    </div>
  );
}
