import type { RiskInput, RiskResult } from "../types/contracts";

async function invokeSafe<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch {
    return null;
  }
}

export async function healthPing(): Promise<string> {
  return (await invokeSafe<string>("health_ping")) ?? "ui-only";
}

export async function scoreRisk(input: RiskInput): Promise<RiskResult> {
  const remote = await invokeSafe<RiskResult>("score_risk", { input });
  if (remote) return remote;
  const score = Math.max(
    0,
    Math.min(
      100,
      input.severity +
        input.confidence +
        input.repetition +
        input.assetCriticality +
        input.threatIntelMatch -
        input.allowlistBonus,
    ),
  );
  const level = score < 25 ? 0 : score < 50 ? 1 : score < 75 ? 2 : score < 90 ? 3 : 4;
  const action = (["LOG_ONLY", "ALERT", "BLOCK", "QUARANTINE_ISOLATE", "EMERGENCY"] as const)[level];
  return { score, level, action };
}

export async function listAudit(): Promise<string[]> {
  return (await invokeSafe<string[]>("list_audit")) ?? ["UI fallback — vault local ainda não ligado"];
}
