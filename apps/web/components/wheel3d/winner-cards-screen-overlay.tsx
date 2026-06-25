"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

import { createWinnerShowcasePortraitTexture, disposeCardTextures } from "@/lib/wheel3d/card-texture";
import type { WheelParticipant } from "@/lib/wheel3d/types";

/** Base width (px) before scale — detached clone matches this footprint at scale 1 at sync point. */
const CARD_DISPLAY_W = 120;

/** Horizontal gap between cards (centers spaced by visual width + gap). */
const CARD_GAP = 40;

/** Scale at end of fly (applied together with {@link rowFitScale} so the row fits the frame). */
export const WINNER_CARD_FINAL_SCALE = 1.65;

/** DOM fly + flip duration — keep in sync with tier step timer in product sphere. */
export const WINNER_CARD_FLY_DURATION_MS = 2600;

function computeFinalCenters(
  n: number,
  vw: number,
  vh: number,
  cardW: number,
  gapPx: number,
): { left: number; top: number }[] {
  if (n <= 0 || vw <= 0) {
    return [];
  }
  const totalW = n * cardW + (n - 1) * gapPx;
  const left0 = (vw - totalW) / 2;
  const top = vh / 2;
  return Array.from({ length: n }, (_, i) => ({
    left: left0 + i * (cardW + gapPx) + cardW / 2,
    top,
  }));
}

export type WinnerOverlayEntry = {
  slot: number;
  start: { x: number; y: number };
  freezeEnter: boolean;
};

type WinnerCardsScreenOverlayProps = {
  /** Khung 3D (`relative` + `overflow-hidden`) để thẻ chỉ hiển thị trong vùng này. */
  boundsRef: RefObject<HTMLElement | null>;
  entries: WinnerOverlayEntry[];
  slotParticipants: WheelParticipant[];
  layoutSlotCount?: number;
};

export function WinnerCardsScreenOverlay({
  boundsRef,
  entries,
  slotParticipants,
  layoutSlotCount,
}: WinnerCardsScreenOverlayProps) {
  /** Bounding rect của khung 3D (viewport px cho sync; w/h cho bố cục cục bộ). */
  const [frame, setFrame] = useState({ left: 0, top: 0, w: 0, h: 0 });

  useEffect(() => {
    const el = boundsRef.current;
    if (!el) {
      return;
    }

    const measure = () => {
      const r = el.getBoundingClientRect();
      setFrame({ left: r.left, top: r.top, w: r.width, h: r.height });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [boundsRef]);

  const textures = useMemo(() => {
    const list: THREE.CanvasTexture[] = [];
    for (const { slot } of entries) {
      const p = slotParticipants[slot];
      if (!p) {
        continue;
      }
      list.push(createWinnerShowcasePortraitTexture(p, { mirrored: false }));
    }
    return list;
  }, [entries, slotParticipants]);

  useEffect(() => {
    return () => {
      disposeCardTextures(textures);
    };
  }, [textures]);

  const layoutN = layoutSlotCount ?? entries.length;

  /** Shrink the whole row so visual width + gaps never exceed the frame (no overlap). */
  const rowFitScale = useMemo(() => {
    const baseVisualW = CARD_DISPLAY_W * WINNER_CARD_FINAL_SCALE;
    if (layoutN <= 0 || frame.w <= 0) {
      return 1;
    }
    const natural = layoutN * baseVisualW + Math.max(0, layoutN - 1) * CARD_GAP;
    const maxW = frame.w * 0.92;
    return natural > maxW ? maxW / natural : 1;
  }, [layoutN, frame.w]);

  const finals = useMemo(() => {
    const slotW = CARD_DISPLAY_W * WINNER_CARD_FINAL_SCALE * rowFitScale;
    const gapPx = CARD_GAP * rowFitScale;
    return computeFinalCenters(layoutN, frame.w, frame.h, slotW, gapPx);
  }, [layoutN, frame.w, frame.h, rowFitScale]);

  const displayScale = WINNER_CARD_FINAL_SCALE * rowFitScale;

  const imageDataUrls = useMemo(
    () =>
      textures.map((tex) => {
        const canvas = tex.image as HTMLCanvasElement | undefined;
        if (canvas && typeof canvas.toDataURL === "function") {
          return canvas.toDataURL("image/png");
        }
        return "";
      }),
    [textures],
  );

  const ready =
    frame.w > 0 &&
    frame.h > 0 &&
    finals.length >= entries.length &&
    textures.length === entries.length &&
    imageDataUrls.length === entries.length;

  if (!ready || entries.length === 0) {
    return null;
  }

  const flyTransition = {
    duration: WINNER_CARD_FLY_DURATION_MS / 1000,
    ease: [0.18, 1, 0.32, 1] as const,
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[42] isolate overflow-hidden"
      style={{ perspective: 1600 }}
      aria-hidden
    >
      {entries.map((entry, i) => {
        const { slot, start, freezeEnter } = entry;
        const src = imageDataUrls[i] ?? "";
        const end = finals[i];
        if (!end || i >= finals.length) {
          return null;
        }

        const localStartX = start.x - frame.left;
        const localStartY = start.y - frame.top;

        if (freezeEnter) {
          return (
            <motion.div
              key={`overlay-card-${slot}`}
              className="absolute overflow-hidden rounded-xl shadow-[0_28px_80px_rgba(0,0,0,0.72)] ring-2 ring-amber-400/50 [transform-style:preserve-3d]"
              style={{
                width: CARD_DISPLAY_W,
                left: end.left,
                top: end.top,
                x: "-50%",
                y: "-50%",
                backfaceVisibility: "hidden",
              }}
              initial={false}
              animate={{
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: displayScale,
                opacity: 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="block h-auto w-full select-none"
                draggable={false}
              />
            </motion.div>
          );
        }

        return (
          <motion.div
            key={`overlay-card-${slot}`}
            className="absolute overflow-hidden rounded-xl shadow-[0_28px_80px_rgba(0,0,0,0.72)] ring-2 ring-amber-400/50 [transform-style:preserve-3d]"
            style={{
              width: CARD_DISPLAY_W,
              backfaceVisibility: "hidden",
            }}
            initial={{
              left: localStartX,
              top: localStartY,
              x: "-50%",
              y: "-50%",
              rotateX: 0,
              rotateY: 180,
              rotateZ: 0,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              scale: displayScale,
              opacity: 1,
            }}
            transition={flyTransition}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
