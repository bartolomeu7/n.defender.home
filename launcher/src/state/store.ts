import type {
  EventItem,
  EvidenceRecord,
  Incident,
  IntelligenceRelease,
  SensorStatus,
  VpnStatus,
} from "../types/contracts";

export const sensors: SensorStatus[] = [
  { id: "wazuh", name: "Wazuh Agent", layer: "endpoint", state: "degraded", detail: "Aguardando manager local" },
  { id: "sysmon", name: "Sysmon", layer: "endpoint", state: "degraded", detail: "Config ainda não aplicada" },
  { id: "velociraptor", name: "Velociraptor", layer: "endpoint", state: "offline", detail: "Fase 2" },
  { id: "gateway", name: "OPNsense/OpenWrt", layer: "gateway", state: "degraded", detail: "Lê gateway-status.json" },
  { id: "wireguard", name: "WireGuard", layer: "gateway", state: "degraded", detail: "Serviço local ou status file" },
  { id: "suricata", name: "Suricata", layer: "network", state: "degraded", detail: "Lê network-status.json" },
  { id: "zeek", name: "Zeek", layer: "network", state: "degraded", detail: "Lê network-status.json" },
  { id: "cti", name: "MISP/OpenCTI", layer: "cti", state: "offline", detail: "Fase 5" },
  { id: "deception", name: "Honeypot VLAN", layer: "deception", state: "offline", detail: "Fase 6 — isolado" },
  { id: "vault", name: "Evidence Vault", layer: "vault", state: "normal", detail: "SQLite local pronto" },
];

export const events: EventItem[] = [
  { id: "e1", ts: "15:42", source: "policy", summary: "Launcher iniciado — modo A (PC único)", severity: 1 },
  { id: "e2", ts: "15:41", source: "updater", summary: "Nenhum release de regras ativo", severity: 2 },
  { id: "e3", ts: "15:40", source: "vpn", summary: "VPN offline — kill switch não armado", severity: 3 },
  { id: "e4", ts: "15:38", source: "wazuh", summary: "Agente não registrado no manager", severity: 4 },
];

export const incidents: Incident[] = [];

export const vpn: VpnStatus = {
  enabled: false,
  killSwitch: false,
  peer: "—",
  observedExit: "ISP (não mascarado)",
  handshakeOk: false,
  dnsThroughTunnel: false,
  ipv6Policy: "unknown",
};

export const evidence: EvidenceRecord[] = [
  { id: "v1", kind: "audit", label: "Boot audit — Fase 1", storedLocally: true },
];

export const release: IntelligenceRelease = {
  version: "none",
  minLauncher: "0.1.0",
  signed: false,
  hashValid: false,
  compatible: false,
  status: "rejected",
};

export function overallHealth(list: SensorStatus[]): "degraded" | "offline" | "protected" {
  const online = list.filter((s) => s.state === "protected" || s.state === "normal");
  if (online.length === 0) return "offline";
  if (online.length < list.length) return "degraded";
  return "protected";
}
