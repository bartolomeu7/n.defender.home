import type { RiskInput, RiskResult } from "../types/contracts";

export interface SensorCheck {
  id: string;
  name: string;
  state: string;
  detail: string;
}

export interface EndpointHealth {
  overall: string;
  host: string;
  checks: SensorCheck[];
}

export interface NexusEvent {
  id?: number;
  ts: string;
  source: string;
  host: string;
  event: string;
  summary: string;
  severity: number;
  image?: string | null;
  sha256?: string | null;
}

export interface IncidentRow {
  id: number;
  ts: string;
  title: string;
  score: number;
  action: string;
  source: string;
}

export interface GatewayHealth {
  overall: string;
  enabled: boolean;
  killSwitch: boolean;
  peer: string;
  interface: string;
  observedExit: string;
  handshakeOk: boolean;
  dnsThroughTunnel: boolean;
  ipv6Policy: string;
  source: string;
}

export interface NetworkHealth {
  overall: string;
  suricata: string;
  zeek: string;
  securityOnion: string;
  arkime: string;
  interface: string;
  homeNet: string;
  alertsLastHour: number;
  mode: string;
  source: string;
}

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

export async function fetchEndpointHealth(): Promise<EndpointHealth> {
  return (
    (await invokeSafe<EndpointHealth>("endpoint_health")) ?? {
      overall: "degraded",
      host: "ui-only",
      checks: [
        { id: "sysmon", name: "Sysmon", state: "offline", detail: "Abra o launcher Tauri no Windows" },
        { id: "wazuh", name: "Wazuh Agent", state: "offline", detail: "Abra o launcher Tauri no Windows" },
        { id: "vault", name: "Evidence Vault", state: "normal", detail: "UI fallback" },
        { id: "velociraptor", name: "Velociraptor", state: "offline", detail: "Opcional" },
      ],
    }
  );
}

export async function fetchEvents(): Promise<NexusEvent[]> {
  return (await invokeSafe<NexusEvent[]>("list_events")) ?? [];
}

export async function fetchIncidents(): Promise<IncidentRow[]> {
  return (await invokeSafe<IncidentRow[]>("list_incidents")) ?? [];
}

export async function recordFimTest(): Promise<NexusEvent | null> {
  return invokeSafe<NexusEvent>("record_fim_test");
}

export async function recordProcessTest(): Promise<NexusEvent | null> {
  return invokeSafe<NexusEvent>("record_process_test");
}

export async function fetchGatewayHealth(): Promise<GatewayHealth> {
  return (
    (await invokeSafe<GatewayHealth>("gateway_health")) ?? {
      overall: "offline",
      enabled: false,
      killSwitch: false,
      peer: "—",
      interface: "wg0",
      observedExit: "isp",
      handshakeOk: false,
      dnsThroughTunnel: false,
      ipv6Policy: "unknown",
      source: "ui-only",
    }
  );
}

export async function recordVpnCheck(): Promise<NexusEvent | null> {
  return invokeSafe<NexusEvent>("record_vpn_check");
}

export async function fetchNetworkHealth(): Promise<NetworkHealth> {
  return (
    (await invokeSafe<NetworkHealth>("network_health")) ?? {
      overall: "offline",
      suricata: "absent",
      zeek: "absent",
      securityOnion: "absent",
      arkime: "absent",
      interface: "—",
      homeNet: "—",
      alertsLastHour: 0,
      mode: "ids",
      source: "ui-only",
    }
  );
}

export async function recordIdsTest(): Promise<NexusEvent | null> {
  return invokeSafe<NexusEvent>("record_ids_test");
}
