"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getPublicApiBaseUrl } from "@/lib/public-api-url";
import type { AppLocale } from "@/lib/i18n/config";

type Copy = {
  verifying: string;
  successTitle: string;
  successSubtitle: string;
  goToLogin: string;
  errorInvalidTitle: string;
  errorInvalidBody: string;
  errorExpiredTitle: string;
  errorExpiredBody: string;
  resendAction: string;
  resendSuccess: string;
};

type Phase = "verifying" | "success" | "invalid" | "expired";

type Props = {
  locale: AppLocale;
  copy: Copy;
};

export function VerifyEmailClient({ locale, copy }: Props) {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [resendEmail, setResendEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      startTransition(() => setPhase("invalid"));
      return;
    }

    fetch(`${getPublicApiBaseUrl()}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          startTransition(() => setPhase("success"));
          return;
        }
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const code = body?.error?.message ?? "";
        startTransition(() => setPhase(code === "TOKEN_EXPIRED" ? "expired" : "invalid"));
      })
      .catch(() => startTransition(() => setPhase("invalid")));
  }, [searchParams]);

  async function handleResend() {
    if (resendState !== "idle" || !resendEmail.trim()) return;
    startTransition(() => setResendState("loading"));
    try {
      await fetch(`${getPublicApiBaseUrl()}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim(), locale }),
      });
    } finally {
      startTransition(() => setResendState("done"));
    }
  }

  if (phase === "verifying") {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-secondary" />
        <p>{copy.verifying}</p>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="space-y-5 py-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50">
          <svg className="size-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0a1128]">{copy.successTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.successSubtitle}</p>
        </div>
        <Link
          href={`/${locale}/login`}
          className="inline-block rounded-full bg-secondary px-8 py-2.5 text-sm font-semibold text-secondary-foreground"
        >
          {copy.goToLogin}
        </Link>
      </div>
    );
  }

  const isExpired = phase === "expired";
  const title = isExpired ? copy.errorExpiredTitle : copy.errorInvalidTitle;
  const body = isExpired ? copy.errorExpiredBody : copy.errorInvalidBody;

  return (
    <div className="space-y-5 py-4 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50">
        <svg className="size-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#0a1128]">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      </div>

      {isExpired && (
        <div className="space-y-2">
          {resendState === "done" ? (
            <p className="text-sm font-medium text-green-600">{copy.resendSuccess}</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Email"
                className="h-10 flex-1 rounded-full border border-input bg-muted/40 px-4 text-sm outline-none ring-ring/50 focus-visible:ring-2"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === "loading" || !resendEmail.trim()}
                className="h-10 rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground disabled:opacity-50"
              >
                {resendState === "loading" ? "…" : copy.resendAction}
              </button>
            </div>
          )}
        </div>
      )}

      <Link
        href={`/${locale}/login`}
        className="inline-block text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        {copy.goToLogin}
      </Link>
    </div>
  );
}
