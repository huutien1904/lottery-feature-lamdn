"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Button } from "@/components/ui/button";

import { useWheelData } from "./use-wheel-data";
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
  const colGap = 0.34;
  const rowGap = 0.42;
  const xOffset = ((cols - 1) * colGap) / 2;
  const yOffset = ((rows - 1) * rowGap) / 2;

  return Array.from({ length: count }).map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return new THREE.Vector3(col * colGap - xOffset, yOffset - row * rowGap, 0);
  });
}

function buildSphereTargets(count: number) {
  return Array.from({ length: count }).map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const radius = 3.9;
    return new THREE.Vector3(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.cos(phi),
      radius * Math.sin(theta) * Math.sin(phi),
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

function CardsCloud({
  count,
  mode,
  spinning,
  winnerIndex,
  maxSpinVelocity,
  phase,
}: {
  count: number;
  mode: WheelMode;
  spinning: boolean;
  winnerIndex: number | null;
  maxSpinVelocity: number;
  phase: WheelMotionPhase;
}) {
  const { camera } = useThree();
  const cloudRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<Array<THREE.Mesh | null>>([]);
  const spinVelocityRef = useRef(0);
  const outwardLookAtTarget = useMemo(() => new THREE.Vector3(), []);
  const revealCameraTarget = useMemo(() => new THREE.Vector3(0, 0, 6.7), []);
  const spinCameraTarget = useMemo(() => new THREE.Vector3(0, 0.35, 7.9), []);
  const idleCameraTarget = useMemo(() => new THREE.Vector3(0, 0, 8.5), []);
  const tableTargets = useMemo(() => buildTableTargets(count), [count]);
  const sphereTargets = useMemo(() => buildSphereTargets(count), [count]);
  const winnerTargets = useMemo(
    () => sphereTargets.map((point, index) => (index === winnerIndex ? new THREE.Vector3(0, 0, 3.4) : point)),
    [sphereTargets, winnerIndex],
  );
  const points = useMemo(
    () => tableTargets.map((item) => item.clone().add(new THREE.Vector3(0, 0, 0))),
    [tableTargets],
  );

  useFrame((_, delta) => {
    const speed = Math.min(1, delta * 2.15);
    const targets = mode === "sphere" && winnerIndex !== null ? winnerTargets : mode === "sphere" ? sphereTargets : tableTargets;

    if (spinning) {
      // Spin-up easing similar to legacy wheel behavior.
      spinVelocityRef.current = Math.min(
        spinVelocityRef.current + delta * 1.05,
        maxSpinVelocity,
      );
    } else {
      // Spin-down is intentionally slower to keep the reveal dramatic.
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
        // Match the legacy wheel: cards face outward from sphere center.
        outwardLookAtTarget.copy(points[i]).multiplyScalar(2);
        mesh.lookAt(outwardLookAtTarget);
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
      <color attach="background" args={["#051329"]} />
      <fog attach="fog" args={["#051329", 8.5, 17]} />
      <ambientLight intensity={0.78} />
      <directionalLight position={[4, 5, 4]} intensity={0.95} />
      <pointLight position={[-3, -2, -2]} intensity={0.3} />
      <pointLight position={[0, 0, 2]} intensity={0.22} color="#f7b120" />

      <mesh>
        <sphereGeometry args={[1.65, 36, 36]} />
        <meshStandardMaterial color="#0f2950" transparent opacity={0.2} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.68, 0.03, 20, 72]} />
        <meshStandardMaterial color="#f7b120" emissive="#f7b120" emissiveIntensity={0.12} />
      </mesh>

      <group ref={cloudRef}>
        {points.map((position, index) => (
          <mesh
            key={index}
            position={position}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            <boxGeometry args={[0.2, 0.26, 0.03]} />
            <meshStandardMaterial
              color={
                winnerIndex === index ? "#ff8a1f" : index % 7 === 0 ? "#f7b120" : "#dfe7ff"
              }
              emissive={winnerIndex === index ? "#ff8a1f" : "#000000"}
              emissiveIntensity={winnerIndex === index ? 0.55 : 0}
              roughness={winnerIndex === index ? 0.2 : 0.35}
              metalness={winnerIndex === index ? 0.6 : 0.2}
            />
          </mesh>
        ))}
      </group>

      <OrbitControls enablePan={false} maxDistance={11} minDistance={4} />
    </>
  );
}

export function WheelCanvas({ className, messages }: WheelCanvasProps) {
  const [mode, setMode] = useState<WheelMode>("table");
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
    setMode("table");
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
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <CardsCloud
            count={renderCardCount}
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

