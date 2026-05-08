import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type LoginViewProps = {
  locale: AppLocale;
  brand: string;
  footer: {
    brand: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    contactSupport: string;
    apiReference: string;
  };
  messages: {
    topNote: string;
    topAction: string;
    welcome: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    signIn: string;
    continueWith: string;
    signInWithGoogle: string;
    noAccount: string;
    createAccount: string;
  };
};

export function LoginView({ locale, footer, messages }: LoginViewProps) {
  const localePrefix = `/${locale}`;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_center,#123f87_0%,#062350_45%,#031433_100%)]">
      <main className="flex flex-1 items-center justify-center px-4 py-14">
        <section className="w-full max-w-sm rounded-2xl bg-white p-8 text-foreground shadow-2xl">
          <div className="mx-auto mb-6 flex size-10 items-center justify-center rounded-full border border-border bg-muted/40">
            <Image
              src="/icon/logo_min.png"
              alt="Random Lucky logo"
              width={24}
              height={24}
              className="size-6"
            />
          </div>

          <h1 className="text-center text-3xl font-semibold">{messages.welcome}</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">{messages.subtitle}</p>

          <form className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {messages.emailLabel}
              </label>
              <input
                className="h-10 w-full rounded-full border border-input bg-muted/40 px-4 text-sm outline-none ring-ring/50 focus-visible:ring-2"
                placeholder={messages.emailPlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  {messages.passwordLabel}
                </label>
                <Link href="#" className="text-xs font-medium text-secondary">
                  {messages.forgotPassword}
                </Link>
              </div>
              <input
                className="h-10 w-full rounded-full border border-input bg-muted/40 px-4 text-sm outline-none ring-ring/50 focus-visible:ring-2"
                placeholder={messages.passwordPlaceholder}
                type="password"
              />
            </div>

            <Button type="button" className="h-10 w-full rounded-full">
              {messages.signIn}
            </Button>
          </form>

          <p className="my-4 text-center text-xs text-muted-foreground">
            {messages.continueWith}
          </p>

          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full rounded-full text-sm",
            )}
          >
            <FcGoogle className="mr-2 size-4" />
            {messages.signInWithGoogle}
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {messages.noAccount}{" "}
            <Link href={`${localePrefix}/register`} className="font-semibold text-secondary">
              {messages.createAccount}
            </Link>
          </p>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#031433]/80 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-lg font-semibold">{footer.brand}</p>
            <p className="hidden text-xs text-white/70 md:block">{footer.copyright}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: footer.privacyPolicy, href: "#privacy" },
              { label: footer.termsOfService, href: "#terms" },
              { label: footer.contactSupport, href: "#support" },
              { label: footer.apiReference, href: "#api" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-white/70 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

