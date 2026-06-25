import * as THREE from "three";

import type { WheelParticipant } from "./types";

const W = 256;
const H = 320;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return ["—"];
  }
  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      lines.push(line);
      line = words[i];
      if (lines.length >= maxLines - 1) {
        break;
      }
    }
  }
  if (lines.length < maxLines && line) {
    lines.push(line);
  }
  return lines.slice(0, maxLines);
}

function brandLabel(): string {
  return process.env.NEXT_PUBLIC_WHEEL_BRAND ?? "VNSKY";
}

/**
 * Canvas texture for one participant card (teal glass style, similar to reference sphere UI).
 */
export function createParticipantCardTexture(
  participant: WheelParticipant,
  isWinner: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D unavailable");
  }

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  if (isWinner) {
    bg.addColorStop(0, "rgba(255, 190, 96, 0.94)");
    bg.addColorStop(1, "rgba(255, 130, 48, 0.92)");
  } else {
    bg.addColorStop(0, "rgba(55, 188, 198, 0.9)");
    bg.addColorStop(1, "rgba(22, 140, 155, 0.88)");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = isWinner ? "rgba(255, 235, 180, 0.95)" : "rgba(255, 255, 255, 0.42)";
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 17px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(brandLabel(), W / 2, 34);

  const cx = W / 2;
  const cy = 118;
  const r = 46;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillText(initials(participant.name), cx, cy + 11);

  ctx.font = "700 19px system-ui, sans-serif";
  const nameLines = wrapLines(ctx, participant.name, W - 28, 3);
  let y = 198;
  for (const line of nameLines) {
    ctx.fillText(line, W / 2, y);
    y += 24;
  }

  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(participant.code, W / 2, H - 34);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/**
 * Legacy-like card from product/: square cyan tile, company top,
 * name center, details bottom. Winner switches to light tile.
 */
export function createLegacyProductCardTexture(
  participant: WheelParticipant,
  isWinner: boolean,
  seed: number,
): THREE.CanvasTexture {
  const size = 300;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D unavailable");
  }

  const alpha = 0.25 + ((seed * 37) % 70) / 100;
  ctx.fillStyle = isWinner ? "rgba(255,255,255,0.82)" : `rgba(0,127,127,${alpha.toFixed(2)})`;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = isWinner ? "rgba(253,105,0,0.28)" : "rgba(127,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // Subtle cyan glow (similar to .element box-shadow).
  ctx.shadowColor = isWinner ? "rgba(25,42,86,0.55)" : "rgba(0,255,255,0.55)";
  ctx.shadowBlur = 16;
  ctx.strokeRect(6, 6, size - 12, size - 12);
  ctx.shadowBlur = 0;

  const topColor = isWinner ? "#192a56" : "rgba(127,255,255,0.75)";
  const textColor = isWinner ? "#192a56" : "rgba(0,255,255,0.95)";
  const detailColor = isWinner ? "#192a56" : "rgba(127,255,255,0.75)";

  ctx.textAlign = "center";
  ctx.fillStyle = topColor;
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(brandLabel(), size / 2, 42);

  ctx.fillStyle = textColor;
  ctx.font = "700 34px system-ui, sans-serif";
  const nameLines = wrapLines(ctx, participant.name, size - 34, 2);
  let y = 145;
  for (const line of nameLines) {
    ctx.fillText(line, size / 2, y);
    y += 38;
  }

  ctx.fillStyle = detailColor;
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.fillText(`${participant.code}`, size / 2, size - 54);
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillText(participant.id, size / 2, size - 28);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const WINNER_SHOWCASE_W = 768;
const WINNER_SHOWCASE_H = 1200;

/** Plain brown “back of card” for the first 90° of a Y-axis flop reveal. */
export function createWinnerFlopBackTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 800;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D unavailable");
  }
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#6b4528");
  g.addColorStop(0.45, "#4a3019");
  g.addColorStop(1, "#1f120a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, 40);
  ctx.lineTo(w / 2, h - 40);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export type WinnerShowcaseOptions = {
  /** When true, content is drawn mirrored so it reads correctly when the plane is rotated π around Y. */
  mirrored: boolean;
  /** Display string for prize line, e.g. "10,000,000 VNĐ" */
  prizeLine?: string;
};

/**
 * Portrait “gold frame / warm brown” winner card (reference-style layout).
 */
export function createWinnerShowcasePortraitTexture(
  participant: WheelParticipant,
  options: WinnerShowcaseOptions,
): THREE.CanvasTexture {
  const { mirrored, prizeLine = "10,000,000 VNĐ" } = options;
  const canvas = document.createElement("canvas");
  canvas.width = WINNER_SHOWCASE_W;
  canvas.height = WINNER_SHOWCASE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D unavailable");
  }

  ctx.save();
  if (mirrored) {
    ctx.translate(WINNER_SHOWCASE_W, 0);
    ctx.scale(-1, 1);
  }

  const pad = 36;
  const rCard = 28;
  const rw = WINNER_SHOWCASE_W - pad * 2;
  const rh = WINNER_SHOWCASE_H - pad * 2;

  ctx.beginPath();
  ctx.roundRect(pad, pad, rw, rh, rCard);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, 0, 0, WINNER_SHOWCASE_H);
  bg.addColorStop(0, "#4a3224");
  bg.addColorStop(0.35, "#352218");
  bg.addColorStop(1, "#120a06");
  ctx.fillStyle = bg;
  ctx.fillRect(pad, pad, rw, rh);

  ctx.beginPath();
  ctx.roundRect(pad, pad, rw, rh, rCard);
  ctx.shadowColor = "rgba(255, 200, 80, 0.55)";
  ctx.shadowBlur = 42;
  ctx.strokeStyle = "rgba(218, 165, 32, 0.95)";
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.shadowBlur = 26;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255, 236, 160, 0.9)";
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(120, 80, 20, 0.9)";
  ctx.stroke();

  const bannerY = pad + 52;
  const bannerH = 86;
  const bx = pad + 18;
  const bw = WINNER_SHOWCASE_W - pad * 2 - 36;
  const bgrad = ctx.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
  bgrad.addColorStop(0, "#1a0f0a");
  bgrad.addColorStop(1, "#0d0805");
  ctx.fillStyle = bgrad;
  ctx.beginPath();
  ctx.roundRect(bx, bannerY, bw, bannerH, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(218, 165, 32, 0.75)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fffaf0";
  ctx.font = "700 28px system-ui, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CHIẾN THẮNG TRONG CUỘC ĐUA!", WINNER_SHOWCASE_W / 2, bannerY + 56);

  const cx = WINNER_SHOWCASE_W / 2;
  const cy = bannerY + bannerH + 200;
  const r = 118;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 215, 120, 0.95)";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const ag = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, r);
  ag.addColorStop(0, "#6a4a38");
  ag.addColorStop(1, "#2a1810");
  ctx.fillStyle = ag;
  ctx.fill();

  ctx.fillStyle = "#ffe8c8";
  ctx.font = "700 52px system-ui, sans-serif";
  ctx.fillText(initials(participant.name), cx, cy + 18);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 42px system-ui, 'Segoe UI', sans-serif";
  const nameUpper = participant.name.toUpperCase();
  const nameLines = wrapLines(ctx, nameUpper, WINNER_SHOWCASE_W - pad * 4, 2);
  let ny = cy + r + 72;
  for (const line of nameLines) {
    ctx.fillText(line, cx, ny);
    ny += 52;
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, ny + 24);
  ctx.lineTo(bx + bw, ny + 24);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 248, 235, 0.92)";
  const digitsOnly = participant.code.replace(/\D/g, "");
  const codeFmt =
    digitsOnly.length > 0
      ? digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : participant.code;
  ctx.fillText(`MÃ SỐ DỰ THƯỞNG: ${codeFmt}`, cx, ny + 72);
  ctx.fillText(`QUÀ TẶNG: ${prizeLine}`, cx, ny + 124);

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const PRIZE_TIER_BADGE_W = 256;
const PRIZE_TIER_BADGE_H = 320;

/** Small “tier badge” card texture for floating 3D tier pickers inside the sphere. */
export function createPrizeTierBadgeTexture(
  title: string,
  quantity: number,
  slotsCaption: string,
): THREE.CanvasTexture {
  const w = PRIZE_TIER_BADGE_W;
  const h = PRIZE_TIER_BADGE_H;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D unavailable");
  }

  const pad = 14;
  const rCard = 18;
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, rCard);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#1e3a5f");
  bg.addColorStop(0.45, "#0f2744");
  bg.addColorStop(1, "#061220");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "rgba(218, 165, 32, 0.85)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 248, 230, 0.92)";
  ctx.font = "600 22px system-ui, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const titleY = pad + 18;
  const maxTitleW = w - pad * 2 - 16;
  wrapCanvasText(ctx, title, w / 2, titleY, maxTitleW, 22, 2);

  ctx.fillStyle = "rgba(255, 215, 120, 0.98)";
  ctx.font = "800 72px system-ui, Segoe UI, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(String(quantity), w / 2, h * 0.58);

  ctx.fillStyle = "rgba(200, 220, 255, 0.75)";
  ctx.font = "500 16px system-ui, Segoe UI, sans-serif";
  ctx.textBaseline = "bottom";
  ctx.fillText(slotsCaption, w / 2, h - pad - 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): void {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  const capped = lines.slice(0, maxLines);
  for (let i = 0; i < capped.length; i++) {
    ctx.fillText(capped[i], cx, y + i * lineHeight);
  }
}

export function disposeWinnerRevealTextures(pack: {
  brown: THREE.CanvasTexture;
  showcase: THREE.CanvasTexture;
  showcaseMirrored: THREE.CanvasTexture;
}): void {
  pack.brown.dispose();
  pack.showcase.dispose();
  pack.showcaseMirrored.dispose();
}

export function disposeCardTextures(textures: THREE.CanvasTexture[]): void {
  for (const tex of textures) {
    tex.dispose();
  }
}

/** Vertical gradient for a large inverted sphere (daylight sky). */
export function createSkyGradientTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D unavailable");
  }
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#5eb8ff");
  g.addColorStop(0.42, "#9fd6ff");
  g.addColorStop(0.72, "#d2efff");
  g.addColorStop(1, "#f0f9ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
