# Arquitetura — NEXUS DEFENDER v1.0

Control plane separado dos motores. Respostas defensivas somente.

```
LAUNCHER (Tauri 2 + React/TS + Rust)
        |
        +-- SECURITY CORE   Wazuh / Sysmon / SQLite / Policy
        +-- NETWORK GW      OPNsense|OpenWrt / Suricata / Zeek / WireGuard
        +-- INTELLIGENCE    MISP / OpenCTI / Sigma / YARA / GitHub privado
        +-- DECEPTION       Cowrie / OpenCanary / T-Pot (VLAN isolada)
        +-- VAULT           hashes / timeline / audit / evidence (local)
```

## Modos
- **A — PC único (MVP):** launcher + Wazuh Agent + Sysmon + SQLite. Sem captura de toda a LAN.
- **B — Casa/rede (recomendado):** gateway OPNsense/OpenWrt + WireGuard + Suricata + DNS filtering.
- **C — SOC pessoal:** Security Onion + Zeek + Arkime + CTI em VMs + honeypots isolados.

## Fase atual
Fase 2 — Endpoint: Sysmon + Wazuh health checks + timeline de incidentes no vault local.
