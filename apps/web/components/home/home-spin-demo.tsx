"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const HomeSpinSphere = dynamic(
  () => import("./home-spin-sphere").then((m) => ({ default: m.HomeSpinSphere })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="size-16 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
      </div>
    ),
  },
);

const MAX = 10;
const DEFAULTS = ["An", "Bình", "Chi", "Dũng", "Em", "Phong"];

type Messages = {
  badge: string;
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  addButton: string;
  spinButton: string;
  spinningButton: string;
  resetButton: string;
  winnerLabel: string;
  maxReached: string;
  emptyHint: string;
  dragHint: string;
  participantsCount: string;
};

export function HomeSpinDemo({ messages }: { messages: Messages }) {
  const [names, setNames] = useState<string[]>(DEFAULTS);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const pickedRef = useRef<number | null>(null);

  function addName() {
    const trimmed = input.trim();
    if (!trimmed || names.length >= MAX) return;
    if (names.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return;
    setNames((prev) => [...prev, trimmed]);
    setInput("");
    setWinnerId(null);
  }

  function removeName(i: number) {
    setNames((prev) => prev.filter((_, idx) => idx !== i));
    setWinnerId(null);
  }

  function handleSpin() {
    if (names.length < 2 || spinning) return;
    // Pick winner now but reveal after spin animation
    pickedRef.current = Math.floor(Math.random() * names.length);
    setWinnerId(null);
    setSpinning(true);
  }

  function handleSpinDone() {
    setSpinning(false);
    setWinnerId(pickedRef.current);
  }

  function handleReset() {
    setWinnerId(null);
    pickedRef.current = null;
  }

  const canSpin = names.length >= 1 && !spinning;
  const hasWinner = winnerId !== null;

  return (
    <section className="relative overflow-hidden bg-[#02101c] py-20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 md:px-6 lg:grid-cols-5">

        {/* ── LEFT: Controls ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Badge */}
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {messages.badge}
          </span>

          <div>
            <h2 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
              {messages.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{messages.subtitle}</p>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addName()}
              placeholder={messages.inputPlaceholder}
              maxLength={30}
              disabled={names.length >= MAX}
              className="h-10 flex-1 rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-500/60 focus:bg-white/12 transition-colors disabled:opacity-40"
            />
            <button
              type="button"
              onClick={addName}
              disabled={!input.trim() || names.length >= MAX}
              className="h-10 rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-40"
            >
              {messages.addButton}
            </button>
          </div>

          {/* Participant chips */}
          <div className="flex flex-wrap gap-2">
            {names.map((name, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all ${
                  winnerId === i
                    ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/50"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {winnerId === i && "🏆 "}
                {name}
                {!spinning && (
                  <button
                    type="button"
                    onClick={() => removeName(i)}
                    className="ml-0.5 rounded-full text-white/40 hover:text-white/80 transition-colors"
                    aria-label={`Remove ${name}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {names.length >= MAX && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">
                {messages.maxReached}
              </span>
            )}
          </div>

          <p className="text-xs text-white/30">
            {names.length}/{MAX} {messages.participantsCount}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!hasWinner ? (
              <button
                type="button"
                onClick={handleSpin}
                disabled={!canSpin}
                className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-[0_4px_0_0_rgb(180_110_20)] transition-all hover:bg-secondary/90 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {spinning ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {messages.spinningButton}
                  </>
                ) : (
                  <>🎲 {messages.spinButton}</>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                {messages.resetButton}
              </button>
            )}

            {names.length < 2 && (
              <p className="self-center text-xs text-white/40">{messages.emptyHint}</p>
            )}
          </div>

          {/* Winner announcement */}
          {hasWinner && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70">
                {messages.winnerLabel}
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-300">
                🏆 {names[winnerId!]}
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: 3D Sphere ── */}
        <div className="flex flex-col items-center lg:col-span-3">
          <div className="h-105 w-full max-w-140 lg:h-130">
            <HomeSpinSphere
              names={names}
              spinning={spinning}
              winnerId={winnerId}
              onSpinDone={handleSpinDone}
            />
          </div>
          <p className="mt-2 text-center text-xs text-white/30">{messages.dragHint}</p>
        </div>
      </div>
    </section>
  );
}
