import { notFound } from "next/navigation";

import { HomeBottomCta } from "@/components/home/home-bottom-cta";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeWhyChoose } from "@/components/home/home-why-choose";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isAppLocale, locales } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
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
          { label: messages.header.features, href: "#features" },
          { label: messages.header.pricing, href: "#pricing" },
          { label: messages.header.showcase, href: "#showcase" },
          { label: messages.header.docs, href: "#docs" },
        ]}
        loginLabel={messages.header.login}
        ctaLabel={messages.header.getStarted}
      />
      <main className="flex-1" id="docs">
        <HomeHero locale={locale} messages={messages.home.hero} />
        <HomeHowItWorks messages={messages.home.howItWorks} />
        <HomeWhyChoose messages={messages.home.whyChoose} />
        <HomeBottomCta locale={locale} messages={messages.home.bottomCta} />
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

