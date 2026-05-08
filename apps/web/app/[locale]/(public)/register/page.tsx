import { notFound } from "next/navigation";

import { RegisterView } from "@/components/auth/register-view";
import { isAppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <RegisterView
      locale={locale}
      brand={messages.header.brand}
      copyright={messages.footer.copyright}
      messages={messages.register}
    />
  );
}
