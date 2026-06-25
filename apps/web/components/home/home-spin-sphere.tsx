"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { createLegacyProductCardTexture } from "@/lib/wheel3d/card-texture";
import type { WheelParticipant } from "@/lib/wheel3d/types";

const SCENE_BG = "#02101c";
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// ── geometry helpers ──────────────────────────────────────────────────────────

function computeRadius(count: number): number {
  if (count <= 1) return 0;
  return Math.max(1.0, 0.55 * Math.sqrt(count));
}

function computeCardSize(radius: number): number {
  return Math.min(1.2, Math.max(0.65, radius * 0.72));
}

function buildPositions(count: number, radius: number): THREE.Vector3[] {
  if (count === 0) return [];
  if (count === 1) return [new THREE.Vector3(0, 0, radius || 1.2)];
  return Array.from({ length: count }, (_, i) => {
    const cosPhi = 1 - (2 * (i + 0.5)) / count;
    const phi = Math.acos(cosPhi);
    const theta = GOLDEN_ANGLE * i;
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  });
}

/**
 * Spherical patch centred at local origin — all vertices at exactly radius R
 * from the sphere centre, so the card genuinely hugs the sphere surface.
 *
 * Coordinate convention for mesh.lookAt(0,0,0) on a non-camera Object3D:
 *   Three.js sets  local -Z  →  world outward (pos.normalize()).
 *   Therefore the *front* face must face local -Z, i.e. winding must be
 *   CW when seen from local +Z  (reversed from the usual CCW convention).
 *   Vertex normals likewise point in local -Z so lighting is correct.
 *
 * pz = R·(1 − cos dT·cos dP) ≥ 0
 *   After the lookAt rotation: world_z of edge = R·cos(dT)  < R  → inside sphere ✓
 *   Full distance from sphere centre = R always ✓  (card lies on sphere surface)
 *
 * UV.x = 1 − i/segs  (flipped) compensates for the lookAt-induced X-axis flip.
 */
function createCurvedPatch(
  radius: number,
  angW: number,
  angH: number,
  segs = 14,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segs; j++) {
    for (let i = 0; i <= segs; i++) {
      const u = i / segs - 0.5;
      const v = j / segs - 0.5;
      const dT = u * angW;
      const dP = v * angH;

      const sinT = Math.sin(dT), cosT = Math.cos(dT);
      const sinP = Math.sin(dP), cosP = Math.cos(dP);

      // Position: pz positive so all vertices land on the sphere surface
      // after the lookAt(0,0,0) rotation (world_z = R - pz = R·cosT·cosP ≤ R)
      positions.push(
        radius * sinT * cosP,           // x
        radius * sinP,                  // y
        radius - radius * cosT * cosP,  // z = R·(1−cosT·cosP) ≥ 0
      );

      // Normal in local space: must point in local −Z direction so it maps
      // to the world outward direction after lookAt(0,0,0).
      normals.push(sinT * cosP, sinP, -cosT * cosP);

      // UV.x flipped  : compensates for the X-axis inversion from lookAt(0,0,0)
      // UV.y NOT flipped: CanvasTexture flipY=true already maps canvas-top → UV.y=1
      //   j=0 → bottom of card (world -Y) → UV.y=0 → canvas bottom (code number) ✓
      //   j=segs → top of card (world +Y) → UV.y=1 → canvas top (brand text) ✓
      //   '1 - j/segs' was flipping Y a second time → text appeared upside down ✗
      uvs.push(1 - i / segs, j / segs);
    }
  }

  // Reversed winding (a,c,b) → front face faces local −Z = world outward = camera
  for (let j = 0; j < segs; j++) {
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i;
      const b = a + 1;
      const c = a + segs + 1;
      const d = c + 1;
      indices.push(a, c, b, c, d, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

// ── ghost wireframe ───────────────────────────────────────────────────────────

function GhostSphere({ radius }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius + 0.01, 24, 18]} />
      <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.08} />
    </mesh>
  );
}

// ── individual card with 3-D flip reveal for winners ─────────────────────────

const FLIP_DURATION = 0.8;  // seconds to fly out + flip
const WINNER_SCALE  = 1.65; // how much bigger the winner card gets

function CardMesh({
  pos,
  participant,
  radius,
  cardSize,
  winner,
  dimmed,
}: {
  pos: THREE.Vector3;
  participant: WheelParticipant;
  radius: number;
  cardSize: number;
  winner: boolean;
  dimmed: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null); // handles position + lookAt
  const meshRef  = useRef<THREE.Mesh>(null);  // handles flip rotation
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);

  // Pre-create both textures so the switch at 180° is instant
  const normalTex = useMemo(
    () => createLegacyProductCardTexture(participant, false, parseInt(participant.id, 10) || 0),
    [participant],
  );
  const winnerTex = useMemo(
    () => createLegacyProductCardTexture(participant, true, parseInt(participant.id, 10) || 0),
    [participant],
  );

  const geo = useMemo(() => {
    const ang = cardSize / radius;
    return createCurvedPatch(radius, ang, ang);
  }, [radius, cardSize]);

  useEffect(() => {
    return () => { normalTex.dispose(); winnerTex.dispose(); geo.dispose(); };
  }, [normalTex, winnerTex, geo]);

  // Animation state in refs — no re-renders needed
  const flipProgress = useRef(0);
  const texSwitched  = useRef(false);
  const wasWinner    = useRef(false);

  // Target: centre-front of sphere (in sphere-local space, which equals world
  //         space while the sphere is frozen during winner reveal)
  const targetPos  = useMemo(() => new THREE.Vector3(0, 0, radius + cardSize * 1.1), [radius, cardSize]);
  // lookAt point far *behind* the sphere → local -Z faces the camera
  const LOOK_BEHIND = useMemo(() => new THREE.Vector3(0, 0, -200), []);

  // Sphere-surface placement for non-winner cards
  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(pos);
    groupRef.current.scale.setScalar(1);
    groupRef.current.lookAt(0, 0, 0);
  });

  useFrame((state, dt) => {
    if (!groupRef.current || !meshRef.current || !matRef.current) return;

    // ── Opacity / dimming ──────────────────────────────────────────────────
    const opacityTarget = dimmed ? 0.12 : 1;
    matRef.current.opacity += (opacityTarget - matRef.current.opacity) * Math.min(1, dt * 7);
    matRef.current.transparent = matRef.current.opacity < 0.99;
    matRef.current.depthWrite  = matRef.current.opacity > 0.55;

    // ── Winner: fly out to front + flip ───────────────────────────────────
    if (winner) {
      if (!wasWinner.current) {
        wasWinner.current        = true;
        flipProgress.current     = 0;
        texSwitched.current      = false;
        matRef.current.map       = normalTex;
        matRef.current.needsUpdate = true;
        matRef.current.color.set("#ffffff");
        matRef.current.emissive.set("#000000");
        matRef.current.emissiveIntensity = 0;
        matRef.current.side      = THREE.DoubleSide;
      }

      if (flipProgress.current < 1)
        flipProgress.current = Math.min(1, flipProgress.current + dt / FLIP_DURATION);

      const t      = flipProgress.current;
      const eased  = 1 - Math.pow(1 - t, 3); // ease-out cubic

      // Fly from sphere surface to centre-front
      groupRef.current.position.lerpVectors(pos, targetPos, eased);

      // Grow card as it approaches the camera
      groupRef.current.scale.setScalar(1 + (WINNER_SCALE - 1) * eased);

      // Face the camera the whole way (lookAt far-behind point)
      groupRef.current.lookAt(LOOK_BEHIND);

      // Linear Y-flip so the switch happens at exactly 180°
      meshRef.current.rotation.y = t * Math.PI * 2;

      // Switch to winner texture at back-facing moment (t=0.5 → 180°)
      if (!texSwitched.current && t >= 0.5) {
        texSwitched.current        = true;
        matRef.current.map         = winnerTex;
        matRef.current.needsUpdate = true;
        matRef.current.color.set("#fff8ea");
        matRef.current.emissive.set("#ff8a1f");
      }

      // Settled: snap rotation, restore FrontSide, pulsing glow
      if (t >= 1) {
        meshRef.current.rotation.y    = 0;
        matRef.current.side            = THREE.FrontSide;
        matRef.current.emissiveIntensity =
          0.14 + 0.09 * Math.sin(state.clock.elapsedTime * 2.5);
      }

    } else {
      // ── Reset ─────────────────────────────────────────────────────────────
      if (wasWinner.current) {
        wasWinner.current          = false;
        flipProgress.current       = 0;
        texSwitched.current        = false;
        meshRef.current.rotation.y = 0;
        groupRef.current.position.copy(pos);
        groupRef.current.scale.setScalar(1);
        groupRef.current.lookAt(0, 0, 0);
        matRef.current.map         = normalTex;
        matRef.current.needsUpdate = true;
        matRef.current.color.set("#ffffff");
        matRef.current.emissive.set("#000000");
        matRef.current.emissiveIntensity = 0;
        matRef.current.side        = THREE.FrontSide;
      }
    }
  });

  return (
    <group ref={groupRef} frustumCulled={false}>
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial
          ref={matRef}
          map={normalTex}
          transparent={false}
          opacity={1}
          depthWrite
          roughness={0.42}
          metalness={0.12}
          side={THREE.FrontSide}
          color="#ffffff"
          emissive={new THREE.Color("#000000")}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

// ── spinning group ────────────────────────────────────────────────────────────

function SphereGroup({
  names,
  spinning,
  winnerId,
  onSpinDone,
}: {
  names: string[];
  spinning: boolean;
  winnerId: number | null;
  onSpinDone: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  const RADIUS = useMemo(() => computeRadius(names.length), [names.length]);
  const CARD_SIZE = useMemo(() => computeCardSize(RADIUS), [RADIUS]);
  const positions = useMemo(() => buildPositions(names.length, RADIUS), [names.length, RADIUS]);
  const participants = useMemo<WheelParticipant[]>(
    () => names.map((name, i) => ({ id: String(i), name, code: String(i + 1).padStart(3, "0") })),
    [names],
  );

  useEffect(() => {
    if (spinning) { progressRef.current = 0; doneRef.current = false; }
  }, [spinning]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (spinning) {
      progressRef.current = Math.min(1, progressRef.current + dt / 3.2);
      const t = progressRef.current;
      groupRef.current.rotation.y += 5 * (1 - t) * (1 - t) * dt;
      if (t >= 1 && !doneRef.current) { doneRef.current = true; onSpinDone(); }
    } else if (winnerId === null) {
      // Freeze sphere while winner card is animating out
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {RADIUS > 0 && <GhostSphere radius={RADIUS} />}
      {participants.map((p, i) => (
        <CardMesh
          key={i}
          pos={positions[i]}
          participant={p}
          radius={RADIUS}
          cardSize={CARD_SIZE}
          winner={winnerId === i}
          dimmed={winnerId !== null && winnerId !== i}
        />
      ))}
    </group>
  );
}

// ── canvas ────────────────────────────────────────────────────────────────────

export function HomeSpinSphere({
  names,
  spinning,
  winnerId,
  onSpinDone,
}: {
  names: string[];
  spinning: boolean;
  winnerId: number | null;
  onSpinDone: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[SCENE_BG]} />
      <fog attach="fog" args={[SCENE_BG, 7, 18]} />

      <ambientLight intensity={0.58} />
      <directionalLight position={[1.5, 2, 2.5]} intensity={0.88} color="#b8f4ff" />
      <directionalLight position={[-2, -1, -1.5]} intensity={0.28} color="#192a56" />
      <pointLight position={[0, 0, 3]} intensity={0.38} color="#00ffff" />

      {names.length > 0 && (
        <SphereGroup
          names={names}
          spinning={spinning}
          winnerId={winnerId}
          onSpinDone={onSpinDone}
        />
      )}

      <OrbitControls
        enablePan={false}
        enableZoom
        rotateSpeed={0.5}
        minDistance={2}
        maxDistance={12}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI - 0.08}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
