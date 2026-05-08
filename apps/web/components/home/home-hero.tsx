import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { type AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

import { LegacyWheelEmbed } from "./legacy-wheel-embed";

type HomeHeroProps = {
  locale: AppLocale;
  messages: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    titleEnd: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustText: string;
    wheelPlaceholderTitle: string;
    wheelPlaceholderDescription: string;
  };
};

export function HomeHero({ locale, messages }: HomeHeroProps) {
  const localePrefix = `/${locale}`;

  return (
    <section className="border-b border-border bg-background py-12 md:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            {messages.badge}
          </span>
          <h1 className="text-4xl leading-tight font-bold text-foreground md:text-5xl">
            {messages.titleStart} <span className="text-secondary">{messages.titleAccent}</span>{" "}
            {messages.titleEnd}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            {messages.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${localePrefix}/register`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "rounded-full px-6",
              )}
            >
              {messages.primaryCta}
            </Link>
            <Link
              href="#contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-6")}
            >
              {messages.secondaryCta}
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">{messages.trustText}</p>
        </div>

        <LegacyWheelEmbed
          title={messages.wheelPlaceholderTitle}
          description={messages.wheelPlaceholderDescription}
        />
      </div>
    </section>
  );
}

