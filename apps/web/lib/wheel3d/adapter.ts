import type { WheelParticipant, WheelPrize } from "./types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type ApiParticipant = {
  id: string;
  name?: string;
  fullName?: string;
  participantName?: string;
  code?: string;
  participantCode?: string;
  avatarUrl?: string | null;
  avatar?: string | null;
};

type ApiPrize = {
  id: string;
  title?: string;
  name?: string;
  quantity?: number;
  count?: number;
};

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function mapParticipantsResponse(payload: unknown): WheelParticipant[] {
  const envelope = payload as ApiEnvelope<unknown>;
  const raw = envelope?.data ?? payload;
  const list = ensureArray<ApiParticipant>((raw as { items?: unknown })?.items ?? raw);

  return list.map((item, index) => ({
    id: item.id ?? `participant-${index}`,
    name: item.name ?? item.fullName ?? item.participantName ?? `Participant ${index + 1}`,
    code: item.code ?? item.participantCode ?? `P-${index + 1}`,
    avatarUrl: item.avatarUrl ?? item.avatar ?? undefined,
  }));
}

export function mapPrizesResponse(payload: unknown): WheelPrize[] {
  const envelope = payload as ApiEnvelope<unknown>;
  const raw = envelope?.data ?? payload;
  const list = ensureArray<ApiPrize>((raw as { items?: unknown })?.items ?? raw);

  return list.map((item, index) => ({
    id: item.id ?? `prize-${index}`,
    title: item.title ?? item.name ?? `Prize ${index + 1}`,
    quantity: item.quantity ?? item.count ?? 1,
  }));
}

