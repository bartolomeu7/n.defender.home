use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct NetworkHealth {
    pub overall: String,
    pub suricata: String,
    pub zeek: String,
    pub security_onion: String,
    pub arkime: String,
    pub interface: String,
    pub home_net: String,
    pub alerts_last_hour: i64,
    pub mode: String,
    pub source: String,
}

impl Default for NetworkHealth {
    fn default() -> Self {
        Self {
            overall: "offline".into(),
            suricata: "absent".into(),
            zeek: "absent".into(),
            security_onion: "absent".into(),
            arkime: "absent".into(),
            interface: "—".into(),
            home_net: "—".into(),
            alerts_last_hour: 0,
            mode: "ids".into(),
            source: "probe".into(),
        }
    }
}

fn nexus_root() -> PathBuf {
    if let Ok(custom) = std::env::var("NEXUS_ROOT") {
        return PathBuf::from(custom);
    }
    if cfg!(windows) {
        PathBuf::from(r"C:\NexusDefender")
    } else {
        PathBuf::from("/opt/nexus-defender")
    }
}

fn classify(h: &NetworkHealth) -> String {
    let sensors_up = [&h.suricata, &h.zeek]
        .iter()
        .filter(|s| **s == "running")
        .count();
    if sensors_up == 2 {
        "protected".into()
    } else if sensors_up == 1 || h.security_onion == "present" {
        "degraded".into()
    } else {
        "offline".into()
    }
}

pub fn probe() -> NetworkHealth {
    let path = nexus_root().join("network-status.json");
    if let Ok(raw) = std::fs::read_to_string(&path) {
        if let Ok(mut h) = serde_json::from_str::<NetworkHealth>(&raw) {
            h.source = "network-status.json".into();
            h.overall = classify(&h);
            return h;
        }
    }
    let mut h = NetworkHealth::default();
    if path.exists() {
        h.source = "unreadable-status".into();
        h.overall = "degraded".into();
    }
    h
}
