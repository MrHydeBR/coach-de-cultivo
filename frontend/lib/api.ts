// Cliente REST centralizado. Nunca usar fetch diretamente em componentes.

import { Cycle, IrrigationLog, LogInput, CoachDiagnosis } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Token": TOKEN,
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

// ── Cycles ──────────────────────────────────────────────────────────────────

export function getActiveCycle(): Promise<Cycle> {
  return apiFetch<Cycle>("/cycles/active");
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export function getLogs(cycleId: string): Promise<IrrigationLog[]> {
  return apiFetch<IrrigationLog[]>(`/cycles/${cycleId}/logs`);
}

export function createLog(data: LogInput): Promise<IrrigationLog> {
  return apiFetch<IrrigationLog>("/cycles/logs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Coach ────────────────────────────────────────────────────────────────────

export function getCoachDiagnosis(cycleId: string): Promise<CoachDiagnosis> {
  return apiFetch<CoachDiagnosis>(`/cycles/${cycleId}/coach`);
}
