"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { mapParticipantsResponse, mapPrizesResponse } from "@/lib/wheel3d/adapter";
import { wheelMockData } from "@/lib/wheel3d/mock-data";
import type { WheelDataResult } from "@/lib/wheel3d/types";

export function useWheelData() {
  return useQuery<WheelDataResult>({
    queryKey: ["wheel3d-lab-data"],
    queryFn: async () => {
      try {
        const [participantsPayload, prizesPayload] = await Promise.all([
          apiFetch<unknown>("/participants?limit=240"),
          apiFetch<unknown>("/events/prizes"),
        ]);

        const participants = mapParticipantsResponse(participantsPayload);
        const prizes = mapPrizesResponse(prizesPayload);

        if (participants.length === 0) {
          return wheelMockData;
        }

        return {
          participants,
          prizes,
          source: "api" as const,
        };
      } catch {
        return wheelMockData;
      }
    },
    staleTime: 30_000,
  });
}

