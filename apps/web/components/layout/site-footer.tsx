import Link from "next/link";

type FooterItem = {
  label: string;
  href: string;
};

type SiteFooterProps = {
  brand: string;
  copyright: string;
  links: FooterItem[];
};

export function SiteFooter({ brand, copyright, links }: SiteFooterProps) {
  return (
    <footer className="mt-auto bg-[#001b4b] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-3xl font-semibold">{brand}</p>
          <p className="mt-2 hidden text-sm text-white/75 md:block">{copyright}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

