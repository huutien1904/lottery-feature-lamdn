import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PricingPageView } from "@/components/pricing/pricing-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isAppLocale, locales } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return {};
  }
  const messages = getMessages(locale);
  return {
    title: messages.pricing.metaTitle,
  };
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        locale={locale}
        brand={messages.header.brand}
        navItems={[
          { label: messages.header.features, href: `/${locale}#features` },
          { label: messages.header.pricing, href: `/${locale}/pricing` },
          { label: messages.header.showcase, href: `/${locale}#showcase` },
          { label: messages.header.docs, href: `/${locale}#docs` },
        ]}
        loginLabel={messages.header.login}
        ctaLabel={messages.header.getStarted}
      />
      <main className="flex-1">
        <PricingPageView locale={locale} messages={messages.pricing} />
      </main>
      <SiteFooter
        brand={messages.footer.brand}
        copyright={messages.footer.copyright}
        links={[
          { label: messages.footer.privacyPolicy, href: "#privacy" },
          { label: messages.footer.termsOfService, href: "#terms" },
          { label: messages.footer.contactSupport, href: "#support" },
          { label: messages.footer.apiReference, href: "#api" },
        ]}
      />
    </div>
  );
}
