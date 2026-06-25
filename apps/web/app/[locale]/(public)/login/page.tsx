import { notFound } from "next/navigation";

import { LoginView } from "@/components/auth/login-view";
import { isAppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getPublicApiBaseUrl } from "@/lib/public-api-url";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const googleOAuthHref = `${getPublicApiBaseUrl()}/auth/google?locale=${locale}`;

  return (
    <LoginView
      locale={locale}
      footer={messages.footer}
      messages={messages.login}
      googleOAuthHref={googleOAuthHref}
      googleOAuthUnavailable={messages.auth.oauthCallback.googleUnavailable}
    />
  );
}

