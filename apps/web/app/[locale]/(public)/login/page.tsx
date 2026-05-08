import { notFound } from "next/navigation";

import { LoginView } from "@/components/auth/login-view";
import { isAppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <LoginView
      locale={locale}
      brand={messages.header.brand}
      footer={messages.footer}
      messages={messages.login}
    />
  );
}

