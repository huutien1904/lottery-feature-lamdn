"use client";

import Link from "next/link";
import { useState } from "react";
import { HiCheck, HiX } from "react-icons/hi";
import { MdFlashOn, MdInsights, MdTune } from "react-icons/md";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import type { PricingMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const PRO_MONTHLY_USD = 29;
const BUSINESS_MONTHLY_USD = 99;
const YEARLY_DISCOUNT = 0.2;

const NAVY_CARD = "bg-[#0c1629]";
const HIGHLIGHT_ICONS = [MdTune, MdInsights, MdFlashOn] as const;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function monthlyDisplayUsd(monthlyUsd: number, yearly: boolean) {
  if (monthlyUsd === 0) return 0;
  if (!yearly) return monthlyUsd;
  return Math.round(monthlyUsd * (1 - YEARLY_DISCOUNT) * 100) / 100;
}

type PricingPageViewProps = {
  locale: AppLocale;
  messages: PricingMessages;
};

export function PricingPageView({ locale, messages }: PricingPageViewProps) {
  const [yearly, setYearly] = useState(false);
  const prefix = `/${locale}`;

  const freePrice = monthlyDisplayUsd(0, yearly);
  const proPrice = monthlyDisplayUsd(PRO_MONTHLY_USD, yearly);
  const businessPrice = monthlyDisplayUsd(BUSINESS_MONTHLY_USD, yearly);

  return (
    <>
      <section className="border-b border-border bg-background px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0a1628] md:text-4xl lg:text-5xl">
            {messages.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            {messages.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div
              className="inline-flex rounded-full border border-border bg-muted/80 p-1 shadow-sm"
              role="group"
              aria-label="Billing period"
            >
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  !yearly
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {messages.billingMonthly}
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  yearly
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {messages.billingYearly}
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
                  {messages.yearlySaveBadge}
                </span>
              </button>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-8">
            {/* Free */}
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm md:p-7">
              <h2 className="text-xl font-bold text-[#0a1628]">{messages.plans.free.name}</h2>
              <p className="mt-2 min-h-[3rem] text-sm text-muted-foreground">
                {messages.plans.free.description}
              </p>
              <div className="mt-6 text-left">
                <span className="text-4xl font-bold tabular-nums text-[#0a1628]">
                  {formatUsd(freePrice)}
                </span>
                <span className="text-muted-foreground">{messages.priceSuffix}</span>
              </div>
              <div className="mt-1 min-h-[1.25rem]" aria-hidden />
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-left text-sm">
                {messages.plans.free.features.map((row) => (
                  <li key={row.text} className="flex gap-2">
                    <span
                      className={cn(
                        "mt-0.5 shrink-0",
                        row.included ? "text-secondary" : "text-muted-foreground/60",
                      )}
                      aria-hidden
                    >
                      {row.included ? <HiCheck className="size-5" /> : <HiX className="size-5" />}
                    </span>
                    <span
                      className={cn(
                        "leading-snug",
                        row.included ? "text-foreground" : "text-muted-foreground line-through",
                      )}
                    >
                      {row.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={`${prefix}/register`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-8 w-full rounded-xl border-foreground/20 font-semibold",
                )}
              >
                {messages.plans.free.cta}
              </Link>
            </article>

            {/* Pro — highlighted */}
            <article
              className={cn(
                "relative flex flex-col rounded-2xl border-2 border-secondary p-6 shadow-xl md:-translate-y-2 md:p-7",
                NAVY_CARD,
                "text-white",
              )}
            >
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-secondary px-4 py-1 text-xs font-bold uppercase tracking-wide text-secondary-foreground shadow-md">
                {messages.plans.pro.popularBadge}
              </span>
              <h2 className="mt-2 text-xl font-bold">{messages.plans.pro.name}</h2>
              <p className="mt-2 min-h-[3rem] text-sm text-white/75">{messages.plans.pro.description}</p>
              <div className="mt-6 text-left">
                <span className="text-4xl font-bold tabular-nums">{formatUsd(proPrice)}</span>
                <span className="text-white/70">{messages.priceSuffix}</span>
              </div>
              {yearly ? (
                <p className="mt-1 min-h-[1.25rem] text-xs text-white/60">{messages.billedAnnuallyNote}</p>
              ) : (
                <div className="mt-1 min-h-[1.25rem]" aria-hidden />
              )}
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-left text-sm">
                {messages.plans.pro.features.map((row) => (
                  <li key={row.text} className="flex gap-2">
                    <HiCheck className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden />
                    <span className="leading-snug text-white/95">{row.text}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 w-full rounded-xl bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90">
                <Link href={`${prefix}/register`}>{messages.plans.pro.cta}</Link>
              </Button>
            </article>

            {/* Business */}
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm md:p-7">
              <h2 className="text-xl font-bold text-[#0a1628]">{messages.plans.business.name}</h2>
              <p className="mt-2 min-h-[3rem] text-sm text-muted-foreground">
                {messages.plans.business.description}
              </p>
              <div className="mt-6 text-left">
                <span className="text-4xl font-bold tabular-nums text-[#0a1628]">
                  {formatUsd(businessPrice)}
                </span>
                <span className="text-muted-foreground">{messages.priceSuffix}</span>
              </div>
              {yearly ? (
                <p className="mt-1 min-h-[1.25rem] text-xs text-muted-foreground">
                  {messages.billedAnnuallyNote}
                </p>
              ) : (
                <div className="mt-1 min-h-[1.25rem]" aria-hidden />
              )}
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-left text-sm">
                {messages.plans.business.features.map((row) => (
                  <li key={row.text} className="flex gap-2">
                    <HiCheck className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden />
                    <span className="leading-snug text-foreground">{row.text}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:support@randomlucky.app"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-8 w-full rounded-xl border-foreground/20 font-semibold",
                )}
              >
                {messages.plans.business.cta}
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/50 px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0a1628] md:text-3xl">
              {messages.showcaseTitle}
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">{messages.showcaseSubtitle}</p>
          </div>
          <div
            className={cn(
              "flex min-h-[220px] items-center justify-center rounded-3xl text-center text-sm font-medium text-white/50 md:min-h-[280px]",
              NAVY_CARD,
            )}
          >
            {messages.videoPlaceholderLabel}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3 md:gap-6">
          {messages.highlights.map((item, i) => {
            const Icon = HIGHLIGHT_ICONS[i] ?? MdTune;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
              >
                <Icon className="size-8 text-secondary" aria-hidden />
                <h3 className="mt-4 font-bold text-[#0a1628]">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-background px-4 pb-16 pt-4 md:px-6 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center shadow-lg md:px-12 md:py-14">
            <h2 className="text-3xl font-bold text-secondary-foreground md:text-4xl">
              {messages.bottomBanner.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-secondary-foreground/95 md:text-lg">
              {messages.bottomBanner.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`${prefix}/register`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "min-w-[180px] rounded-xl border-0 bg-background font-semibold text-foreground shadow-md hover:bg-background/90",
                )}
              >
                {messages.bottomBanner.primaryCta}
              </Link>
              <a
                href="mailto:support@randomlucky.app"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-w-[180px] rounded-xl border-2 border-secondary-foreground/40 bg-transparent font-semibold text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground",
                )}
              >
                {messages.bottomBanner.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
