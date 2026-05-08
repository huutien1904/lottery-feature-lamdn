import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type HomeBottomCtaProps = {
  locale: AppLocale;
  messages: {
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
  };
};

export function HomeBottomCta({ locale, messages }: HomeBottomCtaProps) {
  const localePrefix = `/${locale}`;

  return (
    <section id="pricing" className="bg-background pb-14 md:pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#001b4b] px-6 py-10 text-center text-white md:px-10">
          <div className="pointer-events-none absolute -left-10 -bottom-16 size-40 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -top-14 right-8 size-32 rounded-full border border-white/10" />

          <h2 className="text-3xl font-bold md:text-4xl">{messages.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">{messages.subtitle}</p>

          <div id="contact" className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`${localePrefix}/register`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "rounded-full px-6",
              )}
            >
              {messages.primaryButton}
            </Link>
            <Link
              href="mailto:support@randomlucky.app"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {messages.secondaryButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

