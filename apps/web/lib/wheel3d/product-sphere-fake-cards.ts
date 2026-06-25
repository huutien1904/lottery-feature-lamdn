import { PRODUCT_TOTAL_CARDS } from "@/lib/wheel3d/product-sphere-layout";
import type { WheelParticipant } from "@/lib/wheel3d/types";

const FIRST = ["An", "Bình", "Chi", "Dũng", "Giang", "Hà", "Huy", "Lan", "Mai", "Minh", "Nam", "Ngọc", "Phúc", "Quỳnh", "Sơn", "Thảo", "Trang", "Tuấn", "Tùng", "Vy", "Yến"];
const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"];

let cached: WheelParticipant[] | null = null;

/** 217 người demo — gắn cố định theo index ô (0..216). */
export function getProductSphereFakeParticipants(): WheelParticipant[] {
  if (cached) {
    return cached;
  }
  cached = Array.from({ length: PRODUCT_TOTAL_CARDS }, (_, i) => ({
    id: `DEMO-${String(i + 1).padStart(4, "0")}`,
    name: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
    code: `NV-${String(i + 1).padStart(4, "0")}`,
  }));
  return cached;
}
