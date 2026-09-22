use crate::evidence;
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
