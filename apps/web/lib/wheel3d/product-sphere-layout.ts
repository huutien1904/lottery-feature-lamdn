import * as THREE from "three";

/** Matches `product/src/lottery/index.js` grid. */
export const PRODUCT_ROW_COUNT = 7;
export const PRODUCT_COLUMN_COUNT = 31;
export const PRODUCT_TOTAL_CARDS = PRODUCT_ROW_COUNT * PRODUCT_COLUMN_COUNT;
export const PRODUCT_RESOLUTION = 1;

/**
 * Legacy scene uses large units (camera z≈3000, sphere radius 800).
 * Scale down for WebGL lab so orbit distances stay reasonable.
 */
export const PRODUCT_SCENE_SCALE = 1 / 100;

export const PRODUCT_SPHERE_RADIUS = 800 * PRODUCT_SCENE_SCALE * PRODUCT_RESOLUTION;

/**
 * Thu nhỏ bán kính shell so với công thức legacy (800×scale) để các thẻ trên cầu **sát nhau hơn**
 * theo cung; toán phân bố phi/theta vẫn giống `product`.
 */
export const PRODUCT_SPHERE_DISPLAY_SHRINK = 0.58;

/** Bán kính vỏ cầu thực tế dùng trong scene (sau shrink). */
export const PRODUCT_SPHERE_SHELL_RADIUS = PRODUCT_SPHERE_RADIUS * PRODUCT_SPHERE_DISPLAY_SHRINK;

/**
 * Table layout targets (centred), same formula as legacy `targets.table`.
 */
export function buildProductTableTargets(): THREE.Vector3[] {
  const s = PRODUCT_SCENE_SCALE;
  const centerX = (180 * PRODUCT_COLUMN_COUNT - 20) / 2;
  const centerY = (220 * PRODUCT_ROW_COUNT - 20) / 2;
  const targets: THREE.Vector3[] = [];

  for (let i = 0; i < PRODUCT_ROW_COUNT; i++) {
    for (let j = 0; j < PRODUCT_COLUMN_COUNT; j++) {
      const x = j * 160 - centerX;
      const y = -(i * 180) + centerY;
      targets.push(new THREE.Vector3(x * s, y * s, 0));
    }
  }
  return targets;
}

/**
 * Fibonacci / spherical distribution on a shell — same as legacy `targets.sphere`.
 */
export function buildProductSphereTargets(): THREE.Vector3[] {
  const l = PRODUCT_TOTAL_CARDS;
  const radius = PRODUCT_SPHERE_SHELL_RADIUS;
  const targets: THREE.Vector3[] = [];

  for (let i = 0; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;
    targets.push(new THREE.Vector3().setFromSphericalCoords(radius, phi, theta));
  }
  return targets;
}

/** Legacy: `vector.copy(object.position).multiplyScalar(2); object.lookAt(vector)` */
export function productOutwardLookAt(position: THREE.Vector3, target: THREE.Vector3): THREE.Vector3 {
  return target.copy(position).multiplyScalar(2);
}
