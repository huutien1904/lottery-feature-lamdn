import type { WheelDataResult } from "./types";

export const wheelMockData: WheelDataResult = {
  source: "mock",
  participants: Array.from({ length: 216 }).map((_, index) => ({
    id: `mock-${index + 1}`,
    name: `User ${index + 1}`,
    code: `U-${(index + 1).toString().padStart(3, "0")}`,
  })),
  prizes: [
    { id: "mock-grand", title: "Grand Prize", quantity: 1 },
    { id: "mock-first", title: "First Prize", quantity: 3 },
    { id: "mock-second", title: "Second Prize", quantity: 10 },
  ],
};

