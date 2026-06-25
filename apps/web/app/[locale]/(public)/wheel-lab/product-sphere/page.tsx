import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductStyleSphereCanvas } from "@/components/wheel3d/product-style-sphere-canvas";
import { isAppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type ProductSpherePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProductSpherePage({ params }: ProductSpherePageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const m = messages.wheelLabProductSphere;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-8xl">
        <Link
          href={`/${locale}/wheel-lab`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {m.backToLab}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground">{m.title}</h1>
        <p className="mt-2 text-muted-foreground">{m.subtitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{m.helper}</p>

        <ProductStyleSphereCanvas
          className="mt-8 overflow-hidden rounded-2xl border border-border"
          messages={{
            modeTable: m.modeTable,
            modeSphere: m.modeSphere,
            hint: m.controlsHint,
            spin: m.spin,
            spinning: m.spinning,
            resetDraw: m.resetDraw,
            winnerLabel: m.winnerLabel,
            noWinner: m.noWinner,
            participantsCount: m.participantsCount,
            winnerOverlayBadge: m.winnerOverlayBadge,
            winnerOverlayIdLabel: m.winnerOverlayIdLabel,
            demoCardsNote: m.demoCardsNote,
            prizeTierFirst: m.prizeTierFirst,
            prizeTierSecond: m.prizeTierSecond,
            prizeTierThird: m.prizeTierThird,
            prizeTierSlotsLabel: m.prizeTierSlotsLabel,
            prizeTierHint: m.prizeTierHint,
            prizePeopleUnit: m.prizePeopleUnit,
            revealPause: m.revealPause,
            revealResume: m.revealResume,
            viewAllResults: m.viewAllResults,
            resultsSummaryTitle: m.resultsSummaryTitle,
            resultsSummaryClose: m.resultsSummaryClose,
            continueNextTier: m.continueNextTier,
            expandArena: m.expandArena,
            collapseArena: m.collapseArena,
          }}
        />
      </div>
    </main>
  );
}
