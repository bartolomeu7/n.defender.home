use crate::adapters::endpoint::{self, EndpointHealth};
use crate::adapters::gateway::{self, GatewayHealth};
use crate::adapters::network::{self, NetworkHealth};
use crate::evidence::{self, IncidentRow, NexusEvent};
use crate::policy::{self, RiskInput, RiskResult};

#[tauri::command]
pub fn health_ping() -> String {
    let _ = evidence::append_audit("health_ping");
    "nexus-defender-core".into()
}

#[tauri::command]
pub fn score_risk(input: RiskInput) -> RiskResult {
    let result = policy::score(input);
    let _ = evidence::append_audit(&format!(
        "score_risk score={} action={}",
        result.score, result.action
    ));
    result
}

#[tauri::command]
pub fn list_audit() -> Vec<String> {
    evidence::list_audit(50).unwrap_or_default()
}

#[tauri::command]
pub fn forbidden_actions() -> Vec<String> {
    policy::FORBIDDEN.iter().map(|s| s.to_string()).collect()
}

#[tauri::command]
pub fn endpoint_health() -> EndpointHealth {
    let health = endpoint::probe();
    let _ = evidence::append_audit(&format!("endpoint_health {}", health.overall));
    health
}

#[tauri::command]
pub fn gateway_health() -> GatewayHealth {
    let health = gateway::probe();
    let _ = evidence::append_audit(&format!(
        "gateway_health {} ks={} hs={}",
        health.overall, health.kill_switch, health.handshake_ok
    ));
    health
}

#[tauri::command]
pub fn list_events() -> Vec<NexusEvent> {
    evidence::list_events(100).unwrap_or_default()
}

#[tauri::command]
pub fn list_incidents() -> Vec<IncidentRow> {
    evidence::list_incidents(50).unwrap_or_default()
}

#[tauri::command]
pub fn record_fim_test() -> Result<NexusEvent, String> {
    evidence::fim_test().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn record_process_test() -> Result<NexusEvent, String> {
    evidence::process_test().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn network_health() -> NetworkHealth {
    let health = network::probe();
    let _ = evidence::append_audit(&format!(
        "network_health {} suricata={} zeek={}",
        health.overall, health.suricata, health.zeek
    ));
    health
}

#[tauri::command]
pub fn record_ids_test() -> Result<NexusEvent, String> {
    let h = network::probe();
    let summary = format!(
        "Alerta de laboratório IDS mode={} suricata={} iface={}",
        h.mode, h.suricata, h.interface
    );
    evidence::network_alert(&summary, 5).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn record_vpn_check() -> Result<NexusEvent, String> {
    let h = gateway::probe();
    let severity = if h.handshake_ok && h.kill_switch { 2 } else { 6 };
    let summary = format!(
        "VPN {} peer={} ks={} dns={} ipv6={}",
        h.overall, h.peer, h.kill_switch, h.dns_through_tunnel, h.ipv6_policy
    );
    evidence::vpn_check(&summary, severity).map_err(|e| e.to_string())
}
