"use client";

import { startTransition, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getPublicApiBaseUrl } from "@/lib/public-api-url";
import type { AppLocale } from "@/lib/i18n/config";

type Copy = {
  subtitle: string;
  resendPrompt: string;
  resendAction: string;
  resendSuccess: string;
};

type Props = {
  locale: AppLocale;
  copy: Copy;
};

export function CheckEmailClient({ locale, copy }: Props) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resendState, setResendState] = useState<"idle" | "loading" | "done">("idle");

  async function handleResend() {
    if (resendState !== "idle" || !email) return;
    startTransition(() => setResendState("loading"));

    try {
      await fetch(`${getPublicApiBaseUrl()}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } finally {
      startTransition(() => setResendState("done"));
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-muted-foreground">
        {copy.subtitle}{" "}
        {email && (
          <span className="font-semibold text-foreground break-all">{email}</span>
        )}
        .
      </p>

      {resendState === "done" ? (
        <p className="text-sm font-medium text-green-600">{copy.resendSuccess}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {copy.resendPrompt}{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === "loading"}
            className="font-semibold text-secondary underline underline-offset-2 disabled:opacity-50"
          >
            {resendState === "loading" ? "…" : copy.resendAction}
          </button>
        </p>
      )}
    </div>
  );
}
