"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { persistAuthTokens, fetchAndCacheUser } from "@/lib/auth-session";
import { getPublicApiBaseUrl } from "@/lib/public-api-url";
import { cn } from "@/lib/utils";

type LoginViewProps = {
  locale: AppLocale;
  footer: {
    brand: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    contactSupport: string;
    apiReference: string;
  };
  messages: {
    topNote: string;
    topAction: string;
    welcome: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    signIn: string;
    continueWith: string;
    signInWithGoogle: string;
    noAccount: string;
    createAccount: string;
    errorInvalidCredentials: string;
    errorEmailNotVerified: string;
    resendVerification: string;
    errorGeneric: string;
  };
  googleOAuthHref: string | null;
  googleOAuthUnavailable: string;
};

export function LoginView({
  locale,
  footer,
  messages,
  googleOAuthHref,
  googleOAuthUnavailable,
}: LoginViewProps) {
  const router = useRouter();
  const localePrefix = `/${locale}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendDone(false);
    setLoading(true);

    try {
      const res = await fetch(`${getPublicApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json() as {
        success: boolean;
        data?: { accessToken: string; refreshToken: string };
        error?: { message?: string };
      };

      if (!res.ok) {
        const msg = body?.error?.message ?? "";
        if (msg === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true);
        } else if (res.status === 401) {
          setError(messages.errorInvalidCredentials);
        } else {
          setError(messages.errorGeneric);
        }
        return;
      }

      persistAuthTokens(body.data!.accessToken, body.data!.refreshToken);
      await fetchAndCacheUser(getPublicApiBaseUrl());
      router.replace(localePrefix);
    } catch (err) {
      console.error("[Login] fetch error:", err);
      setError(messages.errorGeneric);
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    try {
      await fetch(`${getPublicApiBaseUrl()}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setResendDone(true);
    } catch {
      /* silent — resend is best-effort */
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_center,#123f87_0%,#062350_45%,#031433_100%)]">
      <main className="flex flex-1 items-center justify-center px-4 py-14">
        <section className="w-full max-w-sm rounded-2xl bg-white p-8 text-foreground shadow-2xl">
          <div className="mx-auto mb-6 flex size-10 items-center justify-center rounded-full border border-border bg-muted/40">
            <Image src="/icon/logo_min.png" alt="Random Lucky logo" width={24} height={24} className="size-6" />
          </div>

          <h1 className="text-center text-3xl font-semibold">{messages.welcome}</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">{messages.subtitle}</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="login-email">
                {messages.emailLabel}
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-full border border-input bg-muted/40 px-4 text-sm outline-none ring-ring/50 focus-visible:ring-2"
                placeholder={messages.emailPlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="login-password">
                  {messages.passwordLabel}
                </label>
                <Link href="#" className="text-xs font-medium text-secondary">
                  {messages.forgotPassword}
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-full border border-input bg-muted/40 px-4 text-sm outline-none ring-ring/50 focus-visible:ring-2"
                placeholder={messages.passwordPlaceholder}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}

            {emailNotVerified && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p>{messages.errorEmailNotVerified}</p>
                {resendDone ? (
                  <p className="mt-1 font-medium text-green-700">✓ Đã gửi lại email!</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="mt-1 font-semibold underline underline-offset-2"
                  >
                    {messages.resendVerification}
                  </button>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-10 w-full rounded-full disabled:opacity-60">
              {loading ? "…" : messages.signIn}
            </Button>
          </form>

          <p className="my-4 text-center text-xs text-muted-foreground">{messages.continueWith}</p>

          {googleOAuthHref ? (
            <a
              href={googleOAuthHref}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full rounded-full text-sm")}
            >
              <FcGoogle className="mr-2 size-4" />
              {messages.signInWithGoogle}
            </a>
          ) : (
            <button
              type="button"
              disabled
              title={googleOAuthUnavailable}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full cursor-not-allowed rounded-full text-sm opacity-60",
              )}
            >
              <FcGoogle className="mr-2 size-4" />
              {messages.signInWithGoogle}
            </button>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {messages.noAccount}{" "}
            <Link href={`${localePrefix}/register`} className="font-semibold text-secondary">
              {messages.createAccount}
            </Link>
          </p>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#031433]/80 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-lg font-semibold">{footer.brand}</p>
            <p className="hidden text-xs text-white/70 md:block">{footer.copyright}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: footer.privacyPolicy, href: "#privacy" },
              { label: footer.termsOfService, href: "#terms" },
              { label: footer.contactSupport, href: "#support" },
              { label: footer.apiReference, href: "#api" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-white/70 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
