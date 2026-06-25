/**
 * Required so routes under `(public)/…` resolve under `[locale]`
 * (e.g. `/vi/wheel-lab`, `/vi/register`). Without this layout, those paths can 404 in dev.
 */
export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
