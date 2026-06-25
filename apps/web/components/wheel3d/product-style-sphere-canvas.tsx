"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Button } from "@/components/ui/button";
import { PrizeTierProgressStack } from "@/components/wheel3d/prize-tier-progress-stack";
import {
  WINNER_CARD_FLY_DURATION_MS,
  WinnerCardsScreenOverlay,
  type WinnerOverlayEntry,
} from "@/components/wheel3d/winner-cards-screen-overlay";
import {
  createLegacyProductCardTexture,
  disposeCardTextures,
} from "@/lib/wheel3d/card-texture";
import { getProductSphereFakeParticipants } from "@/lib/wheel3d/product-sphere-fake-cards";
import {
  PRODUCT_TOTAL_CARDS,
  buildProductSphereTargets,
  buildProductTableTargets,
  productOutwardLookAt,
} from "@/lib/wheel3d/product-sphere-layout";
import { cn } from "@/lib/utils";
import type { WheelParticipant } from "@/lib/wheel3d/types";

/**
 * OrbitControls zoom limits (Three.js **distance** camera ↔ orbit target, đơn vị scene).
 * - **minDistance**: zoom **in** tối đa (không cho gần hơn) → số càng **nhỏ** càng nhìn **to** quả cầu.
 * - **maxDistance**: zoom **out** tối đa → số càng **lớn** càng nhìn **xa/thu nhỏ** cầu.
 * Mặc định tương ứng scroll: gần nhất ~5, xa nhất ~60 (camera mặc định z≈30).
 */
export const DEFAULT_ORBIT_MIN_DISTANCE = 5;
export const DEFAULT_ORBIT_MAX_DISTANCE = 60;

type ProductStyleSphereCanvasProps = {
  className?: string;
  /** Gần nhất khi scroll zoom (mặc định {@link DEFAULT_ORBIT_MIN_DISTANCE}). */
  orbitMinDistance?: number;
  /** Xa nhất khi scroll zoom (mặc định {@link DEFAULT_ORBIT_MAX_DISTANCE}). */
  orbitMaxDistance?: number;
  messages: {
    modeTable: string;
    modeSphere: string;
    hint: string;
    spin: string;
    spinning: string;
    resetDraw: string;
    winnerLabel: string;
    noWinner: string;
    participantsCount: string;
    winnerOverlayBadge: string;
    winnerOverlayIdLabel: string;
    demoCardsNote: string;
    prizeTierFirst: string;
    prizeTierSecond: string;
    prizeTierThird: string;
    prizeTierSlotsLabel: string;
    prizeTierHint: string;
    prizePeopleUnit: string;
    revealPause: string;
    revealResume: string;
    viewAllResults: string;
    resultsSummaryTitle: string;
    resultsSummaryClose: string;
    continueNextTier: string;
    expandArena: string;
    collapseArena: string;
  };
};

type LayoutMode = "table" | "sphere";

const SPIN_DURATION_MS = 4800;
const SHOW_CARD_DURATION_MS = 4200;
/** First portion of reveal (0–1): ease-out cloud Y so the winner slot faces the camera. */
const SHOWCARD_CLOUD_ALIGN_RATIO = 0.22;
/** Per winner: align sphere + dim others, then one card flies to DOM (see {@link WINNER_CARD_FLY_DURATION_MS}). */
const PER_CARD_ALIGN_MS = SHOW_CARD_DURATION_MS * SHOWCARD_CLOUD_ALIGN_RATIO;
/** Non-winner cards fade toward this opacity (WebGL has no per-mesh CSS blur; opacity ≈ “mờ”). */
const SHOWCARD_OTHERS_OPACITY = 0.12;

const CARD_BOX_WIDTH = 0.24;
const CARD_BOX_HEIGHT = 0.24;
const PLANE_FACE_INSET = 0.93;

type PrizeTierId = "first" | "second" | "third";

/** Spin order: third → second → first (matches typical ceremony flow). */
const SPIN_TIER_SEQUENCE: PrizeTierId[] = ["third", "second", "first"];

/** Fixed summary panel: nhất → nhì → ba (reading order). */
const PRIZE_SUMMARY_DISPLAY_ORDER: PrizeTierId[] = ["first", "second", "third"];

const PRIZE_TIER_ORDER: Array<{ id: PrizeTierId; quantity: number }> = [
  { id: "first", quantity: 3 },
  { id: "second", quantity: 4 },
  { id: "third", quantity: 5 },
];

function prizeTierLabel(id: PrizeTierId, m: ProductStyleSphereCanvasProps["messages"]): string {
  if (id === "first") {
    return m.prizeTierFirst;
  }
  if (id === "second") {
    return m.prizeTierSecond;
  }
  return m.prizeTierThird;
}

function pickDistinctSlotsExcluding(
  count: number,
  maxExclusive: number,
  exclude: ReadonlySet<number>,
): number[] {
  const set = new Set<number>();
  let guard = 0;
  const maxGuard = maxExclusive * 8;
  while (set.size < count && guard < maxGuard) {
    guard++;
    const x = Math.floor(Math.random() * maxExclusive);
    if (!exclude.has(x)) {
      set.add(x);
    }
  }
  if (set.size < count) {
    for (let x = 0; x < maxExclusive && set.size < count; x++) {
      if (!exclude.has(x)) {
        set.add(x);
      }
    }
  }
  return [...set];
}

/** CSS-like ease-out (cubic); smooth for showcard pop / dim (Framer-style without DOM driver). */
function easeOutCubic(t: number): number {
  const x = THREE.MathUtils.clamp(t, 0, 1);
  return 1 - (1 - x) ** 3;
}

/**
 * Extra `cloud.rotation.y` so the winner’s radial (from origin through their slot) lines up with
 * the camera direction in the XZ plane — “dừng cầu” với thẻ mục tiêu trực diện camera.
 */
function cloudYRotationDeltaToFaceCamera(sphereSlot: THREE.Vector3, cameraPosition: THREE.Vector3): number {
  const n = sphereSlot.clone();
  if (n.lengthSq() < 1e-10) {
    return 0;
  }
  n.normalize();
  const c = cameraPosition.clone();
  if (c.lengthSq() < 1e-10) {
    return 0;
  }
  c.normalize();
  const alpha = Math.atan2(n.x, n.z);
  const beta = Math.atan2(c.x, c.z);
  let delta = beta - alpha;
  while (delta > Math.PI) {
    delta -= 2 * Math.PI;
  }
  while (delta < -Math.PI) {
    delta += 2 * Math.PI;
  }
  return delta;
}

function RevealMasterClock({
  active,
  paused,
  msRef,
}: {
  active: boolean;
  paused: boolean;
  msRef: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    if (active && !paused) {
      msRef.current += delta * 1000;
    }
  });
  return null;
}

function ProductSphereScene({
  mode,
  spinning,
  winnerSlots,
  revealStepIndex,
  spinResetNonce,
  slotParticipants,
  orbitEnabled,
  revealProgressMsRef,
  onRevealFlyStart,
  orbitMinDistance,
  orbitMaxDistance,
}: {
  mode: LayoutMode;
  spinning: boolean;
  winnerSlots: number[];
  /** 0-based index into `winnerSlots` for the card currently aligning / flying out. */
  revealStepIndex: number;
  spinResetNonce: number;
  slotParticipants: WheelParticipant[];
  orbitEnabled: boolean;
  revealProgressMsRef: React.MutableRefObject<number>;
  onRevealFlyStart: (slot: number, screen: { x: number; y: number }) => void;
  orbitMinDistance: number;
  orbitMaxDistance: number;
}) {
  const { camera, gl } = useThree();
  const cloudRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<Array<THREE.Mesh | null>>([]);
  const spinVelocityRef = useRef(0);
  const lookScratch = useMemo(() => new THREE.Vector3(), []);
  const normalScratch = useMemo(() => new THREE.Vector3(), []);
  const revealSnapshotDoneRef = useRef(false);
  const revealCloudY0Ref = useRef(0);
  const revealCloudDeltaYRef = useRef(0);
  const flyEmitGateRef = useRef(false);

  const tableTargets = useMemo(() => buildProductTableTargets(), []);
  const sphereTargets = useMemo(() => buildProductSphereTargets(), []);

  const points = useMemo(() => sphereTargets.map((p) => p.clone()), [sphereTargets]);

  const cardTextures = useMemo(() => {
    return slotParticipants.map((participant, index) =>
      createLegacyProductCardTexture(
        participant,
        false,
        index,
      ),
    );
  }, [slotParticipants]);

  useEffect(() => {
    return () => {
      disposeCardTextures(cardTextures);
    };
  }, [cardTextures]);

  useEffect(() => {
    spinVelocityRef.current = 0;
    revealProgressMsRef.current = 0;
    revealSnapshotDoneRef.current = false;
    flyEmitGateRef.current = false;
    if (cloudRef.current) {
      cloudRef.current.rotation.y = 0;
    }
  }, [spinResetNonce, revealProgressMsRef]);

  useEffect(() => {
    revealProgressMsRef.current = 0;
    revealSnapshotDoneRef.current = false;
    flyEmitGateRef.current = false;
  }, [winnerSlots, revealStepIndex, revealProgressMsRef]);

  useFrame((_, delta) => {
    const currentSlot = winnerSlots[revealStepIndex];
    const rowRevealActive =
      !spinning &&
      mode === "sphere" &&
      winnerSlots.length > 0 &&
      revealStepIndex < winnerSlots.length &&
      currentSlot !== undefined;

    if (spinning) {
      spinVelocityRef.current = Math.min(spinVelocityRef.current + delta * 1.35, 5.4);
    } else if (rowRevealActive) {
      spinVelocityRef.current = 0;
    } else {
      spinVelocityRef.current = Math.max(spinVelocityRef.current - delta * 1.05, 0);
    }

    const masterMs = revealProgressMsRef.current;
    const alignDone = rowRevealActive && masterMs >= PER_CARD_ALIGN_MS;
    const dimOthers =
      rowRevealActive && masterMs > 0
        ? easeOutCubic(Math.min(1, masterMs / PER_CARD_ALIGN_MS))
        : 0;

    camera.updateMatrixWorld(true);

    if (rowRevealActive && cloudRef.current && !revealSnapshotDoneRef.current) {
      revealCloudY0Ref.current = cloudRef.current.rotation.y;
      revealCloudDeltaYRef.current = cloudYRotationDeltaToFaceCamera(
        sphereTargets[currentSlot],
        camera.position,
      );
      revealSnapshotDoneRef.current = true;
    }

    const firstCardLinear = Math.min(1, masterMs / PER_CARD_ALIGN_MS);

    if (cloudRef.current) {
      if (rowRevealActive) {
        const alignT = Math.min(1, firstCardLinear / SHOWCARD_CLOUD_ALIGN_RATIO);
        const easedAlign = easeOutCubic(alignT);
        cloudRef.current.rotation.y =
          revealCloudY0Ref.current + revealCloudDeltaYRef.current * easedAlign;
      } else {
        cloudRef.current.rotation.y += spinVelocityRef.current * delta;
      }
    }

    const speed = Math.min(1, delta * 2.2);
    const targets = mode === "table" ? tableTargets : sphereTargets;

    const winnerIndexOf = (slot: number) => winnerSlots.indexOf(slot);

    for (let i = 0; i < PRODUCT_TOTAL_CARDS; i++) {
      const wIdx = winnerIndexOf(i);
      const isWinner = wIdx >= 0;
      const isPast = isWinner && wIdx < revealStepIndex;
      const isCurrent = isWinner && wIdx === revealStepIndex;
      const isPending = isWinner && wIdx > revealStepIndex;

      const skipLerp =
        rowRevealActive && isCurrent && masterMs < PER_CARD_ALIGN_MS;

      if ((!isWinner || isPending) && !skipLerp) {
        points[i].lerp(targets[i], speed);
      }

      const mesh = cardRefs.current[i];
      if (!mesh) {
        continue;
      }
      const base = points[i];

      if (isPast || (isCurrent && alignDone)) {
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;
      mesh.position.copy(base);
      mesh.scale.setScalar(1);
      mesh.rotation.set(0, 0, 0);

      mesh.renderOrder = 0;
      const mat = mesh.material;
      if (!Array.isArray(mat) && mat instanceof THREE.MeshStandardMaterial) {
        mat.polygonOffset = false;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
      }

      const dimThis =
        rowRevealActive && ((isWinner && isPending) || !isWinner) && mat instanceof THREE.MeshStandardMaterial;

      if (!dimThis && !Array.isArray(mat) && mat instanceof THREE.MeshStandardMaterial) {
        if (mat.map !== cardTextures[i]) {
          mat.map = cardTextures[i];
          mat.needsUpdate = true;
        }
        mat.color.set("#ffffff");
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      }

      if (dimThis) {
        if (!Array.isArray(mat) && mat instanceof THREE.MeshStandardMaterial) {
          mat.transparent = true;
          const nextOp = THREE.MathUtils.lerp(1, SHOWCARD_OTHERS_OPACITY, dimOthers);
          mat.opacity = nextOp;
          mat.depthWrite = nextOp > 0.55;
        }
      }

      if (mode === "sphere") {
        normalScratch.copy(base).normalize();
        mesh.position.addScaledVector(normalScratch, 0.016);
        mesh.lookAt(productOutwardLookAt(base, lookScratch));
      } else {
        mesh.position.z = base.z + 0.014;
        mesh.rotation.set(0, 0, 0);
      }
    }

    if (
      rowRevealActive &&
      alignDone &&
      !flyEmitGateRef.current &&
      cloudRef.current &&
      currentSlot !== undefined
    ) {
      flyEmitGateRef.current = true;
      const rect = gl.domElement.getBoundingClientRect();
      const w = sphereTargets[currentSlot].clone();
      const n = w.clone().normalize();
      w.addScaledVector(n, 0.016);
      w.applyMatrix4(cloudRef.current.matrixWorld);
      w.project(camera);
      onRevealFlyStart(currentSlot, {
        x: rect.left + (w.x * 0.5 + 0.5) * rect.width,
        y: rect.top + (-w.y * 0.5 + 0.5) * rect.height,
      });
    }
  });

  return (
    <>
      <color attach="background" args={["#02101c"]} />
      <fog attach="fog" args={["#02101c", 14, 42]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[6, 8, 10]} intensity={0.88} color="#b8f4ff" />
      <directionalLight position={[-8, -4, -6]} intensity={0.28} color="#192a56" />
      <pointLight position={[0, 0, 12]} intensity={0.38} color="#00ffff" />

      <group ref={cloudRef}>
        <group>
          {slotParticipants.map((_, index) => {
            const highlightSlot = winnerSlots[revealStepIndex];
            const isCurrentReveal = highlightSlot === index;
            return (
            <mesh
              key={index}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
            >
              <planeGeometry args={[CARD_BOX_WIDTH * PLANE_FACE_INSET, CARD_BOX_HEIGHT * PLANE_FACE_INSET]} />
              <meshStandardMaterial
                map={cardTextures[index]}
                transparent
                opacity={1}
                depthWrite
                color={isCurrentReveal ? "#fff8ea" : "#ffffff"}
                emissive={isCurrentReveal ? "#ff8a1f" : "#000000"}
                emissiveIntensity={isCurrentReveal ? 0.16 : 0}
                roughness={0.42}
                metalness={0.12}
                side={THREE.DoubleSide}
              />
            </mesh>
            );
          })}
        </group>
      </group>

      <OrbitControls
        makeDefault
        enabled={orbitEnabled && !spinning}
        enablePan
        enableZoom
        rotateSpeed={0.5}
        minDistance={orbitMinDistance}
        maxDistance={orbitMaxDistance}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI - 0.08}
      />
    </>
  );
}

export function ProductStyleSphereCanvas({
  className,
  messages,
  orbitMinDistance = DEFAULT_ORBIT_MIN_DISTANCE,
  orbitMaxDistance = DEFAULT_ORBIT_MAX_DISTANCE,
}: ProductStyleSphereCanvasProps) {
  const minD = Math.min(orbitMinDistance, orbitMaxDistance);
  const maxD = Math.max(orbitMinDistance, orbitMaxDistance);
  const [mode, setMode] = useState<LayoutMode>("sphere");
  const [spinning, setSpinning] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<PrizeTierId>(SPIN_TIER_SEQUENCE[0]);
  const [winnerSlots, setWinnerSlots] = useState<number[]>([]);
  const [orbitFree, setOrbitFree] = useState(true);
  const [spinResetNonce, setSpinResetNonce] = useState(0);
  const [chainBusy, setChainBusy] = useState(false);
  const [tierResultsHistory, setTierResultsHistory] = useState<
    { tierId: PrizeTierId; slots: number[] }[]
  >([]);

  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinQueueRef = useRef<PrizeTierId[]>([]);
  const usedWinnerSlotsRef = useRef<Set<number>>(new Set());
  const revealProgressMsRef = useRef(0);

  const [revealPaused, setRevealPaused] = useState(false);
  const [showViewAllResultsButton, setShowViewAllResultsButton] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [continueToNextTierId, setContinueToNextTierId] = useState<PrizeTierId | null>(null);
  /** Index of the winner in `winnerSlots` currently aligning on the sphere / flying to DOM. */
  const [revealStepIndex, setRevealStepIndex] = useState(0);
  /** Cards that already finished the fly-out animation this tier (same order as reveal). */
  const [tierFlySettled, setTierFlySettled] = useState<Array<{ slot: number; start: { x: number; y: number } }>>(
    [],
  );
  const [activeFlyCard, setActiveFlyCard] = useState<{ slot: number; start: { x: number; y: number } } | null>(
    null,
  );
  /** After the tier finishes, keep overlay until the next tier spin. */
  const [persistedWinnerOverlay, setPersistedWinnerOverlay] = useState<{
    tierId: PrizeTierId;
    entries: WinnerOverlayEntry[];
  } | null>(null);

  const tierDoneKeyRef = useRef<string | null>(null);
  const sphereFrameRef = useRef<HTMLDivElement>(null);
  const drawShellRef = useRef<HTMLDivElement>(null);
  const arenaPrevNativeFsRef = useRef(false);

  const [arenaExpanded, setArenaExpanded] = useState(false);
  const [arenaNativeFs, setArenaNativeFs] = useState(false);

  const slotParticipants = useMemo(() => getProductSphereFakeParticipants(), []);

  const overlayEntries = useMemo((): WinnerOverlayEntry[] => {
    if (winnerSlots.length > 0) {
      const list: WinnerOverlayEntry[] = tierFlySettled.map((t) => ({
        slot: t.slot,
        start: t.start,
        freezeEnter: true,
      }));
      if (activeFlyCard) {
        list.push({
          slot: activeFlyCard.slot,
          start: activeFlyCard.start,
          freezeEnter: false,
        });
      }
      return list;
    }
    if (persistedWinnerOverlay) {
      return persistedWinnerOverlay.entries;
    }
    return [];
  }, [winnerSlots, tierFlySettled, activeFlyCard, persistedWinnerOverlay]);

  const handleRevealFlyStart = useCallback((slot: number, screen: { x: number; y: number }) => {
    setActiveFlyCard({ slot, start: screen });
  }, []);

  useEffect(() => {
    if (!activeFlyCard) {
      return;
    }
    const t = setTimeout(() => {
      setTierFlySettled((s) => [...s, { slot: activeFlyCard.slot, start: { ...activeFlyCard.start } }]);
      setActiveFlyCard(null);
      setRevealStepIndex((i) => i + 1);
    }, WINNER_CARD_FLY_DURATION_MS);
    return () => clearTimeout(t);
  }, [activeFlyCard]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const beginTierSpinRef = useRef<(tierId: PrizeTierId) => void>(() => {});

  useEffect(() => {
    beginTierSpinRef.current = (tierId: PrizeTierId) => {
      if (spinTimeoutRef.current !== null) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
      setRevealPaused(false);
      setContinueToNextTierId(null);
      setPersistedWinnerOverlay(null);
      setRevealStepIndex(0);
      setTierFlySettled([]);
      setActiveFlyCard(null);
      tierDoneKeyRef.current = null;
      setWinnerSlots([]);
      setSelectedTierId(tierId);
      setMode("sphere");
      setOrbitFree(true);
      setSpinning(true);

      const qty =
        PRIZE_TIER_ORDER.find((t) => t.id === tierId)?.quantity ?? PRIZE_TIER_ORDER[0].quantity;

      spinTimeoutRef.current = setTimeout(() => {
        const slots = pickDistinctSlotsExcluding(
          qty,
          PRODUCT_TOTAL_CARDS,
          usedWinnerSlotsRef.current,
        );
        const picks = slots.map((s) => slotParticipants[s]).filter(Boolean) as WheelParticipant[];
        if (picks.length === qty) {
          for (const s of slots) {
            usedWinnerSlotsRef.current.add(s);
          }
          tierDoneKeyRef.current = null;
          revealProgressMsRef.current = 0;
          setRevealStepIndex(0);
          setTierFlySettled([]);
          setActiveFlyCard(null);
          setWinnerSlots(slots);
          setOrbitFree(false);
        } else {
          spinQueueRef.current = [];
          setChainBusy(false);
          setContinueToNextTierId(null);
        }
        setSpinning(false);
        spinTimeoutRef.current = null;
      }, SPIN_DURATION_MS);
    };
  }, [slotParticipants]);

  const exitArenaPresentation = useCallback(async () => {
    try {
      const el = drawShellRef.current;
      if (el && document.fullscreenElement === el) {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
    setArenaExpanded(false);
    setArenaNativeFs(false);
    arenaPrevNativeFsRef.current = false;
  }, []);

  const handleExpandArena = useCallback(() => {
    setArenaExpanded(true);
    const el = drawShellRef.current;
    if (!el) {
      return;
    }
    void (async () => {
      try {
        await el.requestFullscreen();
      } catch {
        /* fixed fallback */
      }
    })();
  }, []);

  const handleCollapseArena = useCallback(() => {
    void exitArenaPresentation();
  }, [exitArenaPresentation]);

  const runSpin = useCallback(() => {
    if (spinning || !orbitFree || chainBusy) {
      return;
    }
    if (spinTimeoutRef.current !== null) {
      clearTimeout(spinTimeoutRef.current);
    }
    usedWinnerSlotsRef.current = new Set();
    spinQueueRef.current = [...SPIN_TIER_SEQUENCE.slice(1)];
    setTierResultsHistory([]);
    setPersistedWinnerOverlay(null);
    setRevealStepIndex(0);
    setTierFlySettled([]);
    setActiveFlyCard(null);
    tierDoneKeyRef.current = null;
    setWinnerSlots([]);
    setRevealPaused(false);
    revealProgressMsRef.current = 0;
    setShowViewAllResultsButton(false);
    setResultsModalOpen(false);
    setContinueToNextTierId(null);
    setChainBusy(true);
    beginTierSpinRef.current(SPIN_TIER_SEQUENCE[0]);
  }, [spinning, orbitFree, chainBusy]);

  const runReset = useCallback(() => {
    void exitArenaPresentation();
    if (spinTimeoutRef.current !== null) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }
    spinQueueRef.current = [];
    usedWinnerSlotsRef.current = new Set();
    revealProgressMsRef.current = 0;
    setRevealPaused(false);
    setShowViewAllResultsButton(false);
    setResultsModalOpen(false);
    setContinueToNextTierId(null);
    setChainBusy(false);
    setSpinning(false);
    setPersistedWinnerOverlay(null);
    setRevealStepIndex(0);
    setTierFlySettled([]);
    setActiveFlyCard(null);
    tierDoneKeyRef.current = null;
    setWinnerSlots([]);
    setTierResultsHistory([]);
    setOrbitFree(true);
    setSelectedTierId(SPIN_TIER_SEQUENCE[0]);
    setSpinResetNonce((n) => n + 1);
  }, [exitArenaPresentation]);

  const winnerSummaryLines = useMemo(() => {
    const lines = tierResultsHistory.map((b) => ({
      tierId: b.tierId,
      slots: [...b.slots],
    }));
    if (winnerSlots.length > 0) {
      lines.push({ tierId: selectedTierId, slots: [...winnerSlots] });
    }
    return lines;
  }, [tierResultsHistory, winnerSlots, selectedTierId]);

  const tierProgressRows = useMemo(() => {
    return PRIZE_SUMMARY_DISPLAY_ORDER.map((id) => {
      const total = PRIZE_TIER_ORDER.find((t) => t.id === id)?.quantity ?? 0;
      const fromHistory = tierResultsHistory
        .filter((h) => h.tierId === id)
        .reduce((acc, h) => acc + h.slots.length, 0);
      const inFlight =
        winnerSlots.length > 0 && selectedTierId === id ? winnerSlots.length : 0;
      return {
        id,
        label: prizeTierLabel(id, messages),
        total,
        drawn: fromHistory + inFlight,
      };
    });
  }, [tierResultsHistory, winnerSlots, selectedTierId, messages]);

  const activeOverlayTierId = useMemo((): PrizeTierId | null => {
    if (!chainBusy) {
      return null;
    }
    if (continueToNextTierId !== null) {
      return continueToNextTierId;
    }
    if (spinning || winnerSlots.length > 0 || !orbitFree) {
      return selectedTierId;
    }
    return null;
  }, [chainBusy, continueToNextTierId, spinning, winnerSlots.length, orbitFree, selectedTierId]);

  useEffect(() => {
    if (mode !== "sphere" || spinning || winnerSlots.length === 0) {
      return;
    }
    if (revealStepIndex !== winnerSlots.length) {
      return;
    }
    if (tierFlySettled.length !== winnerSlots.length) {
      return;
    }

    const sig = `${selectedTierId}:${winnerSlots.join(",")}`;
    if (tierDoneKeyRef.current === sig) {
      return;
    }
    tierDoneKeyRef.current = sig;

    const slotsSnapshot = [...winnerSlots];
    const tierId = selectedTierId;

    setPersistedWinnerOverlay({
      tierId,
      entries: tierFlySettled.map((t) => ({
        slot: t.slot,
        start: { x: t.start.x, y: t.start.y },
        freezeEnter: true,
      })),
    });
    setOrbitFree(true);
    setTierResultsHistory((h) => [...h, { tierId, slots: slotsSnapshot }]);
    setRevealPaused(false);
    setWinnerSlots([]);
    setRevealStepIndex(0);
    setTierFlySettled([]);
    setActiveFlyCard(null);
    revealProgressMsRef.current = 0;

    const next = spinQueueRef.current.shift();
    if (next !== undefined) {
      setContinueToNextTierId(next);
    } else {
      setChainBusy(false);
      setShowViewAllResultsButton(true);
    }
  }, [mode, spinning, revealStepIndex, winnerSlots, selectedTierId, tierFlySettled]);

  useEffect(() => {
    if (!resultsModalOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResultsModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resultsModalOpen]);

  useEffect(() => {
    const onFs = () => {
      const shell = drawShellRef.current;
      const active = shell !== null && document.fullscreenElement === shell;
      if (arenaPrevNativeFsRef.current && !active) {
        setArenaExpanded(false);
      }
      arenaPrevNativeFsRef.current = active;
      setArenaNativeFs(active);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!arenaExpanded || arenaNativeFs) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [arenaExpanded, arenaNativeFs]);

  useEffect(() => {
    if (!arenaExpanded || arenaNativeFs) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setArenaExpanded(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arenaExpanded, arenaNativeFs]);

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="relative w-full min-w-0">
        <div
          ref={drawShellRef}
          className={cn(
            "w-full bg-background",
            !arenaExpanded && "relative",
            arenaExpanded && "flex min-h-0 flex-col",
            arenaExpanded && (arenaNativeFs ? "h-screen" : "fixed inset-0 z-[200] h-[100dvh] w-full"),
          )}
        >
          <div
            ref={sphereFrameRef}
            className={cn(
              "relative w-full touch-none overflow-hidden",
              arenaExpanded ? "min-h-0 flex-1" : "h-[90vh] min-h-[280px]",
            )}
            onWheel={(e) => e.stopPropagation()}
            role="presentation"
          >
        <div className="absolute inset-0 z-0">
          <Canvas
            className="h-full w-full"
            camera={{ position: [0, 0, 30], fov: 50, near: 0.1, far: 200 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
          <ProductSphereScene
            mode={mode}
            spinning={spinning}
            winnerSlots={winnerSlots}
            revealStepIndex={revealStepIndex}
            spinResetNonce={spinResetNonce}
            slotParticipants={slotParticipants}
            orbitEnabled={orbitFree}
            revealProgressMsRef={revealProgressMsRef}
            onRevealFlyStart={handleRevealFlyStart}
            orbitMinDistance={minD}
            orbitMaxDistance={maxD}
          />
          <RevealMasterClock
            active={
              mode === "sphere" &&
              !spinning &&
              winnerSlots.length > 0 &&
              revealStepIndex < winnerSlots.length &&
              activeFlyCard === null
            }
            paused={revealPaused}
            msRef={revealProgressMsRef}
          />
          </Canvas>
        </div>

        {mode === "sphere" && !spinning && winnerSlots.length > 0 ? (
          <div className="pointer-events-auto absolute bottom-4 left-1/2 z-[50] flex -translate-x-1/2 flex-wrap justify-center gap-2">
            {!revealPaused ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="shadow-md"
                onClick={() => setRevealPaused(true)}
              >
                {messages.revealPause}
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={() => setRevealPaused(false)}>
                {messages.revealResume}
              </Button>
            )}
          </div>
        ) : null}

        {continueToNextTierId !== null && mode === "sphere" && !spinning && chainBusy ? (
          <div className="pointer-events-auto absolute bottom-4 left-1/2 z-[50] flex -translate-x-1/2 justify-center px-2">
            <Button
              type="button"
              variant="default"
              className="max-w-[min(100%,22rem)] text-center shadow-lg"
              onClick={() => {
                const id = continueToNextTierId;
                setContinueToNextTierId(null);
                beginTierSpinRef.current(id);
              }}
            >
              {messages.continueNextTier}
            </Button>
          </div>
        ) : null}

        <PrizeTierProgressStack
          className="pointer-events-none absolute left-2 top-28 z-[50] w-[min(100%,15.5rem)] sm:top-32"
          tiers={tierProgressRows}
          activeTierId={activeOverlayTierId}
        />

        {showViewAllResultsButton && !chainBusy && !spinning ? (
          <div className="pointer-events-auto absolute bottom-4 left-1/2 z-[50] flex -translate-x-1/2 justify-center">
            <Button
              type="button"
              variant="default"
              className="shadow-lg"
              onClick={() => setResultsModalOpen(true)}
            >
              {messages.viewAllResults}
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "pointer-events-auto absolute inset-x-0 top-0 z-[50]",
            arenaExpanded
              ? "flex justify-end bg-transparent px-3 py-2"
              : "flex flex-col gap-2 border-b border-border/60 bg-background/80 px-3 py-2.5 shadow-sm backdrop-blur-md md:flex-row md:items-start md:justify-between md:gap-3",
          )}
        >
          {!arenaExpanded ? (
            <p className="max-w-[min(100%,28rem)] text-[11px] leading-snug text-muted-foreground md:pt-0.5">
              {messages.prizeTierHint}
            </p>
          ) : null}
          <div
            className={cn(
              arenaExpanded
                ? "flex flex-row flex-wrap items-center justify-end gap-2"
                : "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
            )}
          >
            <div className="flex flex-wrap gap-2">
              {!arenaExpanded ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "table" ? "default" : "outline"}
                    onClick={() => setMode("table")}
                    disabled={spinning || chainBusy}
                  >
                    {messages.modeTable}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "sphere" ? "default" : "outline"}
                    onClick={() => setMode("sphere")}
                    disabled={spinning || chainBusy}
                  >
                    {messages.modeSphere}
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="shadow-[0_2px_0_0_rgb(204_134_42)]"
                onClick={runSpin}
                disabled={spinning || !orbitFree || chainBusy}
              >
                {spinning ? messages.spinning : messages.spin}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={runReset}>
                {messages.resetDraw}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="shrink-0"
                aria-label={arenaExpanded ? messages.collapseArena : messages.expandArena}
                title={arenaExpanded ? messages.collapseArena : messages.expandArena}
                onClick={arenaExpanded ? handleCollapseArena : handleExpandArena}
              >
                {arenaExpanded ? (
                  <MdFullscreenExit className="size-5" aria-hidden />
                ) : (
                  <MdFullscreen className="size-5" aria-hidden />
                )}
              </Button>
            </div>
            {!arenaExpanded ? (
              <p className="max-w-xl text-[11px] leading-snug text-muted-foreground sm:max-w-[14rem] sm:text-right md:max-w-xs">
                {messages.hint}
              </p>
            ) : null}
          </div>
        </div>

        <WinnerCardsScreenOverlay
          boundsRef={sphereFrameRef}
          entries={overlayEntries}
          slotParticipants={slotParticipants}
          layoutSlotCount={winnerSlots.length > 0 ? winnerSlots.length : undefined}
        />
          </div>
        </div>

        <div className="w-full border-t border-border bg-card px-3 py-3 text-sm text-card-foreground">
          <p className="text-xs leading-relaxed text-muted-foreground">{messages.demoCardsNote}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            {messages.participantsCount}: {slotParticipants.length}
          </div>
          <div className="mt-2 font-semibold">
            {messages.winnerLabel}:{" "}
            {winnerSummaryLines.length > 0 ? (
              <ul className="mt-1 list-none space-y-2 pl-0 font-medium text-primary">
                {winnerSummaryLines.map((block, idx) => (
                  <li key={`${block.tierId}-${idx}`}>
                    <span className="text-muted-foreground">
                      {prizeTierLabel(block.tierId, messages)}:
                    </span>{" "}
                    {block.slots
                      .map((s) => slotParticipants[s])
                      .filter(Boolean)
                      .map((p) => `${p.name} · ${p.code}`)
                      .join(" · ")}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="font-normal text-muted-foreground">{messages.noWinner}</span>
            )}
          </div>
        </div>
      </div>

      {resultsModalOpen ? (
        <div className="fixed inset-0 z-[360] flex items-end justify-center p-4 pb-10 sm:items-center sm:pb-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            aria-label={messages.resultsSummaryClose}
            onClick={() => setResultsModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-summary-title"
            className="relative z-[361] max-h-[min(85dvh,640px)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="results-summary-title" className="text-lg font-semibold text-foreground">
              {messages.resultsSummaryTitle}
            </h2>
            <div className="mt-4 space-y-5">
              {PRIZE_SUMMARY_DISPLAY_ORDER.map((tierId) => {
                const block = tierResultsHistory.find((h) => h.tierId === tierId);
                const slots = block?.slots ?? [];
                return (
                  <section key={tierId}>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      {prizeTierLabel(tierId, messages)}
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                      {slots.length === 0 ? (
                        <li className="list-none pl-0 text-muted-foreground">—</li>
                      ) : (
                        slots.map((s) => {
                          const p = slotParticipants[s];
                          return (
                            <li key={`${tierId}-${s}`}>
                              {p ? `${p.name} · ${p.code}` : "—"}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </section>
                );
              })}
            </div>
            <Button
              type="button"
              className="mt-6 w-full"
              variant="secondary"
              onClick={() => setResultsModalOpen(false)}
            >
              {messages.resultsSummaryClose}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
