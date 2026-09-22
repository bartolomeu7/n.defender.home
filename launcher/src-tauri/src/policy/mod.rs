use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RiskInput {
    pub severity: i32,
    pub confidence: i32,
    pub repetition: i32,
    pub asset_criticality: i32,
    pub threat_intel_match: i32,
    pub allowlist_bonus: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RiskResult {
    pub score: i32,
    pub level: u8,
    pub action: &'static str,
}

pub fn score(input: RiskInput) -> RiskResult {
    let raw = input.severity
        + input.confidence
        + input.repetition
        + input.asset_criticality
        + input.threat_intel_match
        - input.allowlist_bonus;
    let score = raw.clamp(0, 100);
    let (level, action) = match score {
        0..=24 => (0, "LOG_ONLY"),
        25..=49 => (1, "ALERT"),
        50..=74 => (2, "BLOCK"),
        75..=89 => (3, "QUARANTINE_ISOLATE"),
        _ => (4, "EMERGENCY"),
    };
    RiskResult {
        score,
        level,
        action,
    }
}

pub const FORBIDDEN: &[&str] = &[
    "exploit_third_party",
    "ddos",
    "credential_theft",
    "third_party_persistence",
    "exfiltrate_third_party",
    "offensive_counterattack",
];
