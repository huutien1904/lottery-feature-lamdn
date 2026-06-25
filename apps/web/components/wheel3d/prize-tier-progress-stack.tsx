"use client";

type PrizeTierRowId = "first" | "second" | "third";

export type PrizeTierProgressRow = {
  id: PrizeTierRowId;
  label: string;
  total: number;
  drawn: number;
};

type PrizeTierProgressStackProps = {
  className?: string;
  tiers: PrizeTierProgressRow[];
  /** Tier currently spinning / revealing; glow + motion when set */
  activeTierId: PrizeTierRowId | null;
};

function PrizeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="14" cy="26" rx="10" ry="4" fill="rgba(0,0,0,0.25)" />
      <circle cx="12" cy="14" r="7" fill="#e8b84a" stroke="#b88920" strokeWidth="1.2" />
      <circle cx="12" cy="14" r="4.5" fill="#f5d76e" />
      <circle cx="22" cy="12" r="6" fill="#d4a024" stroke="#8a6510" strokeWidth="1" />
      <circle cx="22" cy="12" r="3.5" fill="#f0c85c" />
      <rect x="20" y="18" width="12" height="10" rx="1.5" fill="#2d8f5a" stroke="#1a5c3a" strokeWidth="0.8" />
      <rect x="22" y="20" width="8" height="2" rx="0.5" fill="rgba(255,255,255,0.25)" />
      <rect x="22" y="23.5" width="6" height="1.5" rx="0.4" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

export function PrizeTierProgressStack({ className, tiers, activeTierId }: PrizeTierProgressStackProps) {
  return (
    <div className={className}>
      <ul className="flex flex-col gap-2.5 p-0">
        {tiers.map((tier) => {
          const active = activeTierId === tier.id;
          const safeTotal = Math.max(tier.total, 1);
          const drawn = Math.min(tier.drawn, safeTotal);
          const pct = Math.min(100, Math.round((drawn / safeTotal) * 100));

          return (
            <li key={tier.id} className="relative list-none">
              {active ? (
                <div
                  className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl opacity-90 blur-md"
                  aria-hidden
                >
                  <div
                    className="h-full w-full animate-spin rounded-2xl bg-[conic-gradient(from_0deg,transparent_0%,rgba(147,246,255,0.55)_18%,rgba(255,255,255,0.35)_42%,transparent_58%,rgba(56,189,248,0.5)_78%,transparent_100%)] [animation-duration:2.8s]"
                    aria-hidden
                  />
                </div>
              ) : null}

              <div
                className={
                  active
                    ? "relative flex items-stretch gap-2 rounded-xl border-2 border-cyan-300/70 bg-teal-900/55 px-2.5 py-2 shadow-[0_0_22px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm"
                    : "relative flex items-stretch gap-2 rounded-xl border border-cyan-500/25 bg-teal-600/20 px-2.5 py-2 shadow-sm backdrop-blur-sm"
                }
              >
                {active ? (
                  <div
                    className="pointer-events-none absolute inset-y-1 right-0 w-0.5 rounded-full bg-gradient-to-b from-cyan-200/90 via-sky-300/80 to-cyan-400/60"
                    aria-hidden
                  />
                ) : null}

                <div className="flex shrink-0 items-center justify-center self-center">
                  <PrizeIcon className={active ? "drop-shadow-[0_0_6px_rgba(250,250,250,0.35)]" : "opacity-90"} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                  <div
                    className={
                      active
                        ? "text-[13px] font-bold leading-tight text-white drop-shadow-sm"
                        : "text-[12px] font-semibold leading-tight text-cyan-50/95"
                    }
                  >
                    {tier.label}
                  </div>

                  <div className="relative h-5 w-full overflow-hidden rounded-md border border-red-900/40 bg-red-950/50 shadow-inner">
                    <div
                      className="absolute inset-0 opacity-95"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(-45deg, #7f1d1d 0px, #7f1d1d 5px, #991b1b 5px, #991b1b 10px)",
                      }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-700/85 to-emerald-600/50 transition-[width] duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex h-full items-center justify-end pr-1.5 text-[10px] font-bold tabular-nums tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]">
                      {drawn}/{safeTotal}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
