import Link from "next/link";
import { notFound } from "next/navigation";

import { WheelCanvas } from "@/components/wheel3d/wheel-canvas";
import { isAppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type WheelLabPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function WheelLabPage({ params }: WheelLabPageProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground">{messages.wheelLab.title}</h1>
        <p className="mt-2 text-muted-foreground">{messages.wheelLab.subtitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{messages.wheelLab.helper}</p>
        <p className="mt-3">
          <Link
            href={`/${locale}/wheel-lab/product-sphere`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {messages.wheelLab.productSphereLink}
          </Link>
        </p>

        <WheelCanvas
          className="mt-8 h-[420px] overflow-hidden rounded-2xl border border-border md:h-[560px]"
          messages={{
            modeTable: messages.wheelLab.modeTable,
            modeSphere: messages.wheelLab.modeSphere,
            spin: messages.wheelLab.spin,
            spinning: messages.wheelLab.spinning,
            redraw: messages.wheelLab.redraw,
            reset: messages.wheelLab.reset,
            participantsLabel: messages.wheelLab.participantsLabel,
            prizesLabel: messages.wheelLab.prizesLabel,
            sourceApi: messages.wheelLab.sourceApi,
            sourceMock: messages.wheelLab.sourceMock,
            winnerLabel: messages.wheelLab.winnerLabel,
            noWinner: messages.wheelLab.noWinner,
            currentPrizeLabel: messages.wheelLab.currentPrizeLabel,
            remainingLabel: messages.wheelLab.remainingLabel,
            sessionIdle: messages.wheelLab.sessionIdle,
            sessionRunning: messages.wheelLab.sessionRunning,
            sessionCompleted: messages.wheelLab.sessionCompleted,
            allPrizesDone: messages.wheelLab.allPrizesDone,
            webglUnsupportedTitle: messages.wheelLab.webglUnsupportedTitle,
            webglUnsupportedDescription: messages.wheelLab.webglUnsupportedDescription,
            fallbackAction: messages.wheelLab.fallbackAction,
          }}
        />
      </div>
    </main>
  );
}

