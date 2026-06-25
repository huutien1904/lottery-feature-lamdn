import { notFound } from "next/navigation";

import { RegisterView } from "@/components/auth/register-view";
import { isAppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getPublicApiBaseUrl } from "@/lib/public-api-url";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const googleOAuthHref = `${getPublicApiBaseUrl()}/auth/google?locale=${locale}`;

  return (
    <RegisterView
      locale={locale}
      brand={messages.header.brand}
      copyright={messages.footer.copyright}
      messages={messages.register}
      googleOAuthHref={googleOAuthHref}
      googleOAuthUnavailable={messages.auth.oauthCallback.googleUnavailable}
    />
  );
}
