import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CheckEmailClient } from "@/components/auth/check-email-client";
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
  return { title: getMessages(locale).auth.checkEmail.pageTitle };
}

export default async function CheckEmailPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const copy = getMessages(locale).auth.checkEmail;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,#123f87_0%,#062350_45%,#031433_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-blue-50">
          <svg
            className="size-7 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#0a1128]">{copy.title}</h1>

        <Suspense>
          <CheckEmailClient locale={locale} copy={copy} />
        </Suspense>

        <Link
          href={`/${locale}/login`}
          className="mt-6 inline-block text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {copy.backToLogin}
        </Link>
      </div>
    </div>
  );
}
