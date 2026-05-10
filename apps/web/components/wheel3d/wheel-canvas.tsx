"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Button } from "@/components/ui/button";

import { useWheelData } from "./use-wheel-data";
import {
  createParticipantCardTexture,
  createSkyGradientTexture,
  disposeCardTextures,
} from "@/lib/wheel3d/card-texture";
import type { WheelParticipant } from "@/lib/wheel3d/types";

type WheelCanvasProps = {
  className?: string;
  messages: {
    modeTable: string;
    modeSphere: string;
    spin: string;
    spinning: string;
    participantsLabel: string;
    prizesLabel: string;
    sourceApi: string;
    sourceMock: string;
    winnerLabel: string;
    noWinner: string;
    currentPrizeLabel: string;
    remainingLabel: string;
    sessionIdle: string;
    sessionRunning: string;
    sessionCompleted: string;
    redraw: string;
    reset: string;
    allPrizesDone: string;
    webglUnsupportedTitle: string;
    webglUnsupportedDescription: string;
    fallbackAction: string;
  };
};

type WheelMode = "table" | "sphere";
type WheelMotionPhase = "idle" | "spinning" | "reveal";

type SpinProfile = {
  durationMs: number;
  maxVelocity: number;
};

function useAdaptiveCardCount(totalParticipants: number) {
  const [maxCards, setMaxCards] = useState(180);

  useEffect(() => {
    function updateLimit() {
      const width = window.innerWidth;
      if (width < 640) {
        setMaxCards(120);
        return;
      }
      if (width < 1024) {
        setMaxCards(180);
        return;
      }
      setMaxCards(300);
    }

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  return Math.max(90, Math.min(totalParticipants || 120, maxCards));
}

function detectWebGlReady() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function buildTableTargets(count: number) {
  const cols = 18;
  const rows = Math.ceil(count / cols);
  const colGap = 0.26;
  const rowGap = 0.32;
  const xOffset = ((cols - 1) * colGap) / 2;
  const yOffset = ((rows - 1) * rowGap) / 2;

  return Array.from({ length: count }).map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return new THREE.Vector3(col * colGap - xOffset, yOffset - row * rowGap, 0);
  });
}

/** Latitude / longitude grid on a sphere (reference-style “globe of cards”). */
function buildSphereGridTargets(count: number, radius: number) {
  // More columns → smaller Δθ; slightly narrower φ-band → rows sit closer on the shell.
  const cols = Math.max(14, Math.round(Math.sqrt(count * 1.58)));
  const rows = Math.ceil(count / cols);
  const phiMin = 0.13 * Math.PI;
  const phiMax = 0.87 * Math.PI;
  const colDenom = Math.max(1, cols - 1);
  const rowDenom = Math.max(1, rows - 1);

  return Array.from({ length: count }).map((_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const u = cols === 1 ? 0.5 : col / colDenom;
    const v = rows === 1 ? 0.5 : row / rowDenom;
    const phi = phiMin + (phiMax - phiMin) * v;
    const theta = u * Math.PI * 2;
    const sinPhi = Math.sin(phi);
    return new THREE.Vector3(
      radius * sinPhi * Math.cos(theta),
      radius * Math.cos(phi),
      radius * sinPhi * Math.sin(theta),
    );
  });
}

function resolveSpinProfile(prize: { quantity: number } | undefined): SpinProfile {
  if (!prize) {
    return { durationMs: 4200, maxVelocity: 2.8 };
  }
  if (prize.quantity <= 1) {
    return { durationMs: 5600, maxVelocity: 3.35 };
  }
  if (prize.quantity <= 3) {
    return { durationMs: 5000, maxVelocity: 3.05 };
  }
  return { durationMs: 4200, maxVelocity: 2.8 };
}

/** Smaller tiles + denser grid above = cards read as “tighter” on the sphere. */
const CARD_PLANE_W = 0.27;
const CARD_PLANE_H = 0.3375;

/** Larger radius = bigger globe; camera distances tuned so it still fills the frame. */
const SPHERE_RADIUS = 5.55;
const WINNER_PULL_Z = SPHERE_RADIUS * 0.87;

function CardsCloud({
  cards,
  mode,
  spinning,
  winnerIndex,
  maxSpinVelocity,
  phase,
}: {
  cards: WheelParticipant[];
  mode: WheelMode;
  spinning: boolean;
  winnerIndex: number | null;
  maxSpinVelocity: number;
  phase: WheelMotionPhase;
}) {
  const count = cards.length;
  const { camera } = useThree();
  const cloudRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<Array<THREE.Mesh | null>>([]);
  const spinVelocityRef = useRef(0);
  const zAxis = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const revealCameraTarget = useMemo(() => new THREE.Vector3(0, 0, 8.35), []);
  const spinCameraTarget = useMemo(() => new THREE.Vector3(0, 0.35, 9.72), []);
  const idleCameraTarget = useMemo(() => new THREE.Vector3(0, 0, 10.5), []);
  const tableTargets = useMemo(() => buildTableTargets(count), [count]);
  const sphereTargets = useMemo(() => buildSphereGridTargets(count, SPHERE_RADIUS), [count]);
  const winnerTargets = useMemo(
    () =>
      sphereTargets.map((point, index) =>
        index === winnerIndex ? new THREE.Vector3(0, 0, WINNER_PULL_Z) : point,
      ),
    [sphereTargets, winnerIndex],
  );
  const points = useMemo(() => tableTargets.map((item) => item.clone()), [tableTargets]);

  const textures = useMemo(() => {
    return cards.map((participant, index) =>
      createParticipantCardTexture(participant, winnerIndex === index),
    );
  }, [cards, winnerIndex]);

  const skyTexture = useMemo(() => createSkyGradientTexture(), []);

  useEffect(() => {
    return () => {
      disposeCardTextures(textures);
      skyTexture.dispose();
    };
  }, [textures, skyTexture]);

  useFrame((_, delta) => {
    const speed = Math.min(1, delta * 2.15);
    const targets = mode === "sphere" && winnerIndex !== null ? winnerTargets : mode === "sphere" ? sphereTargets : tableTargets;

    if (spinning) {
      spinVelocityRef.current = Math.min(
        spinVelocityRef.current + delta * 1.05,
        maxSpinVelocity,
      );
    } else {
      spinVelocityRef.current = Math.max(spinVelocityRef.current - delta * 0.82, 0);
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y += spinVelocityRef.current * delta;
    }

    for (let i = 0; i < points.length; i++) {
      points[i].lerp(targets[i], speed);
      const mesh = cardRefs.current[i];
      if (!mesh) {
        continue;
      }

      mesh.position.copy(points[i]);
      if (mode === "sphere") {
        const normal = points[i].clone().normalize();
        mesh.quaternion.setFromUnitVectors(zAxis, normal);
      } else {
        mesh.rotation.set(0, 0, 0);
      }
    }

    const cameraTarget =
      phase === "spinning"
        ? spinCameraTarget
        : phase === "reveal"
          ? revealCameraTarget
          : idleCameraTarget;
    camera.position.lerp(cameraTarget, Math.min(1, delta * 1.6));
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#8fd0ff"]} />
      <fog attach="fog" args={["#b8e2ff", 14, 58]} />

      <mesh renderOrder={-100}>
        <sphereGeometry args={[140, 48, 48]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <ambientLight intensity={1.05} />
      <directionalLight position={[7, 11, 6]} intensity={1.12} color="#fffaf3" />
      <directionalLight position={[-5, 4, -4]} intensity={0.42} color="#d8ecff" />

      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS * 0.37, 28, 28]} />
        <meshStandardMaterial color="#5a9fd4" transparent opacity={0.07} depthWrite={false} />
      </mesh>

      <group ref={cloudRef}>
        {points.map((position, index) => (
          <mesh
            key={`${cards[index]?.id ?? index}-${index}`}
            position={position}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            <planeGeometry args={[CARD_PLANE_W, CARD_PLANE_H]} />
            <meshStandardMaterial
              map={textures[index]}
              transparent
              opacity={0.96}
              roughness={0.4}
              metalness={0.06}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <OrbitControls enablePan={false} maxDistance={17} minDistance={6} />
    </>
  );
}

export function WheelCanvas({ className, messages }: WheelCanvasProps) {
  const [mode, setMode] = useState<WheelMode>("sphere");
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [winnersByPrize, setWinnersByPrize] = useState<Record<string, string[]>>({});
  const [lastDrawnPrizeId, setLastDrawnPrizeId] = useState<string | null>(null);
  const [lastWinnerId, setLastWinnerId] = useState<string | null>(null);
  const [isWebGlReady] = useState<boolean>(detectWebGlReady);
  const spinTimeoutRef = useRef<number | null>(null);
  const { data } = useWheelData();
  const participantCount = data?.participants.length ?? 0;
  const renderCardCount = useAdaptiveCardCount(participantCount);
  const prizeCount = data?.prizes.length ?? 0;
  const sourceText = data?.source === "api" ? messages.sourceApi : messages.sourceMock;
  const participants = useMemo(() => data?.participants ?? [], [data?.participants]);
  const prizes = useMemo(() => data?.prizes ?? [], [data?.prizes]);
  const displayCards = useMemo(() => {
    const slice = participants.slice(0, renderCardCount);
    const out: WheelParticipant[] = [...slice];
    while (out.length < renderCardCount) {
      out.push({
        id: `placeholder-${out.length}`,
        name: "—",
        code: "—",
      });
    }
    return out;
  }, [participants, renderCardCount]);
  const winner = winnerIndex !== null ? participants[winnerIndex] : null;
  const currentPrize = prizes[currentPrizeIndex];
  const spinProfile = useMemo(() => resolveSpinProfile(currentPrize), [currentPrize]);
  const currentPrizeWinners = currentPrize ? winnersByPrize[currentPrize.id] ?? [] : [];
  const currentPrizeRemaining = currentPrize
    ? Math.max(0, currentPrize.quantity - currentPrizeWinners.length)
    : 0;
  const isAllPrizesDone =
    prizes.length > 0 &&
    prizes.every((prize) => (winnersByPrize[prize.id]?.length ?? 0) >= prize.quantity);
  const sessionStatus = spinning
    ? messages.sessionRunning
    : isAllPrizesDone
      ? messages.sessionCompleted
      : messages.sessionIdle;
  const motionPhase: WheelMotionPhase = spinning
    ? "spinning"
    : winnerIndex !== null
      ? "reveal"
      : "idle";

  const winnerHistory = useMemo(() => {
    const mapById = new Map<string, WheelParticipant>();
    participants.forEach((participant) => mapById.set(participant.id, participant));
    return prizes.flatMap((prize) => {
      const winnerIds = winnersByPrize[prize.id] ?? [];
      return winnerIds
        .map((winnerId) => mapById.get(winnerId))
        .filter((item): item is WheelParticipant => Boolean(item))
        .map((item) => `${prize.title}: ${item.name}`);
    });
  }, [participants, prizes, winnersByPrize]);
  const showHistory = winnerHistory.length > 0;

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  function handleFallbackAction() {
    window.location.reload();
  }

  function runSpin() {
    if (participantCount === 0 || spinning || !currentPrize || isAllPrizesDone) {
      return;
    }

    const excluded = new Set(
      Object.values(winnersByPrize).flatMap((winnerIds) => winnerIds),
    );
    const candidates = participants.filter((item) => !excluded.has(item.id));
    if (candidates.length === 0) {
      return;
    }

    setMode("sphere");
    setWinnerIndex(null);
    setSpinning(true);

    const durationMsFromProfile = spinProfile.durationMs;
    spinTimeoutRef.current = window.setTimeout(() => {
      const pickedCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      const pickedIndex = participants.findIndex((item) => item.id === pickedCandidate.id);
      setWinnerIndex(pickedIndex >= 0 ? pickedIndex : null);
      setLastDrawnPrizeId(currentPrize.id);
      setLastWinnerId(pickedCandidate.id);
      setWinnersByPrize((prev) => {
        const next = { ...prev };
        const current = next[currentPrize.id] ?? [];
        next[currentPrize.id] = [...current, pickedCandidate.id];
        return next;
      });

      const nextCount = currentPrizeWinners.length + 1;
      if (nextCount >= currentPrize.quantity) {
        setCurrentPrizeIndex((prev) => Math.min(prev + 1, Math.max(0, prizes.length - 1)));
      }
      setSpinning(false);
      spinTimeoutRef.current = null;
    }, durationMsFromProfile);
  }

  function runRedraw() {
    if (!lastDrawnPrizeId || !lastWinnerId || spinning || participantCount === 0) {
      return;
    }

    const allCurrentWinners = new Set(
      Object.values(winnersByPrize).flatMap((winnerIds) => winnerIds),
    );
    allCurrentWinners.delete(lastWinnerId);
    const candidates = participants.filter((item) => !allCurrentWinners.has(item.id));
    if (candidates.length === 0) {
      return;
    }

    const pickedCandidate = candidates[Math.floor(Math.random() * candidates.length)];
    const pickedIndex = participants.findIndex((item) => item.id === pickedCandidate.id);
    setWinnerIndex(pickedIndex >= 0 ? pickedIndex : null);
    setLastWinnerId(pickedCandidate.id);
    setWinnersByPrize((prev) => {
      const next = { ...prev };
      const current = [...(next[lastDrawnPrizeId] ?? [])];
      const removeIndex = current.findIndex((item) => item === lastWinnerId);
      if (removeIndex >= 0) {
        current.splice(removeIndex, 1, pickedCandidate.id);
      } else {
        current.push(pickedCandidate.id);
      }
      next[lastDrawnPrizeId] = current;
      return next;
    });
  }

  function resetSession() {
    setSpinning(false);
    setWinnerIndex(null);
    setCurrentPrizeIndex(0);
    setWinnersByPrize({});
    setLastDrawnPrizeId(null);
    setLastWinnerId(null);
    setMode("sphere");
  }

  return (
    <div className={className}>
      <div className="grid gap-3 border-b border-border bg-background/90 p-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "table" ? "default" : "outline"}
              onClick={() => setMode("table")}
            >
              {messages.modeTable}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "sphere" ? "default" : "outline"}
              onClick={() => setMode("sphere")}
            >
              {messages.modeSphere}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={runSpin}
              disabled={spinning}
              className="shadow-[0_3px_0_0_rgb(204_134_42)]"
            >
              {spinning ? messages.spinning : messages.spin}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={runRedraw}
              disabled={spinning || !lastDrawnPrizeId || !lastWinnerId}
            >
              {messages.redraw}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={resetSession}>
              {messages.reset}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
              {messages.participantsLabel}: {participantCount}
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
              {messages.prizesLabel}: {prizeCount}
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">{sourceText}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-card-foreground md:min-w-[260px]">
          <div className="font-semibold">
            {messages.currentPrizeLabel}: {currentPrize?.title ?? "-"}
          </div>
          <div className="mt-1 text-muted-foreground">
            {messages.remainingLabel}: {currentPrize ? currentPrizeRemaining : "-"} · {sessionStatus}
            {isAllPrizesDone ? ` · ${messages.allPrizesDone}` : ""}
          </div>
        </div>

        <div className="w-full text-xs font-medium text-foreground md:col-span-2">
          {messages.winnerLabel}: {winner ? `${winner.name} (${winner.code})` : messages.noWinner}
        </div>
        {showHistory ? (
          <div className="w-full text-xs text-muted-foreground md:col-span-2">
            {winnerHistory.slice(-4).join(" · ")}
          </div>
        ) : null}
      </div>
      {!isWebGlReady ? (
        <div className="flex h-[420px] items-center justify-center p-6 md:h-[560px]">
          <div className="max-w-lg rounded-xl border border-border bg-card p-5 text-center">
            <h3 className="text-base font-semibold text-card-foreground">
              {messages.webglUnsupportedTitle}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {messages.webglUnsupportedDescription}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleFallbackAction}
            >
              {messages.fallbackAction}
            </Button>
          </div>
        </div>
      ) : (
        <Canvas
          camera={{ position: [0, 0, 10.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <CardsCloud
            cards={displayCards}
            mode={mode}
            spinning={spinning}
            winnerIndex={winnerIndex}
            maxSpinVelocity={spinProfile.maxVelocity}
            phase={motionPhase}
          />
        </Canvas>
      )}
    </div>
  );
}

