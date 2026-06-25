import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { GoogleCallbackClient } from "@/components/auth/google-callback-client";
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
  if (!isAppLocale(locale)) {
    return {};
  }
  const messages = getMessages(locale);
  return {
    title: messages.auth.oauthCallback.pageTitle,
  };
}

export default async function GoogleOAuthCallbackPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const copy = getMessages(locale).auth.oauthCallback;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-muted-foreground">
          {copy.working}
        </div>
      }
    >
      <GoogleCallbackClient
        locale={locale}
        messages={{
          working: copy.working,
          errorGeneric: copy.errorGeneric,
          continueHome: copy.continueHome,
          existingAccountTitle: copy.existingAccountTitle,
          existingAccountSubtitle: copy.existingAccountSubtitle,
          continueToApp: copy.continueToApp,
        }}
      />
    </Suspense>
  );
}
