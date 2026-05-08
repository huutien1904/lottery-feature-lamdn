"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  locale: AppLocale;
  brand: string;
  navItems: NavItem[];
  loginLabel: string;
  ctaLabel: string;
};

export function SiteHeader({
  locale,
  brand,
  navItems,
  loginLabel,
  ctaLabel,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const localePrefix = `/${locale}`;

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href={localePrefix} className="hidden items-center gap-2 md:inline-flex">
          <span className="size-2 rounded-full bg-secondary" aria-hidden />
          <span className="text-lg font-semibold text-foreground">{brand}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={`${localePrefix}/login`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {loginLabel}
          </Link>
          <Link href={`${localePrefix}/register`} className={buttonVariants({ size: "sm" })}>
            {ctaLabel}
          </Link>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <FaTimes /> : <FaBars />}
        </Button>

        <Link
          href={localePrefix}
          className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-foreground md:hidden"
        >
          {brand}
        </Link>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-all md:hidden",
          open ? "max-h-80" : "max-h-0 border-t-0",
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <Link
              href={`${localePrefix}/login`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
              onClick={() => setOpen(false)}
            >
              {loginLabel}
            </Link>
            <Link
              href={`${localePrefix}/register`}
              className={buttonVariants({ size: "sm" })}
              onClick={() => setOpen(false)}
            >
              {ctaLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

