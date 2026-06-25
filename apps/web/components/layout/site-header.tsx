"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { getPublicApiBaseUrl } from "@/lib/public-api-url";
import {
  clearAuth,
  getAuthUser,
  getAccessToken,
  type AuthUser,
} from "@/lib/auth-session";
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
  logoutLabel: string;
};

export function SiteHeader({
  locale,
  brand,
  navItems,
  loginLabel,
  ctaLabel,
  logoutLabel,
}: SiteHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const localePrefix = `/${locale}`;

  // Read user from localStorage after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getAuthUser());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const token = getAccessToken();
    if (token) {
      // Fire-and-forget — clear client state regardless of server response
      fetch(`${getPublicApiBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearAuth();
    setUser(null);
    setDropdownOpen(false);
    router.replace(localePrefix);
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const authArea = !hydrated ? (
    // Skeleton to prevent hydration mismatch
    <div className="size-8 animate-pulse rounded-full bg-muted" />
  ) : user ? (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pr-1 outline-none ring-ring/50 focus-visible:ring-2"
        aria-label="Account menu"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.fullName}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover ring-2 ring-border"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
            {initials}
          </span>
        )}
        <span className="hidden max-w-30 truncate text-sm font-medium md:block">
          {user.fullName}
        </span>
        <svg
          className={cn("size-3.5 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-10 z-50 min-w-45 rounded-xl border border-border bg-white py-1 shadow-lg">
          <div className="border-b border-border px-4 py-2.5">
            <p className="truncate text-xs font-semibold text-foreground">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Link href={`${localePrefix}/login`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
        {loginLabel}
      </Link>
      <Link href={`${localePrefix}/register`} className={buttonVariants({ size: "sm" })}>
        {ctaLabel}
      </Link>
    </div>
  );

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

        {/* Desktop auth area */}
        <div className="hidden md:flex">{authArea}</div>

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-all md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0",
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

          <div className="mt-2">
            {hydrated && user ? (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={28}
                      height={28}
                      className="size-7 shrink-0 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {initials}
                    </span>
                  )}
                  <span className="truncate text-sm font-medium">{user.fullName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 shrink-0 text-xs font-medium text-red-600"
                >
                  {logoutLabel}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
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
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
