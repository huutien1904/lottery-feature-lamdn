import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isAppLocale, locales } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  return { title: getMessages(locale).auth.googleWelcome.pageTitle };
}

export default async function GoogleWelcomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const copy = getMessages(locale).auth.googleWelcome;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,#123f87_0%,#062350_45%,#031433_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        {/* Success icon */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-50">
          <svg
            className="size-8 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#0a1128]">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>

        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span>📧 </span>{copy.emailNote}
        </div>

        <Link
          href={`/${locale}`}
          className="mt-6 inline-block w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground shadow-[0_4px_0_0_rgb(204_134_42)] transition-all hover:bg-secondary/90 active:translate-y-0.5 active:shadow-none"
        >
          {copy.goToDashboard}
        </Link>
      </div>
    </div>
  );
}
