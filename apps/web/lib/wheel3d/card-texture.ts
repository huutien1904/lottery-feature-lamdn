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
