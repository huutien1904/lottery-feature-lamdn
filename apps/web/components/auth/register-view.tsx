import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type RegisterMessages = {
  cardTagline: string;
  headlinePrefix: string;
  headlineAccent: string;
  headlineSuffix: string;
  marketingBody: string;
  title: string;
  subtitle: string;
  continueWithGoogle: string;
  orWithEmail: string;
  businessNameLabel: string;
  businessNamePlaceholder: string;
  businessEmailLabel: string;
  businessEmailPlaceholder: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  alreadyHaveAccount: string;
  loginHere: string;
  legalDisclaimer: string;
};

type RegisterViewProps = {
  locale: AppLocale;
  brand: string;
  copyright: string;
  messages: RegisterMessages;
};

export function RegisterView({ locale, brand, copyright, messages }: RegisterViewProps) {
  const localePrefix = `/${locale}`;
  const brandSlug = brand.replace(/\s+/g, "").toLowerCase();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-[#f8f9fb] px-6 pb-10 pt-8 lg:w-1/2 lg:px-12 lg:py-12">
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-[min(520px,80vw)] rounded-full blur-3xl"
          style={{ backgroundColor: "color-mix(in oklch, var(--secondary) 35%, transparent)" }}
          aria-hidden
        />

        <Link
          href={localePrefix}
          className="relative z-1 flex items-center gap-2 text-xl font-semibold text-[#0a1128]"
        >
          <Image
            src="/icon/logo_min.png"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0"
          />
          {brand}
        </Link>

        <div className="relative z-1 mt-10 flex flex-1 flex-col items-center justify-center gap-10 lg:mt-0">
          <div className="flex w-full max-w-sm flex-col items-center rounded-4xl bg-white px-10 py-10 shadow-[0_20px_50px_-12px_rgb(15_23_42/0.18)]">
            <div className="mb-6 flex justify-center">
              <Image
                src="/icon/logo_full.png"
                alt={brand}
                width={220}
                height={160}
                className="h-auto w-[min(220px,70vw)] object-contain"
              />
            </div>
            <p className="text-center text-xl font-semibold tracking-tight text-[#0a1128]">
              {brandSlug}
            </p>
            <div className="mt-5 flex w-full items-center gap-3">
              <span className="h-px flex-1 bg-muted-foreground/25" aria-hidden />
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {messages.cardTagline}
              </span>
              <span className="h-px flex-1 bg-muted-foreground/25" aria-hidden />
            </div>
          </div>

          <div className="max-w-lg text-center">
            <p className="text-3xl font-bold leading-tight text-[#0a1128] lg:text-[2rem] lg:leading-snug">
              {messages.headlinePrefix}
              <span className="text-secondary">{messages.headlineAccent}</span>
              {messages.headlineSuffix}
            </p>
            {messages.marketingBody.trim() !== "" ? (
              <p className="mt-4 text-base text-muted-foreground">{messages.marketingBody}</p>
            ) : null}
          </div>
        </div>

        <p className="relative z-1 hidden text-xs text-muted-foreground lg:mt-auto md:mt-12 md:block">
          {copyright}
        </p>
      </aside>

      <main className="flex flex-1 flex-col justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-[#0a1128]">{messages.title}</h1>
          {messages.subtitle.trim() !== "" ? (
            <p className="mt-2 text-sm text-muted-foreground">{messages.subtitle}</p>
          ) : null}

          {/* Desktop / tablet: Google button ở trên form */}
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-8 hidden h-11 w-full rounded-xl border-input text-sm font-medium md:inline-flex",
            )}
          >
            <FcGoogle className="mr-2 size-4 shrink-0" />
            {messages.continueWithGoogle}
          </button>

          <div className="my-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="hidden text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground md:inline-block">
              {messages.orWithEmail}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          <form className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0a1128]" htmlFor="business-name">
                {messages.businessNameLabel}
              </label>
              <input
                id="business-name"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:ring-2"
                placeholder={messages.businessNamePlaceholder}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0a1128]" htmlFor="business-email">
                {messages.businessEmailLabel}
              </label>
              <input
                id="business-email"
                type="email"
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:ring-2"
                placeholder={messages.businessEmailPlaceholder}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0a1128]" htmlFor="password">
                  {messages.passwordLabel}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:ring-2"
                  placeholder={messages.passwordPlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0a1128]" htmlFor="confirm-password">
                  {messages.confirmPasswordLabel}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:ring-2"
                  placeholder={messages.passwordPlaceholder}
                />
              </div>
            </div>

            <Button
              type="button"
              className="mt-2 h-12 w-full rounded-xl bg-secondary font-semibold text-secondary-foreground shadow-[0_4px_0_0_rgb(204_134_42)] transition-all hover:bg-secondary/90 active:translate-y-0.5 active:shadow-none"
            >
              {messages.submit}
            </Button>
          </form>

          {/* Mobile: Google button ở dưới nút tạo tài khoản */}
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-4 flex h-11 w-full rounded-xl border-input text-sm font-medium md:hidden",
            )}
          >
            <FcGoogle className="mr-2 size-4 shrink-0" />
            {messages.continueWithGoogle}
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {messages.alreadyHaveAccount}{" "}
            <Link
              href={`${localePrefix}/login`}
              className="font-semibold text-secondary underline underline-offset-2"
            >
              {messages.loginHere}
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            {messages.legalDisclaimer}
          </p>
        </div>
      </main>
    </div>
  );
}
