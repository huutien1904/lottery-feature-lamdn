import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { VerifyEmailClient } from "@/components/auth/verify-email-client";
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
  return { title: getMessages(locale).auth.verifyEmail.pageTitle };
}

export default async function VerifyEmailPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const copy = getMessages(locale).auth.verifyEmail;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,#123f87_0%,#062350_45%,#031433_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Suspense
          fallback={
            <div className="py-6 text-center text-muted-foreground">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-secondary" />
              <p>{copy.verifying}</p>
            </div>
          }
        >
          <VerifyEmailClient locale={locale} copy={copy} />
        </Suspense>
      </div>
    </div>
  );
}
