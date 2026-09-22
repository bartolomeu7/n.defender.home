export type HealthState = "protected" | "normal" | "degraded" | "offline" | "unknown";

export type ResponseAction =
  | "LOG_ONLY"
  | "ALERT"
  | "BLOCK"
  | "QUARANTINE_ISOLATE"
  | "EMERGENCY";

export type ModuleId =
  | "dashboard"
  | "network"
  | "endpoint"
  | "wifi"
  | "vpn"
  | "threats"
  | "evidence"
  | "intelligence"
  | "simulations";

export interface SensorStatus {
  id: string;
  name: string;
  layer: "endpoint" | "network" | "gateway" | "cti" | "deception" | "vault";
  state: HealthState;
  lastHeartbeat?: string;
  detail: string;
}

export interface EventItem {
  id: string;
  ts: string;
  source: "wazuh" | "sysmon" | "suricata" | "zeek" | "vpn" | "honeypot" | "updater" | "policy";
  summary: string;
  severity: number;
}

export interface Incident {
  id: string;
  title: string;
  score: number;
  action: ResponseAction;
  source: string;
  iocs: string[];
  evidenceIds: string[];
}

export interface VpnStatus {
  enabled: boolean;
  killSwitch: boolean;
  peer: string;
  observedExit: string;
  handshakeOk: boolean;
  dnsThroughTunnel: boolean;
  ipv6Policy: "tunneled" | "blocked" | "unknown";
  latencyMs?: number;
}

export interface EvidenceRecord {
  id: string;
  kind: "hash" | "timeline" | "artifact" | "pcap-ref" | "audit";
  label: string;
  sha256?: string;
  storedLocally: true;
}

export interface IntelligenceRelease {
  version: string;
  minLauncher: string;
  signed: boolean;
  hashValid: boolean;
  compatible: boolean;
  status: "active" | "staging" | "rejected" | "rolled_back";
}

export interface RiskInput {
  severity: number;
  confidence: number;
  repetition: number;
  assetCriticality: number;
  threatIntelMatch: number;
  allowlistBonus: number;
}

export interface RiskResult {
  score: number;
  level: 0 | 1 | 2 | 3 | 4;
  action: ResponseAction;
}

export const NAV: { id: ModuleId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "network", label: "Rede" },
  { id: "endpoint", label: "PC" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "vpn", label: "VPN" },
  { id: "threats", label: "Ameaças" },
  { id: "evidence", label: "Evidências" },
  { id: "intelligence", label: "Intelligence" },
  { id: "simulations", label: "Simulações" },
];
